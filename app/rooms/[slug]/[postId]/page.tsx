import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ReplyComposer } from "@/app/components/ReplyComposer";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string; postId: string }>;
}) {
  const { slug, postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      body: true,
      createdAt: true,
      identityUsed: true,
      room: { select: { slug: true, displayName: true } },
      user: { select: { realName: true, anonHandle: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          identityUsed: true,
          user: { select: { realName: true, anonHandle: true } },
        },
      },
    },
  });

  if (!post || post.room.slug !== slug) notFound();

  const postAuthor =
    post.identityUsed === "REAL"
      ? (post.user.realName ?? "Unknown")
      : post.user.anonHandle;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href={`/rooms/${slug}`}
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← {post.room.displayName}
      </Link>

      <article className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            {postAuthor}
          </span>
          <span>{formatWhen(post.createdAt)}</span>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-zinc-950 dark:text-zinc-50">
          {post.body}
        </p>
      </article>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          {post.replies.length}{" "}
          {post.replies.length === 1 ? "reply" : "replies"}
        </h2>

        <div className="flex flex-col gap-3">
          {post.replies.map((reply) => {
            const author =
              reply.identityUsed === "REAL"
                ? (reply.user.realName ?? "Unknown")
                : reply.user.anonHandle;
            return (
              <div
                key={reply.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {author}
                  </span>
                  <span>{formatWhen(reply.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-950 dark:text-zinc-50">
                  {reply.body}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <ReplyComposer postId={post.id} roomSlug={slug} />
        </div>
      </div>
    </div>
  );
}
