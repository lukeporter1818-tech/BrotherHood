"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateBrief as runBrief } from "@/lib/brief";
import { checkTopics } from "@/lib/brief/guard";
import { BriefPayloadSchema } from "@/lib/brief";

const MAX_TOPIC_LEN = 40;
const CACHE_WINDOW_MS = 3 * 60 * 60 * 1000; // reuse identical topics for 3 hours

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

  // Fast path: news briefs aren't personal, so an identical topic generated
  // by anyone in the last few hours is reused instead of re-searching the web.
  const recent = await prisma.brief.findFirst({
    where: {
      topics: { equals: topics },
      createdAt: { gte: new Date(Date.now() - CACHE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
    select: { content: true, model: true },
  });
  if (recent) {
    const parsed = BriefPayloadSchema.safeParse(recent.content);
    if (parsed.success) {
      await prisma.brief.create({
        data: {
          userId: user.id,
          topics,
          content: parsed.data,
          model: recent.model,
        },
      });
      revalidatePath("/home");
      return { error: null };
    }
  }

  const { allowed } = checkRateLimit(user.id, "brief");
  if (!allowed) {
    return { error: "You've generated a brief recently. Try again in a few minutes." };
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
