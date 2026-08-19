import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a content safety classifier for a men's wellness community.

Classify the submitted text and return ONLY a JSON object with this shape:
{ "flag": boolean, "reason": string }

Set flag=true ONLY for these specific categories — nothing else:
1. Credible, imminent self-harm or suicide threats (e.g. "I have a plan to kill myself tonight")
2. Any first-person statement of intent to harm a named or identifiable person, including
   casual-sounding phrasing ("im going to kill Tom", "I'll hurt Jake"). The named target does
   not need to be a public figure and the threat does not need to include a plan or seem serious.
3. CSAM or sexual content involving minors

Set flag=false for everything else: profanity, venting, dark humor, political or religious content,
general negativity, ambiguous expressions of distress, or any edge case where you are uncertain.
When in doubt, allow it through.

reason: one short sentence explaining the call. If flag=false, reason can be "ok".`;

type ToxicityResult =
  | { flagged: false }
  | { flagged: true; reason: string }
  | { flagged: false; error: true };

export async function checkToxicity(text: string): Promise<ToxicityResult> {
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 64,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const raw =
      msg.content[0]?.type === "text" ? msg.content[0].text.trim() : "";

    // Strip markdown code fences if the model wraps the JSON
    const jsonStr = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(jsonStr) as { flag: boolean; reason: string };

    console.log("[toxicity] raw:", raw, "| parsed:", JSON.stringify(parsed));

    if (parsed.flag === true) {
      return { flagged: true, reason: parsed.reason ?? "Policy violation." };
    }
    return { flagged: false };
  } catch (err) {
    // API down, timeout, or parse error — fail open so the post goes through
    console.error("[toxicity] check failed, allowing post through", err);
    return { flagged: false, error: true };
  }
}
