import { describe, it, expect } from "vitest";
import {
  isCrisisTripwire,
  _CRISIS_PHRASES_FOR_TESTS,
} from "@/lib/goose/tripwire";

describe("tripwire — every curated phrase triggers", () => {
  for (const phrase of _CRISIS_PHRASES_FOR_TESTS) {
    it(`triggers on curated phrase: "${phrase}"`, () => {
      expect(isCrisisTripwire(phrase)).toBe(true);
    });
  }
});

describe("tripwire — case insensitivity", () => {
  it("triggers on all-uppercase", () => {
    expect(isCrisisTripwire("KILL MYSELF")).toBe(true);
  });
  it("triggers on mixed case in a sentence", () => {
    expect(isCrisisTripwire("I want to Kill Myself tonight")).toBe(true);
  });
});

describe("tripwire — embedded in longer text", () => {
  it("triggers when the phrase is mid-sentence", () => {
    expect(
      isCrisisTripwire("honestly some days I want to die and it scares me"),
    ).toBe(true);
  });
  it("triggers with surrounding punctuation", () => {
    expect(isCrisisTripwire("...I want to die.")).toBe(true);
  });
});

describe("tripwire — benign inputs do NOT trigger", () => {
  const benignInputs = [
    "",
    "I'm dying to try that new restaurant",
    "Work is killing me this week",
    "My phone died again",
    "Traffic is murder today",
    "I feel really down and tired",
    "Long day at the job site, worn out",
    "Thinking about calling my brother",
    "life has been hard but I'm still here",
  ];
  for (const input of benignInputs) {
    it(`does not trigger on: "${input}"`, () => {
      expect(isCrisisTripwire(input)).toBe(false);
    });
  }
});
