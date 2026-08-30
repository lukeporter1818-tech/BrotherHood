"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const BIO_MAX = 500;
const STAGE_MAX = 100;

const JOURNEYS = [
  "SOBRIETY",
  "DIVORCE",
  "GRIEF",
  "FATHERHOOD",
  "MENTAL_HEALTH",
  "CAREER_CHANGE",
  "OTHER",
] as const;
type Journey = (typeof JOURNEYS)[number];

const ROLES = ["MENTOR", "SEEKER"] as const;
type Role = (typeof ROLES)[number];

export type ProfileFormState = { error: string | null };

export async function upsertBenchProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const journey = String(formData.get("journey") ?? "");
  const role = String(formData.get("role") ?? "");
  const stageText = String(formData.get("stageText") ?? "").trim();
  const bioRaw = String(formData.get("bio") ?? "").trim();

  if (!JOURNEYS.includes(journey as Journey)) {
    return { error: "Pick a journey." };
  }
  if (!ROLES.includes(role as Role)) {
    return { error: "Pick a role." };
  }
  if (stageText.length === 0) return { error: "Say where you are." };
  if (stageText.length > STAGE_MAX) {
    return { error: `Keep the stage under ${STAGE_MAX} characters.` };
  }
  if (bioRaw.length > BIO_MAX) {
    return { error: `Keep the bio under ${BIO_MAX} characters.` };
  }

  await prisma.benchProfile.upsert({
    where: { userId: user.id },
    update: {
      journey: journey as Journey,
      role: role as Role,
      stageText,
      bio: bioRaw || null,
      active: true,
    },
    create: {
      userId: user.id,
      journey: journey as Journey,
      role: role as Role,
      stageText,
      bio: bioRaw || null,
    },
  });

  revalidatePath("/bench");
  redirect("/bench");
}
