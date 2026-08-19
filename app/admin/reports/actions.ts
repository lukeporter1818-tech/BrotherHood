"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isAdmin: true },
  });
  return dbUser?.isAdmin ? user : null;
}

export async function dismissReport(reportId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  await prisma.report.update({
    where: { id: reportId },
    data: { status: "REVIEWED" },
  });

  revalidatePath("/admin/reports");
}

export async function removeContent(reportId: string): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) throw new Error("Unauthorized");

  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { targetType: true, postId: true, replyId: true },
  });
  if (!report) throw new Error("Report not found");

  const now = new Date();

  if (report.targetType === "POST" && report.postId) {
    // Soft-delete the post and all its replies
    await prisma.$transaction([
      prisma.post.update({
        where: { id: report.postId },
        data: { deletedAt: now },
      }),
      prisma.reply.updateMany({
        where: { postId: report.postId },
        data: { deletedAt: now },
      }),
      // Mark all reports against this post as reviewed
      prisma.report.updateMany({
        where: { postId: report.postId },
        data: { status: "REVIEWED" },
      }),
    ]);
  } else if (report.targetType === "REPLY" && report.replyId) {
    await prisma.$transaction([
      prisma.reply.update({
        where: { id: report.replyId },
        data: { deletedAt: now },
      }),
      prisma.report.updateMany({
        where: { replyId: report.replyId },
        data: { status: "REVIEWED" },
      }),
    ]);
  }

  revalidatePath("/admin/reports");
}
