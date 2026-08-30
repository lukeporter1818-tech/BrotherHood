import "server-only";
import { prisma } from "@/lib/prisma";

// Server-side membership check for a Bench match. Returns the match with both
// profiles + user info if the current user is one of the two parties, else
// null. Use on every read of /bench/match/[id] and every message write —
// mirror of the Squads membership pattern.
export async function getAuthorizedMatch({
  matchId,
  userId,
}: {
  matchId: string;
  userId: string;
}) {
  const match = await prisma.benchMatch.findUnique({
    where: { id: matchId },
    include: {
      mentorProfile: { include: { user: true } },
      seekerProfile: { include: { user: true } },
    },
  });
  if (!match) return null;
  if (
    match.mentorProfile.userId !== userId &&
    match.seekerProfile.userId !== userId
  ) {
    return null;
  }
  return match;
}

// Browsable mentor profiles for a seeker: active mentors in the same journey,
// excluding those the seeker has already requested (any status — pending,
// active, declined). Prevents ghost re-requests after a decline.
export async function browsableMentorsForSeeker({
  seekerProfileId,
  journey,
}: {
  seekerProfileId: string;
  journey:
    | "SOBRIETY"
    | "DIVORCE"
    | "GRIEF"
    | "FATHERHOOD"
    | "MENTAL_HEALTH"
    | "CAREER_CHANGE"
    | "OTHER";
}) {
  const existingMatches = await prisma.benchMatch.findMany({
    where: { seekerProfileId },
    select: { mentorProfileId: true },
  });
  const excludedMentorIds = existingMatches.map((m) => m.mentorProfileId);

  return prisma.benchProfile.findMany({
    where: {
      journey,
      role: "MENTOR",
      active: true,
      id: { notIn: excludedMentorIds },
    },
    include: { user: { select: { realName: true, anonHandle: true, hoursListened: true } } },
    orderBy: { createdAt: "desc" },
  });
}
