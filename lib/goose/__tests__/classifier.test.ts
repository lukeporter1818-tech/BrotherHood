import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/goose/anthropic", () => ({
  anthropic: {
    messages: {
      parse: vi.fn(),
      create: vi.fn(),
    },
  },
  CLASSIFIER_MODEL: "test-classifier-model",
  RESPONDER_MODEL: "test-responder-model",
}));

import { classifyRisk } from "@/lib/goose/classifier";
import { generateResponse } from "@/lib/goose/responder";
import { anthropic } from "@/lib/goose/anthropic";

const parseMock = vi.mocked(anthropic.messages.parse);
const createMock = vi.mocked(anthropic.messages.create);

beforeEach(() => {
  parseMock.mockReset();
  createMock.mockReset();
});

describe("classifyRisk — happy path", () => {
  it("returns the parsed output when the model produces valid structured output", async () => {
    parseMock.mockResolvedValue({
      parsed_output: {
        level: "ELEVATED",
        reason: "hopelessness cited",
      },
      stop_reason: "end_turn",
    } as never);

    const result = await classifyRisk("I feel hopeless");
    expect(result).toEqual({ level: "ELEVATED", reason: "hopelessness cited" });
  });
});

describe("classifyRisk — fallback safety guarantee", () => {
  it("falls back to ELEVATED (not NONE) when parsed_output is null", async () => {
    parseMock.mockResolvedValue({
      parsed_output: null,
      stop_reason: "max_tokens",
    } as never);

    const result = await classifyRisk("some text");
    expect(result.level).toBe("ELEVATED");
    expect(result.reason).toContain("fallback");
  });
});

describe("responder — no text blocks throws (folded in per plan)", () => {
  it("throws a descriptive error when the model returns zero text blocks", async () => {
    createMock.mockResolvedValue({
      content: [],
      stop_reason: "end_turn",
    } as never);

    await expect(
      generateResponse({
        history: [],
        userMessage: "hi",
        riskLevel: "NONE",
      }),
    ).rejects.toThrow(/no text content/);
  });
});
