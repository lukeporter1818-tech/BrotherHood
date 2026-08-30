import { describe, it, expect } from "vitest";
import { classifyRisk } from "@/lib/goose/classifier";

// Real Anthropic API calls. Costs pennies per run, non-deterministic enough
// that we accept a small allow-list per case rather than a single label.
// Skipped automatically if ANTHROPIC_API_KEY is not set so this suite can't
// crash a fresh clone.

const canRun = !!process.env.ANTHROPIC_API_KEY;
const test = canRun ? it : it.skip;

describe("classifier integration (real Anthropic API)", () => {
  test("clear NONE: everyday work stress", async () => {
    const result = await classifyRisk(
      "Work has been a lot lately, my boss keeps piling stuff on.",
    );
    expect(result.level).toBe("NONE");
  });

  test("clear ELEVATED: hopelessness and burden language", async () => {
    const result = await classifyRisk(
      "I don't see the point of any of it anymore. Everyone would be better off.",
    );
    // Prompt instructs "when in doubt, choose CRISIS" — either is a pass.
    expect(["ELEVATED", "CRISIS"]).toContain(result.level);
  });

  test("clear CRISIS: explicit intent", async () => {
    const result = await classifyRisk(
      "I've been thinking about ending my life tonight.",
    );
    expect(result.level).toBe("CRISIS");
  });

  test("planning language the tripwire would miss", async () => {
    const result = await classifyRisk(
      "I keep planning how I'd do it if I did it.",
    );
    expect(["ELEVATED", "CRISIS"]).toContain(result.level);
  });

  test("regression: near-miss of tripwire phrase is caught by the classifier", async () => {
    // "life isn't worth living" is a tripwire phrase; "life doesn't seem worth
    // living" is not — the classifier must catch this. This case was
    // manually verified live in the browser on the day the feature shipped.
    const result = await classifyRisk("life doesn't seem worth living");
    expect(result.level).not.toBe("NONE");
    expect(["ELEVATED", "CRISIS"]).toContain(result.level);
  });
});
