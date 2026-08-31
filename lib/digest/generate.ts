import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, DIGEST_MODEL } from "@/lib/digest/anthropic";
import { DIGEST_SYSTEM_PROMPT, SAVE_DIGEST_TOOL } from "@/lib/digest/prompt";
import { DigestPayloadSchema, type DigestPayload } from "@/lib/digest/schema";

const MAX_WEB_SEARCHES = 12;
const MAX_TOKENS = 16_000;

export type DigestGenerationResult = {
  payload: DigestPayload;
  model: string;
};

export async function generateDigest({
  topics,
}: {
  topics: string[];
}): Promise<DigestGenerationResult> {
  if (topics.length === 0) {
    throw new Error("generateDigest called with no topics");
  }

  // Server-side web_search: Anthropic executes searches during the same API
  // call and injects results as web_search_tool_result blocks. The custom
  // save_digest is a client-side tool — we don't execute it, we just extract
  // its input as our structured payload. Single call handles the whole flow.
  const response = await anthropic.messages.create({
    model: DIGEST_MODEL,
    max_tokens: MAX_TOKENS,
    system: DIGEST_SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: MAX_WEB_SEARCHES,
      },
      SAVE_DIGEST_TOOL,
    ],
    messages: [
      {
        role: "user",
        content: `Generate a digest for these topics: ${topics.join(", ")}. Search current news for each, then call save_digest with the complete result.`,
      },
    ],
  });

  const saveCall = response.content.find(
    (b): b is Anthropic.ToolUseBlock =>
      b.type === "tool_use" && b.name === "save_digest",
  );
  if (!saveCall) {
    throw new Error(
      `Digest model did not call save_digest (stop_reason: ${response.stop_reason})`,
    );
  }

  const parsed = DigestPayloadSchema.safeParse(saveCall.input);
  if (!parsed.success) {
    throw new Error(
      `save_digest input failed validation: ${parsed.error.message}`,
    );
  }

  return { payload: parsed.data, model: DIGEST_MODEL };
}
