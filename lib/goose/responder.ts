import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, RESPONDER_MODEL } from "@/lib/goose/anthropic";
import { GOOSE_SYSTEM_PROMPT } from "@/lib/goose/system-prompt";
import type { RiskLevel } from "@/lib/goose/classifier";
import { prisma } from "@/lib/prisma";

export type GooseTurn = {
  role: "USER" | "ASSISTANT";
  content: string;
};

// Tool: log_checkin — invoked by Goose once it has both sleepHours and
// energyLevel from natural conversation. Upserts DailyCheckIn for today's
// UTC date; the (userId, date) unique constraint makes re-invocations
// idempotent. `moved` is intentionally not set (stays null) — Goose flow
// does not ask about movement.
const LOG_CHECKIN_TOOL: Anthropic.Tool = {
  name: "log_checkin",
  description:
    "Log the user's daily check-in with the sleep and energy values they gave you in conversation. Call this once you have both values naturally. Do not surface to the user that you're calling this — the log happens invisibly.",
  input_schema: {
    type: "object",
    properties: {
      sleepHours: {
        type: "number",
        description:
          "Hours of sleep the user reported for last night. Can be fractional (e.g. 6.5). Must be between 0 and 24.",
      },
      energyLevel: {
        type: "integer",
        description:
          "The user's reported energy level for today on a 1-5 scale.",
        minimum: 1,
        maximum: 5,
      },
    },
    required: ["sleepHours", "energyLevel"],
  },
};

// Tool: propose_connection — invoked by Goose ONLY after the user has
// explicitly confirmed in conversation they want to be connected with
// someone. Looks up a candidate who has opted in to help in the given
// room (ranked by fewest active matches to spread load), guards against
// creating a duplicate PENDING/ACTIVE match in either direction, and
// creates a BenchMatch with status PENDING for the recipient to accept
// or decline. Returns a structured result so Goose can respond honestly
// in conversation ("I reached out" vs "no one's free right now").
const PROPOSE_CONNECTION_TOOL: Anthropic.Tool = {
  name: "propose_connection",
  description:
    "Create a pending 1:1 connection between the current user and another user who has opted in to help on this topic. Call ONLY after the user has explicitly confirmed in conversation that they want you to try to connect them with someone. Returns whether a candidate was found and matched, or that no one is currently available.",
  input_schema: {
    type: "object",
    properties: {
      roomSlug: {
        type: "string",
        description:
          "Slug of the topic room this connection is about. Must be one of: sobriety, fatherhood, fitness, entrepreneurship, relationships, grief, faith, mental-health.",
      },
      context: {
        type: "string",
        description:
          "One or two sentences on why this connection is being offered. Stored on the BenchMatch and visible to both parties when the recipient decides whether to accept. Should be specific enough to give the recipient a real signal ('going through a divorce, first week') without being verbatim quotes from the conversation.",
      },
    },
    required: ["roomSlug", "context"],
  },
};

