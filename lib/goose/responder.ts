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
      tools: [LOG_CHECKIN_TOOL],
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
