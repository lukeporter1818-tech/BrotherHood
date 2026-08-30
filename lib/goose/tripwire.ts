// Deterministic keyword tripwire for CRISIS-level self-harm/suicide language.
// This is the first of three layers in Goose's risk detection stack; see
// lib/goose/index.ts for the full pipeline.
//
// Design principles:
// - False positives are cheap (user sees Crisis Rail resources they didn't ask
//   for). False negatives are catastrophic (missed crisis signal).
// - Substring match, case-insensitive. Simpler than regex, harder to break.
// - Curated conservatively. Prefer high-precision phrases over broad keywords
//   ("kill myself" — yes; "die" alone — no, too many benign uses).
// - This list is the *hard floor*. The AI classifier (layer 2) catches nuance
//   this list misses ("I don't see the point anymore").

const CRISIS_PHRASES: readonly string[] = [
  // Direct suicide statements
  "kill myself",
  "killing myself",
  "end my life",
  "ending my life",
  "take my own life",
  "taking my own life",
  "end it all",
  "want to die",
  "wanna die",
  "wish i was dead",
  "wish i were dead",
  "better off dead",
  "no reason to live",
  "no point in living",
  "don't want to be alive",
  "dont want to be alive",
  "don't want to live",
  "dont want to live",
  "life isn't worth living",
  "life isnt worth living",

  // Planning / method language
  "suicide plan",
  "planning to kill",
  "going to kill myself",
  "gonna kill myself",
  "how to kill myself",
  "ways to kill myself",

  // Explicit self-harm intent
  "hurt myself",
  "harm myself",
  "cut myself",
  "cutting myself",
];

export function isCrisisTripwire(userMessage: string): boolean {
  const normalized = userMessage.toLowerCase();
  return CRISIS_PHRASES.some((phrase) => normalized.includes(phrase));
}

// Exported for tests only. Do not import in application code.
export const _CRISIS_PHRASES_FOR_TESTS = CRISIS_PHRASES;
