import "server-only";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, CLASSIFIER_MODEL } from "@/lib/goose/anthropic";

export type RiskLevel = "NONE" | "ELEVATED" | "CRISIS";

const RiskClassificationSchema = z.object({
  level: z.enum(["NONE", "ELEVATED", "CRISIS"]),
  reason: z
    .string()
    .describe(
      "One short sentence explaining the classification. Cite the language you flagged.",
    ),
});

const CLASSIFIER_SYSTEM_PROMPT = `You are a safety classifier for a men's mental health support chat. Your only job is to score the risk level of a single user message.

Return one of three levels:

- **NONE** — Normal conversation. Venting, frustration, everyday stress, relationship complaints, work problems. Even strong negative emotion (anger, sadness, fatigue) is NONE if there is no signal of self-harm intent or profound hopelessness.

- **ELEVATED** — The user expresses hopelessness, feeling trapped, disconnection from meaning, feeling like a burden, or subtle passive ideation ("I don't see the point anymore", "everyone would be better off without me", "I'm done trying"). No explicit self-harm intent, but the emotional signal is high enough that a supportive check-in on safety is warranted.

- **CRISIS** — The user expresses intent to end their life, harm themselves, or describes an active crisis. Any explicit self-harm/suicide language. When in doubt between ELEVATED and CRISIS, choose CRISIS.

Err on the side of higher risk. False positives are cheap; false negatives can be catastrophic.`;

export async function classifyRisk(userMessage: string): Promise<{
  level: RiskLevel;
  reason: string;
}> {
  const response = await anthropic.messages.parse({
    model: CLASSIFIER_MODEL,
    max_tokens: 256,
    system: CLASSIFIER_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    output_config: {
      format: zodOutputFormat(RiskClassificationSchema),
    },
  });

  if (!response.parsed_output) {
    // Model returned unparseable output. Fail closed to ELEVATED — safer than
    // NONE, less disruptive than CRISIS. Log so we can catch drift.
    console.warn("[goose] classifier returned unparseable output", {
      stop_reason: response.stop_reason,
    });
    return { level: "ELEVATED", reason: "classifier fallback (unparseable)" };
  }

  return response.parsed_output;
}
