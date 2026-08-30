"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getAuthorizedMatch } from "@/lib/bench/matching";

const BODY_MIN = 1;
const BODY_MAX = 4096;

// Cap the Hours Listened heuristic at +1h per mentor per match per day so a
// single active thread can't inflate the badge past what a reasonable
// listening cadence looks like.
const HOURS_PER_MENTOR_MESSAGE = 0.1;
const DAILY_HOURS_CAP_PER_MATCH = 1.0;

type ActionResult = { error: string | null };

export async function requestMatch(mentorProfileId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const seekerProfile = await prisma.benchProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, role: true, journey: true, active: true },
  });
  if (!seekerProfile) return { error: "Create your Bench profile first." };
  if (seekerProfile.role !== "SEEKER") {
    return { error: "Only seekers can request a mentor." };
  }
  if (!seekerProfile.active) return { error: "Your profile is inactive." };

  const mentorProfile = await prisma.benchProfile.findUnique({
    where: { id: mentorProfileId },
    select: { id: true, role: true, journey: true, active: true },
  });
  if (!mentorProfile || mentorProfile.role !== "MENTOR" || !mentorProfile.active) {
    return { error: "Mentor is unavailable." };
  }
  if (mentorProfile.journey !== seekerProfile.journey) {
    return { error: "Journey mismatch." };
  }

  await prisma.benchMatch.upsert({
    where: {
      mentorProfileId_seekerProfileId: {
        mentorProfileId: mentorProfile.id,
        seekerProfileId: seekerProfile.id,
      },
    },
    update: {},
    create: {
      mentorProfileId: mentorProfile.id,
      seekerProfileId: seekerProfile.id,
    },
  });

  revalidatePath("/bench");
  revalidatePath("/bench/browse");
  return { error: null };
}

export async function acceptMatch(matchId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const match = await getAuthorizedMatch({ matchId, userId: user.id });
  if (!match) return { error: "Match not found." };
  if (match.mentorProfile.userId !== user.id) {
    return { error: "Only the mentor can accept." };
  }
  if (match.status !== "PENDING") return { error: "Match is not pending." };

  await prisma.benchMatch.update({
    where: { id: matchId },
    data: { status: "ACTIVE", acceptedAt: new Date() },
  });
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
  if (match.mentorProfile.userId !== user.id) {
    return { error: "Only the mentor can decline." };
  }
  if (match.status !== "PENDING") return { error: "Match is not pending." };

  await prisma.benchMatch.update({
    where: { id: matchId },
    data: { status: "DECLINED", endedAt: new Date() },
  });
  revalidatePath("/bench");
  return { error: null };
}

export type ClientBenchMessage = {
  id: string;
  senderId: string;
  content: string;
  identityUsed: "REAL" | "ANON";
  senderRealName: string | null;
  senderAnonHandle: string;
  createdAt: string;
};

export type SendBenchResult =
  | { error: string; message?: undefined }
  | { error: null; message: ClientBenchMessage };

export async function sendBenchMessage({
  matchId,
  content,
  identityUsed,
}: {
  matchId: string;
  content: string;
  identityUsed: "REAL" | "ANON";
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
  if (identityUsed !== "REAL" && identityUsed !== "ANON") {
    return { error: "Invalid identity." };
  }

  const match = await getAuthorizedMatch({ matchId, userId: user.id });
  if (!match) return { error: "Match not found." };
  if (match.status !== "ACTIVE") return { error: "Match is not active." };

  // Identity-lock guarantee: REAL requires realName present (never silently
  // downgrade to ANON — CLAUDE.md privacy invariant).
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { realName: true, anonHandle: true },
  });
  if (!dbUser) return { error: "Account not found." };
  if (identityUsed === "REAL" && !dbUser.realName) {
    return { error: "Add a real name to use this identity." };
  }

  const message = await prisma.benchMessage.create({
    data: {
      matchId,
      senderId: user.id,
      content: body,
      identityUsed,
    },
  });

  // Hours Listened heuristic: only mentor replies count, capped per match
  // per day.
  const isMentor = match.mentorProfile.userId === user.id;
  if (isMentor) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const mentorMessagesToday = await prisma.benchMessage.count({
      where: {
        matchId,
        senderId: user.id,
        createdAt: { gte: startOfDay },
      },
    });
    const wouldAdd = HOURS_PER_MENTOR_MESSAGE;
    const alreadyToday = (mentorMessagesToday - 1) * HOURS_PER_MENTOR_MESSAGE;
    if (alreadyToday + wouldAdd <= DAILY_HOURS_CAP_PER_MATCH) {
      await prisma.user.update({
        where: { id: user.id },
        data: { hoursListened: { increment: wouldAdd } },
      });
    }
  }

  revalidatePath(`/bench/match/${matchId}`);

  return {
    error: null,
    message: {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      identityUsed: message.identityUsed,
      senderRealName: dbUser.realName,
      senderAnonHandle: dbUser.anonHandle,
      createdAt: message.createdAt.toISOString(),
    },
  };
}
