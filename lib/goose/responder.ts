import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, RESPONDER_MODEL } from "@/lib/goose/anthropic";
import { GOOSE_SYSTEM_PROMPT } from "@/lib/goose/system-prompt";
import type { RiskLevel } from "@/lib/goose/classifier";

export type GooseTurn = {
  role: "USER" | "ASSISTANT";
  content: string;
};

export async function generateResponse({
  history,
  userMessage,
  riskLevel,
}: {
  history: GooseTurn[];
  userMessage: string;
  riskLevel: RiskLevel;
}): Promise<string> {
  const priorMessages: Anthropic.MessageParam[] = history.map((turn) => ({
    role: turn.role === "USER" ? "user" : "assistant",
    content: turn.content,
  }));

  const currentUserMessage: Anthropic.MessageParam = {
    role: "user",
    content: `[risk: ${riskLevel}]\n${userMessage}`,
  };

  const response = await anthropic.messages.create({
    model: RESPONDER_MODEL,
    max_tokens: 16000,
    cache_control: { type: "ephemeral" },
    system: GOOSE_SYSTEM_PROMPT,
    messages: [...priorMessages, currentUserMessage],
  });

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
