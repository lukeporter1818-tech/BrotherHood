import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDailyStory, seedForDate } from "@/lib/brief/daily";
import { checkTopics } from "@/lib/brief/guard";

// Node runtime — Prisma and the Anthropic SDK are not edge-compatible.
export const runtime = "nodejs";
// Never cache a cron handler. If someone opens this URL in a browser,
// behavior must match the cron invocation.
export const dynamic = "force-dynamic";
// Give the model + web_search a comfortable budget. Platform default is
// 300s on Pro/Fluid Compute, but we don't need anywhere near that.
export const maxDuration = 60;

function utcMidnightToday(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export async function GET(req: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    console.error("[cron/daily-brief] CRON_SECRET not configured");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const date = utcMidnightToday();

  // Idempotency — layer 1: application-level pre-check. Cheap, avoids
  // paying for a model call on a redundant trigger.
  const existing = await prisma.dailyBrief.findUnique({ where: { date } });
  if (existing) {
    return NextResponse.json({
      status: "already-generated",
      date: date.toISOString(),
      id: existing.id,
    });
  }

  const seed = seedForDate(date);

  // GUARD — pre-seed. TOPIC_SEEDS is hardcoded and nothing in it should
  // ever trip the pattern list, but running the check keeps the policy
  // visible in the route rather than relying on knowledge of the seed
  // list's contents.
  const seedGuard = checkTopics([seed]);
  if (seedGuard.blocked) {
    console.error("[cron/daily-brief] pre-seed guard blocked", { seed });
    return NextResponse.json(
      { error: "pre-seed guard blocked" },
      { status: 500 },
    );
  }

  let result;
  try {
    result = await generateDailyStory({ utcDate: date });
  } catch (err) {
    console.error("[cron/daily-brief] generation failed", err);
    return NextResponse.json(
      { error: "generation failed" },
      { status: 500 },
    );
  }

  // GUARD — post-output. The model's result is what every user on /home
  // will see tomorrow. If anything in the headline or blurb trips the
  // pattern list, we drop the row entirely — BriefPanel falls back to
  // its empty-default state rather than show an unsafe story.
  const outputGuard = checkTopics([
    result.payload.headline,
    result.payload.blurb,
  ]);
  if (outputGuard.blocked) {
    console.error("[cron/daily-brief] post-output guard blocked", {
      seed,
      headline: result.payload.headline,
    });
    return NextResponse.json(
      { error: "post-output guard blocked" },
      { status: 500 },
    );
  }

  try {
    const row = await prisma.dailyBrief.create({
      data: {
        date,
        headline: result.payload.headline,
        blurb: result.payload.blurb,
        url: result.payload.url,
        topicSeed: result.seed,
        model: result.model,
      },
    });
    return NextResponse.json({
      status: "generated",
      date: date.toISOString(),
      id: row.id,
    });
  } catch (err) {
    // Idempotency — layer 2: unique constraint on `date`. If two cron
    // fires race past the pre-check above, the second INSERT trips
    // P2002. We treat that as success — the day's story already exists.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: string }).code === "P2002"
    ) {
      const row = await prisma.dailyBrief.findUnique({ where: { date } });
      return NextResponse.json({
        status: "race-caught",
        date: date.toISOString(),
        id: row?.id,
      });
    }
    console.error("[cron/daily-brief] persist failed", err);
    return NextResponse.json({ error: "persist failed" }, { status: 500 });
  }
}
