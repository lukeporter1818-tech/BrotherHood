"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

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

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const roomSlug = String(formData.get("roomSlug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const identity = parseIdentity(formData.get("identity"));

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

  const room = await prisma.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true },
  });
  if (!room) return { error: "Room not found." };

  await prisma.post.create({
    data: {
      roomId: room.id,
      userId: dbUser.id,
      identityUsed: identity,
      body,
    },
  });

  revalidatePath(`/rooms/${roomSlug}`);
  return { error: null };
}

export async function createReply(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const postId = String(formData.get("postId") ?? "");
  const roomSlug = String(formData.get("roomSlug") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const identity = parseIdentity(formData.get("identity"));

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
    select: { id: true },
  });
  if (!post) return { error: "Post not found." };

  await prisma.reply.create({
    data: {
      postId: post.id,
      userId: dbUser.id,
      identityUsed: identity,
      body,
    },
  });

  revalidatePath(`/rooms/${roomSlug}/${postId}`);
  return { error: null };
}
