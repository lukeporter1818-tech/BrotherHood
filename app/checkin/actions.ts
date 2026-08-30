"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type CheckInActionState = { error: string | null; ok: boolean };

// Client sends its local calendar day as "YYYY-MM-DD". We store it as UTC
// midnight of that day so @db.Date round-trips cleanly regardless of where
// the server runs. Never derive the day from server-local time — the server
// clock is not the user's clock.
function parseLocalDay(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [y, m, d] = raw.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

export async function submitCheckIn(
  _prev: CheckInActionState,
  formData: FormData,
): Promise<CheckInActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in.", ok: false };

  const sleepHours = Number(formData.get("sleepHours"));
  const mood = Number(formData.get("mood"));
  const moved = formData.get("moved") === "on";
  const localDate = String(formData.get("localDate") ?? "");

  if (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 14) {
    return { error: "Sleep hours must be between 0 and 14.", ok: false };
  }
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
    return { error: "Mood must be 1–5.", ok: false };
  }

  const date = parseLocalDay(localDate);
  if (!date) {
    return {
      error: "Could not read today's date from your browser. Refresh and try again.",
      ok: false,
    };
  }

  try {
    await prisma.dailyCheckIn.upsert({
      where: { userId_date: { userId: user.id, date } },
      update: { sleepHours, mood, moved },
      create: { userId: user.id, sleepHours, mood, moved, date },
    });
  } catch {
    return { error: "Something went wrong. Try again in a moment.", ok: false };
  }

  revalidatePath("/checkin");
  return { error: null, ok: true };
}
