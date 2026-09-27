"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedMatch } from "@/lib/bench/matching";

const BODY_MIN = 1;
const BODY_MAX = 4096;

type ActionResult = { error: string | null };

export async function acceptMatch(matchId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const match = await getAuthorizedMatch({ matchId, userId: user.id });
  if (!match) return { error: "Match not found." };
  if (match.recipientId !== user.id) {
    return { error: "Only the recipient can accept." };
  }
  if (match.status !== "PENDING") return { error: "Match is not pending." };

  try {
    await prisma.benchMatch.update({
      where: { id: matchId },
      data: { status: "ACTIVE", acceptedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath("/bench");
  revalidatePath(`/bench/match/${matchId}`);
  return { error: null };
}

export async function declineMatch(matchId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const match = await getAuthorizedMatch({ matchId, userId: user.id });
  if (!match) return { error: "Match not found." };
  if (match.recipientId !== user.id) {
    return { error: "Only the recipient can decline." };
  }
  if (match.status !== "PENDING") return { error: "Match is not pending." };

  try {
    await prisma.benchMatch.update({
      where: { id: matchId },
      data: { status: "DECLINED", endedAt: new Date() },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath("/bench");
  return { error: null };
}

export type ClientBenchMessage = {
  id: string;
  senderId: string;
  content: string;
  senderAnonHandle: string;
  createdAt: string;
};

export type SendBenchResult =
  | { error: string; message?: undefined }
  | { error: null; message: ClientBenchMessage };

export async function sendBenchMessage({
  matchId,
  content,
}: {
  matchId: string;
  content: string;
}): Promise<SendBenchResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const body = content.trim();
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  const match = await getAuthorizedMatch({ matchId, userId: user.id });
  if (!match) return { error: "Match not found." };
  if (match.status !== "ACTIVE") return { error: "Match is not active." };

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { anonHandle: true },
  });
  if (!dbUser) return { error: "Account not found." };

  let message;
  try {
    message = await prisma.benchMessage.create({
      data: {
        matchId,
        senderId: user.id,
        content: body,
      },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment." };
  }

  revalidatePath(`/bench/match/${matchId}`);

  return {
    error: null,
    message: {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      senderAnonHandle: dbUser.anonHandle,
      createdAt: message.createdAt.toISOString(),
    },
  };
}