async function handleLogCheckin({
  userId,
  input,
}: {
  userId: string;
  input: unknown;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = input as { sleepHours?: unknown; energyLevel?: unknown };
  const sleepHours = Number(parsed.sleepHours);
  const energyLevel = Number(parsed.energyLevel);

  if (!Number.isFinite(sleepHours) || sleepHours < 0 || sleepHours > 24) {
    return { ok: false, error: "sleepHours must be a number between 0 and 24" };
  }
  if (!Number.isInteger(energyLevel) || energyLevel < 1 || energyLevel > 5) {
    return { ok: false, error: "energyLevel must be an integer 1-5" };
  }

  const now = new Date();
  const utcToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  await prisma.dailyCheckIn.upsert({
    where: { userId_date: { userId, date: utcToday } },
    update: { sleepHours, mood: energyLevel },
    create: { userId, date: utcToday, sleepHours, mood: energyLevel },
  });

  return { ok: true };
}

type ProposeConnectionResult =
  | { ok: false; error: string }
  | { ok: true; found: false; reason: "no_helpers" | "already_matched" }
  | { ok: true; found: true; matchId: string; roomSlug: string };

async function handleProposeConnection({
  userId,
  input,
}: {
  userId: string;
  input: unknown;
}): Promise<ProposeConnectionResult> {
  const parsed = input as { roomSlug?: unknown; context?: unknown };
  const roomSlug =
    typeof parsed.roomSlug === "string" ? parsed.roomSlug.trim() : "";
  const context =
    typeof parsed.context === "string" ? parsed.context.trim() : "";

  if (!roomSlug) return { ok: false, error: "roomSlug is required" };
  if (context.length < 5) {
    return { ok: false, error: "context is required (at least 5 chars)" };
  }
  if (context.length > 500) {
    return { ok: false, error: "context must be at most 500 chars" };
  }

  const room = await prisma.room.findUnique({
    where: { slug: roomSlug },
    select: { id: true, slug: true },
  });
  if (!room) return { ok: false, error: `unknown_room: ${roomSlug}` };

  // Candidate lookup: users who have opted in to help on this room,
  // excluding the current user.
  const availability = await prisma.roomAvailability.findMany({
    where: { roomId: room.id, userId: { not: userId } },
    select: { userId: true },
  });
  if (availability.length === 0) {
    return { ok: true, found: false, reason: "no_helpers" };
  }

  // Rank by ascending active-match count to spread load across helpers.
  // At MVP scale (small N) an N+1 is fine; can be swapped for a single
  // raw-SQL aggregate later.
  const candidatesWithCounts = await Promise.all(
    availability.map(async (a) => {
      const activeCount = await prisma.benchMatch.count({
        where: {
          status: "ACTIVE",
          OR: [{ initiatorId: a.userId }, { recipientId: a.userId }],
        },
      });
      return { userId: a.userId, activeCount };
    }),
  );
  candidatesWithCounts.sort((a, b) => a.activeCount - b.activeCount);

  // Duplicate-match guard: skip any candidate who already has a
  // PENDING or ACTIVE match with the initiator in either direction.
  for (const candidate of candidatesWithCounts) {
    const existing = await prisma.benchMatch.findFirst({
      where: {
        status: { in: ["PENDING", "ACTIVE"] },
        OR: [
          { initiatorId: userId, recipientId: candidate.userId },
          { initiatorId: candidate.userId, recipientId: userId },
        ],
      },
      select: { id: true },
    });
    if (existing) continue;

    const match = await prisma.benchMatch.create({
      data: {
        initiatorId: userId,
        recipientId: candidate.userId,
        context,
        status: "PENDING",
      },
      select: { id: true },
    });
    return { ok: true, found: true, matchId: match.id, roomSlug: room.slug };
  }

  // All candidates already have an existing match with this initiator.
  return { ok: true, found: false, reason: "already_matched" };
}

const MAX_TOOL_ITERATIONS = 3;

export async function generateResponse({
  history,
  userMessage,
  riskLevel,
  userId,
  checkinPending,
}: {
  history: GooseTurn[];
  userMessage: string;
  riskLevel: RiskLevel;
  userId: string;
  checkinPending: boolean;
}): Promise<string> {
  const priorMessages: Anthropic.MessageParam[] = history.map((turn) => ({
    role: turn.role === "USER" ? "user" : "assistant",
    content: turn.content,
  }));

  const messages: Anthropic.MessageParam[] = [
    ...priorMessages,
    {
      role: "user",
      content: `[risk: ${riskLevel}]\n[checkin: ${checkinPending ? "pending" : "done"}]\n${userMessage}`,
    },
  ];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const response = await anthropic.messages.create({
      model: RESPONDER_MODEL,
      max_tokens: 16000,
      cache_control: { type: "ephemeral" },
      system: GOOSE_SYSTEM_PROMPT,
      tools: [LOG_CHECKIN_TOOL, PROPOSE_CONNECTION_TOOL],
      messages,
    });

    if (response.stop_reason !== "tool_use") {
      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );
      if (textBlocks.length === 0) {
        throw new Error(
          `Goose responder returned no text content (stop_reason: ${response.stop_reason})`,
        );
      }
      return textBlocks.map((b) => b.text).join("\n\n");
    }

    // Tool-use turn — append assistant response, run tools, append results.
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type !== "tool_use") continue;
      if (block.name === "log_checkin") {
        const result = await handleLogCheckin({ userId, input: block.input });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.ok,
        });
      } else if (block.name === "propose_connection") {
        const result = await handleProposeConnection({
          userId,
          input: block.input,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
          is_error: !result.ok,
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: `Unknown tool: ${block.name}`,
          is_error: true,
        });
      }
    }
    messages.push({ role: "user", content: toolResults });
  }

  throw new Error(
    `Goose responder exceeded ${MAX_TOOL_ITERATIONS} tool-use iterations`,
  );
}
