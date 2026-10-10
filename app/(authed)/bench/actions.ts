"use server";
import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function setRoomAvailability(
  roomSlug: string,
  available: boolean,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const room = await prisma.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true },
  });
  if (!room) return { error: "Room not found." };

  if (available) {
    await prisma.roomAvailability.upsert({
      where: { userId_roomId: { userId: user.id, roomId: room.id } },
      update: {},
      create: { userId: user.id, roomId: room.id },
    });
  } else {
    await prisma.roomAvailability.deleteMany({
      where: { userId: user.id, roomId: room.id },
    });
  }

  revalidatePath("/bench");
  return { error: null };
}
