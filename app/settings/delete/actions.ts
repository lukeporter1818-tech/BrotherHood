"use server";

import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/supabase/get-user";

export type DeleteAccountState = { error: string | null };

export async function deleteAccount(
  _prevState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  // Server-side confirmation check — the client-disabled button is UX only.
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm.trim() !== "DELETE") {
    return { error: "Please type DELETE to confirm." };
  }

  // Re-verify auth inside the action — page-level auth does not extend here.
  const authUser = await getAuthUser();
  if (!authUser) {
    return { error: "You are not signed in." };
  }
  const userId = authUser.id;

  // Order avoids FK violations and leaves the User row tombstoned so Posts
  // and Replies continue to render (as [deleted] via ThreadEntry).
  // Every step is idempotent, so retrying after an auth-delete failure is safe.
  try {
    await prisma.$transaction(async (tx) => {
      // Erase content this user authored before tombstoning the User row.
      // Posts with surviving replies from other users stay as [deleted] body
      // placeholders — deletedAt stays null so Room feeds keep them visible
      // and the children still have a parent to render under.
      const userPosts = await tx.post.findMany({
        where: { userId },
        select: { id: true },
      });
      const userPostIds = userPosts.map((p) => p.id);

      const userReplies = await tx.reply.findMany({
        where: { userId },
        select: { id: true },
      });
      const userReplyIds = userReplies.map((r) => r.id);

      const livingOthersReplies =
        userPostIds.length === 0
          ? []
          : await tx.reply.findMany({
              where: {
                postId: { in: userPostIds },
                userId: { not: userId },
                deletedAt: null,
              },
              select: { postId: true },
            });
      const postsToBlank = Array.from(
        new Set(livingOthersReplies.map((r) => r.postId)),
      );
      const blankSet = new Set(postsToBlank);
      const postsFullyDeletable = userPostIds.filter((id) => !blankSet.has(id));

      const sweptReplies =
        postsFullyDeletable.length === 0
          ? []
          : await tx.reply.findMany({
              where: {
                postId: { in: postsFullyDeletable },
                userId: { not: userId },
                deletedAt: { not: null },
              },
              select: { id: true },
            });
      const repliesToHardDelete = [
        ...userReplyIds,
        ...sweptReplies.map((r) => r.id),
      ];

      // One query covers reports on any touched reply (whose postId may be
      // set to the parent post) and reports on a touched post that aren't
      // tied to a specific reply. replyId: null guards reports on live
      // replies by others that sit on a post we're blanking.
      if (repliesToHardDelete.length > 0 || userPostIds.length > 0) {
        await tx.report.deleteMany({
          where: {
            OR: [
              { replyId: { in: repliesToHardDelete } },
              { postId: { in: userPostIds }, replyId: null },
            ],
          },
        });
      }

      if (repliesToHardDelete.length > 0) {
        await tx.reply.deleteMany({
          where: { id: { in: repliesToHardDelete } },
        });
      }
      if (postsFullyDeletable.length > 0) {
        await tx.post.deleteMany({
          where: { id: { in: postsFullyDeletable } },
        });
      }
      if (postsToBlank.length > 0) {
        await tx.post.updateMany({
          where: { id: { in: postsToBlank } },
          data: { body: "[deleted]" },
        });
      }

      await tx.report.deleteMany({ where: { reporterId: userId } });
      await tx.benchMessage.deleteMany({ where: { senderId: userId } });
      await tx.benchMatch.deleteMany({
        where: { OR: [{ initiatorId: userId }, { recipientId: userId }] },
      });
      await tx.wingmanSession.deleteMany({ where: { userId } });
      await tx.roomAvailability.deleteMany({ where: { userId } });
      await tx.brief.deleteMany({ where: { userId } });
      await tx.dailyCheckIn.deleteMany({ where: { userId } });
      await tx.user.update({
        where: { id: userId },
        data: {
          email: null,
          phone: null,
          anonHandle: `deleted_${userId}`,
          isAdmin: false,
          interestTopics: [],
        },
      });
    });
  } catch (err) {
    console.error("deleteAccount: DB transaction failed", err);
    return { error: "Deletion didn't finish, please try again." };
  }

  // Admin delete OUTSIDE the DB transaction so a Prisma error cannot orphan
  // the auth row. On failure the user stays authenticated and /settings/delete
  // remains reachable for retry.
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error("deleteAccount: auth.admin.deleteUser failed", error);
      return { error: "Deletion didn't finish, please try again." };
    }
  } catch (err) {
    console.error("deleteAccount: admin client error", err);
    return { error: "Deletion didn't finish, please try again." };
  }

  // Clear this browser's Supabase cookies. Local scope — the server-side
  // session is already revoked by the admin delete above.
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" }).catch(() => {});

  redirect("/login?deleted=1");
}
