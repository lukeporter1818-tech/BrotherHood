import { notFound, redirect } from "next/navigation";
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

export default async function SquadPostDetailPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id, postId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const membership = await prisma.squadMembership.findUnique({
    where: { userId_squadId: { userId: user.id, squadId: id } },
    select: { id: true },
  });
  if (!membership) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      body: true,
      userId: true,
      createdAt: true,
      editedAt: true,
      deletedAt: true,
      squadId: true,
      squad: { select: { id: true, name: true } },
      user: { select: { anonHandle: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          userId: true,
          createdAt: true,
          editedAt: true,
          deletedAt: true,
          user: { select: { anonHandle: true } },
        },
      },
    },
  });

  if (!post || post.squadId !== id || !post.squad) notFound();

  const postAuthor = post.user.anonHandle;

  const postDeleted = post.deletedAt !== null;
  const postEdited = wasEdited(post.createdAt, post.editedAt);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/squads/${id}`}
        className="text-sm text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
      >
        ← {post.squad.name}
      </Link>

      <article className="mt-4 rounded-lg border border-parchment-200 bg-parchment-50 dark:border-navy-800 dark:bg-navy-900">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-navy-800 dark:text-parchment-200">
              {postDeleted ? "[removed]" : postAuthor}
            </span>
            <span className="flex items-center gap-1">
              {formatWhen(post.createdAt)}
              {postEdited && (
                <span className="text-slate-400 dark:text-slate-600">· edited</span>
              )}
            </span>
          </div>
          <p
            className={`mt-3 whitespace-pre-wrap break-words ${
              postDeleted
                ? "italic text-slate-400 dark:text-slate-600"
                : "text-navy-950 dark:text-parchment-50"
            }`}
          >
            {postDeleted ? "[This post was removed.]" : post.body}
          </p>
          {!postDeleted && user.id === post.userId && (
            <EditDeleteControls type="post" id={post.id} body={post.body} />
          )}
        </div>
        {!postDeleted && (
          <div className="flex items-center justify-end border-t border-parchment-100 px-5 py-2 dark:border-navy-800">
            {user.id !== post.userId && (
              <ReportButton targetType="POST" targetId={post.id} />
            )}
          </div>
        )}
      </article>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          {post.replies.length}{" "}
          {post.replies.length === 1 ? "reply" : "replies"}
        </h2>

        <div className="flex flex-col gap-3">
          {post.replies.map((reply) => {
            const replyDeleted = reply.deletedAt !== null;
            const replyEdited = wasEdited(reply.createdAt, reply.editedAt);
            const author = reply.user.anonHandle;
            return (
              <div
                key={reply.id}
                className="rounded-lg border border-parchment-200 bg-parchment-50 dark:border-navy-800 dark:bg-navy-900"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-navy-800 dark:text-parchment-200">
                      {replyDeleted ? "[removed]" : author}
                    </span>
                    <span className="flex items-center gap-1">
                      {formatWhen(reply.createdAt)}
                      {replyEdited && (
                        <span className="text-slate-400 dark:text-slate-600">· edited</span>
                      )}
                    </span>
                  </div>
                  <p
                    className={`mt-2 whitespace-pre-wrap break-words text-sm ${
                      replyDeleted
                        ? "italic text-slate-400 dark:text-slate-600"
                        : "text-navy-950 dark:text-parchment-50"
                    }`}
                  >
                    {replyDeleted ? "[This reply was removed.]" : reply.body}
                  </p>
                  {!replyDeleted && user.id === reply.userId && (
                    <EditDeleteControls
                      type="reply"
                      id={reply.id}
                      body={reply.body}
                    />
                  )}
                </div>
                {!replyDeleted && user.id !== reply.userId && (
                  <div className="flex justify-end border-t border-parchment-100 px-4 py-2 dark:border-navy-800">
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
