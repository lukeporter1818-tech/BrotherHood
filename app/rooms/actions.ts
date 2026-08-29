"use server";

// NOTE: file location is misleading — these actions handle BOTH room posts
// and squad posts (Post is polymorphic via nullable roomId/squadId).
// Future refactor: move to app/actions/posts.ts. Out of scope for the Squads
// demo build.

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkToxicity } from "@/lib/toxicity";

export type PostActionState = { error: string | null };

const BODY_MIN = 1;
const BODY_MAX = 2000;

function parseIdentity(raw: FormDataEntryValue | null): "REAL" | "ANON" | null {
  if (raw === "REAL" || raw === "ANON") return raw;
  return null;
}

async function requireAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, realName: true },
  });
  return dbUser;
}

async function isMember(userId: string, squadId: string) {
  const m = await prisma.squadMembership.findUnique({
    where: { userId_squadId: { userId, squadId } },
    select: { id: true },
  });
  return m !== null;
}

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const roomSlug = String(formData.get("roomSlug") ?? "").trim();
  const squadId = String(formData.get("squadId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const identity = parseIdentity(formData.get("identity"));

  if (!roomSlug && !squadId) return { error: "Missing target." };
  if (roomSlug && squadId) return { error: "Invalid target." };

  if (!identity) return { error: "Pick an identity before posting." };
  if (identity === "REAL" && !dbUser.realName) {
    return {
      error:
        "You haven't set a real name yet — switch to your anon handle or add a real name in your profile.",
    };
  }
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  let roomId: string | null = null;
  let resolvedSquadId: string | null = null;
  let revalidateTarget: string;

  if (squadId) {
    const squad = await prisma.squad.findUnique({
      where: { id: squadId },
      select: { id: true },
    });
    if (!squad) return { error: "Squad not found." };
    if (!(await isMember(dbUser.id, squad.id))) {
      return { error: "You're not a member of this squad." };
    }
    resolvedSquadId = squad.id;
    revalidateTarget = `/squads/${squad.id}`;
  } else {
    const room = await prisma.room.findUnique({
      where: { slug: roomSlug },
      select: { id: true, slug: true },
    });
    if (!room) return { error: "Room not found." };
    roomId = room.id;
    revalidateTarget = `/rooms/${room.slug}`;
  }

  const tox = await checkToxicity(body);
  if (tox.flagged) {
    return {
      error:
        "Your message was flagged before posting. If this is wrong, try rewording or contact support.",
    };
  }

  await prisma.post.create({
    data: {
      roomId,
      squadId: resolvedSquadId,
      userId: dbUser.id,
      identityUsed: identity,
      body,
    },
  });

  revalidatePath(revalidateTarget);
  return { error: null };
}

export async function createReply(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const postId = String(formData.get("postId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const identity = parseIdentity(formData.get("identity"));

  if (!postId) return { error: "Missing post." };
  if (!identity) return { error: "Pick an identity before replying." };
  if (identity === "REAL" && !dbUser.realName) {
    return {
      error:
        "You haven't set a real name yet — switch to your anon handle or add a real name in your profile.",
    };
  }
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      roomId: true,
      squadId: true,
      room: { select: { slug: true } },
    },
  });
  if (!post) return { error: "Post not found." };

  if (post.squadId) {
    if (!(await isMember(dbUser.id, post.squadId))) {
      return { error: "You're not a member of this squad." };
    }
  }

  const tox = await checkToxicity(body);
  if (tox.flagged) {
    return {
      error:
        "Your message was flagged before posting. If this is wrong, try rewording or contact support.",
    };
  }

  await prisma.reply.create({
    data: {
      postId: post.id,
      userId: dbUser.id,
      identityUsed: identity,
      body,
    },
  });

  const revalidateTarget = post.squadId
    ? `/squads/${post.squadId}/${post.id}`
    : `/rooms/${post.room?.slug ?? ""}/${post.id}`;
  revalidatePath(revalidateTarget);
  return { error: null };
}
