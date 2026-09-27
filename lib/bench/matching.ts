import "server-only";
import { prisma } from "@/lib/prisma";

// Server-side membership check for a Bench match. Returns the match with both
// parties' user info if the current user is one of the two, else null.
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
      initiator: true,
      recipient: true,
    },
  });
  if (!match) return null;
  if (match.initiatorId !== userId && match.recipientId !== userId) {
    return null;
  }
  return match;
}
