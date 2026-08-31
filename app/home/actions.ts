"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateDigest as runDigest } from "@/lib/digest";

const MAX_TOPICS = 6;
const MAX_TOPIC_LEN = 40;

export type DigestActionState = { error: string | null };
export type InterestsActionState = { error: string | null };

// Preset topics — parallels Bench's journey enum: a curated primary list plus
// freeform additions. Kept in sync with InterestsForm.PRESETS.
const PRESET_TOPICS = [
  "AI",
  "Sports",
  "Movies",
  "Video Games",
  "Business",
  "Technology",
  "Politics",
  "Science",
] as const;

function normalizeTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export async function saveInterests(
  _prev: InterestsActionState,
  formData: FormData,
): Promise<InterestsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const presetsRaw = formData.getAll("preset").map(String);
  const freeformRaw = String(formData.get("freeform") ?? "");

  const presets = presetsRaw
    .map(normalizeTopic)
    .filter((t) => t.length > 0 && (PRESET_TOPICS as readonly string[]).includes(t));

  const freeform = freeformRaw
    .split(",")
    .map(normalizeTopic)
    .filter((t) => t.length > 0);

  // Dedupe (case-insensitive), preserving order: presets first, then freeform.
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const t of [...presets, ...freeform]) {
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    topics.push(t);
  }

  if (topics.length > MAX_TOPICS) {
    return { error: `Pick at most ${MAX_TOPICS} topics.` };
  }
  for (const t of topics) {
    if (t.length > MAX_TOPIC_LEN) {
      return { error: `Keep each topic under ${MAX_TOPIC_LEN} characters.` };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { interestTopics: topics },
  });

  revalidatePath("/home");
  return { error: null };
}

export async function generateDigest(): Promise<DigestActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { allowed } = checkRateLimit(user.id, "digest");
  if (!allowed) {
    return { error: "You've generated a digest recently. Try again in a few minutes." };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { interestTopics: true },
  });
  if (!dbUser) return { error: "Account not found." };
  if (dbUser.interestTopics.length === 0) {
    return { error: "Add at least one interest topic first." };
  }

  let result;
  try {
    result = await runDigest({ topics: dbUser.interestTopics });
  } catch (err) {
    console.error("[digest] generation failed", err);
    return {
      error:
        "Digest generation failed. This can happen if the search comes up empty — try again in a minute.",
    };
  }

  await prisma.digest.create({
    data: {
      userId: user.id,
      topics: dbUser.interestTopics,
      content: result.payload,
      model: result.model,
    },
  });

  revalidatePath("/home");
  return { error: null };
}
