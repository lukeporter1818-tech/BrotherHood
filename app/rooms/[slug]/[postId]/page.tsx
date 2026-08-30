import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ReplyComposer } from "@/app/components/ReplyComposer";
import { ReportButton } from "@/app/components/ReportButton";
import { EditDeleteControls } from "@/app/components/EditDeleteControls";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const EDITED_THRESHOLD_MS = 5_000;

function wasEdited(createdAt: Date, editedAt: Date | null): boolean {
  return (
    editedAt !== null &&
    editedAt.getTime() - createdAt.getTime() > EDITED_THRESHOLD_MS
  );
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      body: true,
      userId: true,
      createdAt: true,
      editedAt: true,
      identityUsed: true,
      deletedAt: true,
      room: { select: { slug: true, displayName: true } },
      user: { select: { realName: true, anonHandle: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          userId: true,
          createdAt: true,
          editedAt: true,
          identityUsed: true,
          deletedAt: true,
          user: { select: { realName: true, anonHandle: true } },
        },
      },
    },
  });

  if (!post || !post.room || post.room.slug !== slug) notFound();

  const postAuthor =
    post.identityUsed === "REAL"
      ? (post.user.realName ?? "Unknown")
      : post.user.anonHandle;

  const postDeleted = post.deletedAt !== null;
  const postEdited = wasEdited(post.createdAt, post.editedAt);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/rooms/${slug}`}
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← {post.room.displayName}
      </Link>

      <article className="mt-4 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {postDeleted ? "[removed]" : postAuthor}
            </span>
            <span className="flex items-center gap-1">
              {formatWhen(post.createdAt)}
              {postEdited && (
                <span className="text-zinc-400 dark:text-zinc-600">· edited</span>
              )}
            </span>
          </div>
          <p
            className={`mt-3 whitespace-pre-wrap ${
              postDeleted
                ? "italic text-zinc-400 dark:text-zinc-600"
                : "text-zinc-950 dark:text-zinc-50"
            }`}
          >
            {postDeleted ? "[This post was removed.]" : post.body}
          </p>
          {!postDeleted && user?.id === post.userId && (
            <EditDeleteControls type="post" id={post.id} body={post.body} />
          )}
        </div>
        {!postDeleted && (
          <div className="flex items-center justify-end border-t border-zinc-100 px-5 py-2 dark:border-zinc-800">
            {user?.id !== post.userId && (
              <ReportButton targetType="POST" targetId={post.id} />
            )}
          </div>
        )}
      </article>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {post.replies.length}{" "}
          {post.replies.length === 1 ? "reply" : "replies"}
        </h2>

        <div className="flex flex-col gap-3">
          {post.replies.map((reply) => {
            const replyDeleted = reply.deletedAt !== null;
            const replyEdited = wasEdited(reply.createdAt, reply.editedAt);
            const author =
              reply.identityUsed === "REAL"
                ? (reply.user.realName ?? "Unknown")
                : reply.user.anonHandle;
            return (
              <div
                key={reply.id}
                className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {replyDeleted ? "[removed]" : author}
                    </span>
                    <span className="flex items-center gap-1">
                      {formatWhen(reply.createdAt)}
                      {replyEdited && (
                        <span className="text-zinc-400 dark:text-zinc-600">· edited</span>
                      )}
                    </span>
                  </div>
                  <p
                    className={`mt-2 whitespace-pre-wrap text-sm ${
                      replyDeleted
                        ? "italic text-zinc-400 dark:text-zinc-600"
                        : "text-zinc-950 dark:text-zinc-50"
                    }`}
                  >
                    {replyDeleted ? "[This reply was removed.]" : reply.body}
                  </p>
                  {!replyDeleted && user?.id === reply.userId && (
                    <EditDeleteControls
                      type="reply"
                      id={reply.id}
                      body={reply.body}
                    />
                  )}
                </div>
                {!replyDeleted && user?.id !== reply.userId && (
                  <div className="flex justify-end border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
                    <ReportButton targetType="REPLY" targetId={reply.id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!postDeleted && (
          <div className="mt-4">
            <ReplyComposer postId={post.id} />
          </div>
        )}
      </div>
    </div>
  );
}
