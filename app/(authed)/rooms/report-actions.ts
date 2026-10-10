"use server";

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export type ReportActionState = { error: string | null; ok: boolean };

const VALID_REASONS = [
  "Harassment",
  "Spam",
  "Self-harm risk",
  "Other",
] as const;

export async function createReport(
  _prev: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You need to be signed in.", ok: false };

  const targetType = formData.get("targetType");
  if (targetType !== "POST" && targetType !== "REPLY") {
    return { error: "Invalid target.", ok: false };
  }

  const postId =
    targetType === "POST" ? String(formData.get("targetId") ?? "") : null;
  const replyId =
    targetType === "REPLY" ? String(formData.get("targetId") ?? "") : null;
  const targetId = (postId ?? replyId ?? "").trim();
  if (!targetId) return { error: "Missing target.", ok: false };

  const reason = String(formData.get("reason") ?? "").trim();
  if (!(VALID_REASONS as readonly string[]).includes(reason)) {
    return { error: "Pick a reason.", ok: false };
  }

  // Verify target exists
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    if (!post) return { error: "Post not found.", ok: false };
    if (post.userId === user.id)
      return { error: "You can't report your own post.", ok: false };
  } else {
    const reply = await prisma.reply.findUnique({
      where: { id: targetId },
      select: { userId: true },
    });
    if (!reply) return { error: "Reply not found.", ok: false };
    if (reply.userId === user.id)
      return { error: "You can't report your own reply.", ok: false };
  }

  // Duplicate report from same user → silent no-op
  const existing = await prisma.report.findFirst({
    where: {
      reporterId: user.id,
      ...(postId ? { postId } : { replyId: replyId! }),
    },
    select: { id: true },
  });
  if (existing) return { error: null, ok: true };

  await prisma.report.create({
    data: {
      targetType,
      postId,
      replyId,
      reporterId: user.id,
      reason,
    },
  });

  return { error: null, ok: true };
}
