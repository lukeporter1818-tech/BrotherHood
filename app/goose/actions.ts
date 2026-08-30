"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { runGooseTurn, type RiskLevel } from "@/lib/goose";

export type ClientMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  escalated: boolean;
  riskLevel: RiskLevel | null;
  createdAt: string;
};

export type SendResult =
  | { error: string; userMessage?: undefined; assistantMessage?: undefined }
  | {
      error: null;
      userMessage: ClientMessage;
      assistantMessage: ClientMessage;
    };

const BODY_MIN = 1;
const BODY_MAX = 4096;
const HISTORY_LIMIT = 19;

export async function sendGooseMessage(userText: string): Promise<SendResult> {
  const body = userText.trim();
  if (body.length < BODY_MIN) return { error: "Say something." };
  if (body.length > BODY_MAX) {
    return { error: `Keep it under ${BODY_MAX} characters.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  let session = await prisma.wingmanSession.findFirst({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });
  if (!session) {
    session = await prisma.wingmanSession.create({
      data: { userId: user.id },
      select: { id: true },
    });
  }

  const historyDesc = await prisma.wingmanMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { role: true, content: true },
  });
  const history = historyDesc.reverse();

  const userMessage = await prisma.wingmanMessage.create({
    data: {
      sessionId: session.id,
      role: "USER",
      content: body,
    },
  });

  let turnResult;
  try {
    turnResult = await runGooseTurn({ history, userMessage: body });
  } catch (err) {
    console.error("[goose] runGooseTurn failed", err);
    // Roll back the orphan user message so the conversation history isn't
    // polluted with an unanswered turn.
    await prisma.wingmanMessage.delete({ where: { id: userMessage.id } });
    return {
      error: "Goose is having trouble responding. Try again in a moment.",
    };
  }

  const updatedUserMessage = await prisma.wingmanMessage.update({
    where: { id: userMessage.id },
    data: { riskLevel: turnResult.riskLevel },
  });

  const assistantMessage = await prisma.wingmanMessage.create({
    data: {
      sessionId: session.id,
      role: "ASSISTANT",
      content: turnResult.assistantContent,
      escalated: turnResult.escalated,
    },
  });

  return {
    error: null,
    userMessage: {
      id: updatedUserMessage.id,
      role: "USER",
      content: updatedUserMessage.content,
      escalated: false,
      riskLevel: updatedUserMessage.riskLevel,
      createdAt: updatedUserMessage.createdAt.toISOString(),
    },
    assistantMessage: {
      id: assistantMessage.id,
      role: "ASSISTANT",
      content: assistantMessage.content,
      escalated: assistantMessage.escalated,
      riskLevel: null,
      createdAt: assistantMessage.createdAt.toISOString(),
    },
  };
}
