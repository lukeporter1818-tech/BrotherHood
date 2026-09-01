import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, BRIEF_MODEL } from "@/lib/brief/anthropic";
import { BRIEF_SYSTEM_PROMPT, SAVE_BRIEF_TOOL } from "@/lib/brief/prompt";
import { BriefPayloadSchema, type BriefPayload } from "@/lib/brief/schema";
import { BLOCKED_DOMAINS } from "@/lib/brief/sources";

const MAX_WEB_SEARCHES = 12;
const MAX_TOKENS = 16_000;

export type BriefGenerationResult = {
  payload: BriefPayload;
  model: string;
};

export async function generateBrief({
  topics,
}: {
  topics: string[];
}): Promise<BriefGenerationResult> {
  if (topics.length === 0) {
    throw new Error("generateBrief called with no topics");
  }

  // Server-side web_search: Anthropic executes searches during the same API
  // call and injects results as web_search_tool_result blocks. The custom
  // save_brief is a client-side tool — we don't execute it, we just extract
  // its input as our structured payload. Single call handles the whole flow.
  const response = await anthropic.messages.create({
    model: BRIEF_MODEL,
    max_tokens: MAX_TOKENS,
    system: BRIEF_SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: MAX_WEB_SEARCHES,
        blocked_domains: BLOCKED_DOMAINS,
      },
      SAVE_BRIEF_TOOL,
    ],
    messages: [
      {
        role: "user",
        content: `Generate a brief for these topics: ${topics.join(", ")}. Search current news for each, then call save_brief with the complete result.`,
      },
    ],
  });

  const saveCall = response.content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "save_brief",
  );
  if (!saveCall) {
    throw new Error(
      `Brief model did not call save_brief (stop_reason: ${response.stop_reason})`,
    );
  }

  const parsed = BriefPayloadSchema.safeParse(saveCall.input);
  if (!parsed.success) {
    throw new Error(
      `save_brief input failed validation: ${parsed.error.message}`,
    );
  }

  return { payload: parsed.data, model: BRIEF_MODEL };
}
