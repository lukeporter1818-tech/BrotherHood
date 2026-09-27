"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkToxicity } from "@/lib/toxicity";
import { checkRateLimit } from "@/lib/rate-limit";

export type PostActionState = { error: string | null };

const BODY_MIN = 1;
const BODY_MAX = 2000;

async function requireAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true },
  });
  return dbUser;
}

export async function createPost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const { allowed } = checkRateLimit(dbUser.id, "post");
  if (!allowed) return { error: "You're posting too quickly. Wait a moment." };

  const roomSlug = String(formData.get("roomSlug") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!roomSlug) return { error: "Missing room." };
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  const room = await prisma.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true, slug: true },
  });
  if (!room) return { error: "Room not found." };

  const tox = await checkToxicity(body);
  if (tox.flagged) {
    return {
      error:
        "Your message was flagged before posting. If this is wrong, try rewording or contact support.",
    };
  }

  try {
    await prisma.post.create({
      data: {
        roomId: room.id,
        userId: dbUser.id,
        body,
      },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${room.slug}`);
  return { error: null };
}

export async function createReply(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const { allowed } = checkRateLimit(dbUser.id, "post");
  if (!allowed) return { error: "You're replying too quickly. Wait a moment." };

  const postId = String(formData.get("postId") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!postId) return { error: "Missing post." };
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      room: { select: { slug: true } },
    },
  });
  if (!post) return { error: "Post not found." };

  const tox = await checkToxicity(body);
  if (tox.flagged) {
    return {
      error:
        "Your message was flagged before posting. If this is wrong, try rewording or contact support.",
    };
  }

  try {
    await prisma.reply.create({
      data: {
        postId: post.id,
        userId: dbUser.id,
        body,
      },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${post.room.slug}/${post.id}`);
  return { error: null };
}

export async function editPost(
  postId: string,
  newBody: string,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const body = newBody.trim();
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) return { error: `Keep it under ${BODY_MAX} characters.` };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      userId: true,
      deletedAt: true,
      room: { select: { slug: true } },
    },
  });
  if (!post || post.deletedAt !== null) return { error: "Post not found." };
  if (post.userId !== dbUser.id) return { error: "You can only edit your own posts." };

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { body, editedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${post.room.slug}`);
  revalidatePath(`/rooms/${post.room.slug}/${postId}`);
  return { error: null };
}

export async function deletePost(postId: string): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      userId: true,
      deletedAt: true,
      room: { select: { slug: true } },
    },
  });
  if (!post || post.deletedAt !== null) return { error: "Post not found." };
  if (post.userId !== dbUser.id) return { error: "You can only delete your own posts." };

  try {
    await prisma.post.update({
      where: { id: postId },
      data: { deletedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${post.room.slug}`);
  revalidatePath(`/rooms/${post.room.slug}/${postId}`);
  return { error: null };
}

export async function editReply(
  replyId: string,
  newBody: string,
): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const body = newBody.trim();
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) return { error: `Keep it under ${BODY_MAX} characters.` };

  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: {
      userId: true,
      deletedAt: true,
      post: {
        select: {
          id: true,
          room: { select: { slug: true } },
        },
      },
    },
  });
  if (!reply || reply.deletedAt !== null) return { error: "Reply not found." };
  if (reply.userId !== dbUser.id) return { error: "You can only edit your own replies." };

  try {
    await prisma.reply.update({
      where: { id: replyId },
      data: { body, editedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${reply.post.room.slug}/${reply.post.id}`);
  return { error: null };
}

export async function deleteReply(replyId: string): Promise<PostActionState> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) return { error: "You need to be signed in." };

  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: {
      userId: true,
      deletedAt: true,
      post: {
        select: {
          id: true,
          room: { select: { slug: true } },
        },
      },
    },
  });
  if (!reply || reply.deletedAt !== null) return { error: "Reply not found." };
  if (reply.userId !== dbUser.id) return { error: "You can only delete your own replies." };

  try {
    await prisma.reply.update({
      where: { id: replyId },
      data: { deletedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/rooms/${reply.post.room.slug}/${reply.post.id}`);
  return { error: null };
}
