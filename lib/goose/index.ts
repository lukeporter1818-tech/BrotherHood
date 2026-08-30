import "server-only";
import { isCrisisTripwire } from "@/lib/goose/tripwire";
import { classifyRisk, type RiskLevel } from "@/lib/goose/classifier";
import {
  generateResponse,
  type GooseTurn,
} from "@/lib/goose/responder";

export type { RiskLevel, GooseTurn };

export type GooseTurnResult = {
  assistantContent: string;
  riskLevel: RiskLevel;
  classifierReason: string;
  escalated: boolean;
};

// Full Goose pipeline for a single user turn. Called by the server action
// after the user's message is persisted. Returns everything the caller needs
// to (a) update the user message row with riskLevel, and (b) persist the
// assistant response row with the escalated flag.
//
// Pipeline (three layers):
//   1. Deterministic tripwire on the user message. Trip → CRISIS, skip
//      classifier. Cost/latency savings + belt-and-suspenders.
//   2. AI classifier (Haiku 4.5). Catches nuance the tripwire misses.
//   3. Main responder (Sonnet 4.6) sees the classified risk level via a
//      [risk: X] tag on the current user message. System prompt is static
//      so caching can attach to the prefix.
//
// `escalated` is true iff riskLevel === CRISIS — the moment that warrants
// human attention on the admin dashboard. ELEVATED shows resources as an
// option but is not itself an "escalation event."
export async function runGooseTurn({
  history,
  userMessage,
}: {
  history: GooseTurn[];
  userMessage: string;
}): Promise<GooseTurnResult> {
  let riskLevel: RiskLevel;
  let classifierReason: string;

  if (isCrisisTripwire(userMessage)) {
    riskLevel = "CRISIS";
    classifierReason = "tripwire match";
  } else {
    const classification = await classifyRisk(userMessage);
    riskLevel = classification.level;
    classifierReason = classification.reason;
  }

  const assistantContent = await generateResponse({
    history,
    userMessage,
    riskLevel,
  });

  return {
    assistantContent,
    riskLevel,
    classifierReason,
    escalated: riskLevel === "CRISIS",
  };
}
