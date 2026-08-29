import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ReplyComposer } from "@/app/components/ReplyComposer";
import { ReportButton } from "@/app/components/ReportButton";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
      createdAt: true,
      identityUsed: true,
      deletedAt: true,
      squadId: true,
      squad: { select: { id: true, name: true } },
      user: { select: { realName: true, anonHandle: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          identityUsed: true,
          deletedAt: true,
          user: { select: { realName: true, anonHandle: true } },
        },
      },
    },
  });

  if (!post || post.squadId !== id || !post.squad) notFound();

  const postAuthor =
    post.identityUsed === "REAL"
      ? (post.user.realName ?? "Unknown")
      : post.user.anonHandle;

  const postDeleted = post.deletedAt !== null;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/squads/${id}`}
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← {post.squad.name}
      </Link>

      <article className="mt-4 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {postDeleted ? "[removed]" : postAuthor}
            </span>
            <span>{formatWhen(post.createdAt)}</span>
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
        </div>
        {!postDeleted && (
          <div className="flex justify-end border-t border-zinc-100 px-5 py-2 dark:border-zinc-800">
            <ReportButton targetType="POST" targetId={post.id} />
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
                    <span>{formatWhen(reply.createdAt)}</span>
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
                </div>
                {!replyDeleted && (
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
