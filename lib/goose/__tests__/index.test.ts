import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/goose/tripwire", () => ({
  isCrisisTripwire: vi.fn(),
}));
vi.mock("@/lib/goose/classifier", () => ({
  classifyRisk: vi.fn(),
}));
vi.mock("@/lib/goose/responder", () => ({
  generateResponse: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    dailyCheckIn: {
      findUnique: vi.fn(),
    },
  },
}));

import { runGooseTurn } from "@/lib/goose";
import { isCrisisTripwire } from "@/lib/goose/tripwire";
import { classifyRisk } from "@/lib/goose/classifier";
import { generateResponse } from "@/lib/goose/responder";
import { prisma } from "@/lib/prisma";

const tripwireMock = vi.mocked(isCrisisTripwire);
const classifyMock = vi.mocked(classifyRisk);
const responderMock = vi.mocked(generateResponse);
const findCheckinMock = vi.mocked(prisma.dailyCheckIn.findUnique);

beforeEach(() => {
  tripwireMock.mockReset();
  classifyMock.mockReset();
  responderMock.mockReset();
  findCheckinMock.mockReset();
  findCheckinMock.mockResolvedValue(null);
  responderMock.mockResolvedValue("assistant response text");
});

describe("runGooseTurn — core safety guarantee", () => {
  it("tripwire hit skips the classifier entirely", async () => {
    tripwireMock.mockReturnValue(true);

    const result = await runGooseTurn({
      history: [],
      userMessage: "kill myself",
      userId: "test-user-id",
    });

    expect(classifyMock).not.toHaveBeenCalled();
    expect(result.riskLevel).toBe("CRISIS");
    expect(result.classifierReason).toBe("tripwire match");
    expect(result.escalated).toBe(true);
  });

  it("tripwire miss invokes the classifier with the user message", async () => {
    tripwireMock.mockReturnValue(false);
    classifyMock.mockResolvedValue({
      level: "NONE",
      reason: "normal conversation",
    });

    await runGooseTurn({
      history: [],
      userMessage: "I had a normal day",
      userId: "test-user-id",
    });

    expect(classifyMock).toHaveBeenCalledOnce();
    expect(classifyMock).toHaveBeenCalledWith("I had a normal day");
  });
});

describe("runGooseTurn — escalated flag is true iff CRISIS", () => {
  it("escalated is true for CRISIS", async () => {
    tripwireMock.mockReturnValue(false);
    classifyMock.mockResolvedValue({ level: "CRISIS", reason: "test" });

    const result = await runGooseTurn({
      history: [],
      userMessage: "x",
      userId: "test-user-id",
    });
    expect(result.escalated).toBe(true);
  });

  it("escalated is false for ELEVATED", async () => {
    tripwireMock.mockReturnValue(false);
    classifyMock.mockResolvedValue({ level: "ELEVATED", reason: "test" });

    const result = await runGooseTurn({
      history: [],
      userMessage: "x",
      userId: "test-user-id",
    });
    expect(result.escalated).toBe(false);
  });

  it("escalated is false for NONE", async () => {
    tripwireMock.mockReturnValue(false);
    classifyMock.mockResolvedValue({ level: "NONE", reason: "test" });

    const result = await runGooseTurn({
      history: [],
      userMessage: "x",
      userId: "test-user-id",
    });
    expect(result.escalated).toBe(false);
  });
});

describe("runGooseTurn — responder wiring", () => {
  it("passes history, userMessage, and classified riskLevel to the responder", async () => {
    tripwireMock.mockReturnValue(false);
    classifyMock.mockResolvedValue({ level: "ELEVATED", reason: "test" });

    const history = [{ role: "USER" as const, content: "prior message" }];
    await runGooseTurn({
      history,
      userMessage: "current message",
      userId: "test-user-id",
    });

    expect(responderMock).toHaveBeenCalledOnce();
    expect(responderMock).toHaveBeenCalledWith({
      history,
      userMessage: "current message",
      riskLevel: "ELEVATED",
      userId: "test-user-id",
      checkinPending: true,
    });
  });

  it("passes CRISIS to the responder when the tripwire fires", async () => {
    tripwireMock.mockReturnValue(true);

    await runGooseTurn({
      history: [],
      userMessage: "kill myself",
      userId: "test-user-id",
    });

    expect(responderMock).toHaveBeenCalledWith(
      expect.objectContaining({ riskLevel: "CRISIS" }),
    );
  });
});
