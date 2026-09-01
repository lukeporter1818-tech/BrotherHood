import "server-only";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

// Re-instantiated instead of imported from lib/goose/anthropic. Brief is a
// one-shot, non-safety-critical feature with a different tool-use pattern
// (web_search + custom save_brief tool). When a third Anthropic-consumer
// feature lands, extract lib/anthropic/ and consolidate.
export const anthropic = new Anthropic();

export const BRIEF_MODEL = "claude-sonnet-4-6";
