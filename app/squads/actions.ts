"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// Post/reply creation for squads is handled by the polymorphic createPost /
// createReply in app/rooms/actions.ts. This file owns squad membership only.

export type MembershipActionState = { error: string | null };

async function requireAuthedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id };
}

export async function joinSquad(squadId: string): Promise<void> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) throw new Error("Not signed in");

  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    select: { id: true },
  });
  if (!squad) throw new Error("Squad not found");

  await prisma.squadMembership.upsert({
    where: { userId_squadId: { userId: dbUser.id, squadId } },
    update: {},
    create: { userId: dbUser.id, squadId },
  });

  revalidatePath("/squads");
  revalidatePath(`/squads/${squadId}`);
}

export async function leaveSquad(squadId: string): Promise<void> {
  const dbUser = await requireAuthedUser();
  if (!dbUser) throw new Error("Not signed in");

  await prisma.squadMembership.deleteMany({
    where: { userId: dbUser.id, squadId },
  });

  revalidatePath("/squads");
  revalidatePath(`/squads/${squadId}`);
}
