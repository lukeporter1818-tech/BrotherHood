import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostComposer } from "@/app/components/PostComposer";
import { ReportButton } from "@/app/components/ReportButton";

function formatWhen(d: Date) {
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = await prisma.room.findUnique({ where: { slug } });

  if (!room) notFound();

  const posts = await prisma.post.findMany({
    where: { roomId: room.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      body: true,
      createdAt: true,
      identityUsed: true,
      user: { select: { realName: true, anonHandle: true } },
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/rooms"
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← All rooms
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        {room.displayName}
      </h1>
      {room.description && (
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">{room.description}</p>
      )}

      <div className="mt-6">
        <PostComposer roomSlug={room.slug} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            No posts yet. Be first.
          </div>
        )}
        {posts.map((post) => {
          const author =
            post.identityUsed === "REAL"
              ? (post.user.realName ?? "Unknown")
              : post.user.anonHandle;
          return (
            <div
              key={post.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <Link
                href={`/rooms/${room.slug}/${post.id}`}
                className="block p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {author}
                  </span>
                  <span>{formatWhen(post.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-950 dark:text-zinc-50">
                  {post.body}
                </p>
              </Link>
              <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2 dark:border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {post._count.replies}{" "}
                  {post._count.replies === 1 ? "reply" : "replies"}
                </span>
                <ReportButton targetType="POST" targetId={post.id} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
