import "server-only";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

export const anthropic = new Anthropic();

export const CLASSIFIER_MODEL = "claude-haiku-4-5";
export const RESPONDER_MODEL = "claude-sonnet-4-6";
