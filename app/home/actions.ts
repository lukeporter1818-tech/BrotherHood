"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateBrief as runBrief } from "@/lib/brief";
import { checkTopics } from "@/lib/brief/guard";

const MAX_TOPIC_LEN = 40;

export type BriefActionState = { error: string | null };

function normalizeTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export async function generateBrief(topic: string): Promise<BriefActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { allowed } = checkRateLimit(user.id, "brief");
  if (!allowed) {
    return { error: "You've generated a brief recently. Try again in a few minutes." };
  }

  const normalized = normalizeTopic(topic);
  if (!normalized) return { error: "Enter a topic to search." };
  if (normalized.length > MAX_TOPIC_LEN) {
    return { error: `Keep the topic under ${MAX_TOPIC_LEN} characters.` };
  }
  const topics = [normalized];

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
