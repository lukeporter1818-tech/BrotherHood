"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateBrief as runBrief } from "@/lib/brief";
import { checkTopics } from "@/lib/brief/guard";

const MAX_TOPICS = 6;
const MAX_TOPIC_LEN = 40;

export type BriefActionState = { error: string | null };
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

export async function generateBrief(customTopic?: string): Promise<BriefActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { allowed } = checkRateLimit(user.id, "brief");
  if (!allowed) {
    return { error: "You've generated a brief recently. Try again in a few minutes." };
  }

  // Resolve topics: one-off custom topic, or fall back to saved interests.
  let topics: string[];
  if (customTopic?.trim()) {
    const normalized = normalizeTopic(customTopic);
    if (normalized.length > MAX_TOPIC_LEN) {
      return { error: `Keep the topic under ${MAX_TOPIC_LEN} characters.` };
    }
    topics = [normalized];
  } else {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { interestTopics: true },
    });
    if (!dbUser) return { error: "Account not found." };
    if (dbUser.interestTopics.length === 0) {
      return { error: "Add at least one interest topic first." };
    }
    topics = dbUser.interestTopics;
  }

  // Content guard — runs before any API call so bad topics fail fast.
  const guard = checkTopics(topics);
  if (guard.blocked) {
    return { error: guard.reason };
  }

  let result;
  try {
    result = await runBrief({ topics });
  } catch (err) {
    console.error("[brief] generation failed", err);
    return {
      error:
        "Brief generation failed. This can happen if the search comes up empty — try again in a minute.",
    };
  }

  await prisma.brief.create({
    data: {
      userId: user.id,
      topics,
      content: result.payload,
      model: result.model,
    },
  });

  revalidatePath("/home");
  return { error: null };
}
