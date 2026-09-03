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

const EDITED_THRESHOLD_MS = 5_000;

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
      editedAt: true,
      identityUsed: true,
      user: { select: { realName: true, anonHandle: true } },
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/rooms"
        className="text-sm text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
      >
        ← All rooms
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-navy-950 dark:text-parchment-50">
        {room.displayName}
      </h1>
      {room.description && (
        <p className="mt-1 text-navy-700 dark:text-parchment-200">{room.description}</p>
      )}

      <div className="mt-6">
        <PostComposer roomSlug={room.slug} />
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-parchment-200 p-8 text-center text-slate-500 dark:border-navy-700">
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
              className="rounded-lg border border-parchment-200 bg-parchment-50 dark:border-navy-800 dark:bg-navy-900"
            >
              <Link
                href={`/rooms/${room.slug}/${post.id}`}
                className="block p-4 transition-colors hover:bg-parchment-100 dark:hover:bg-navy-800"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-navy-800 dark:text-parchment-200">
                    {author}
                  </span>
                  <span className="flex items-center gap-1">
                    {formatWhen(post.createdAt)}
                    {post.editedAt !== null &&
                      post.editedAt.getTime() - post.createdAt.getTime() >
                        EDITED_THRESHOLD_MS && (
                        <span className="text-slate-400 dark:text-slate-600">
                          · edited
                        </span>
                      )}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-navy-950 dark:text-parchment-50">
                  {post.body}
                </p>
              </Link>
              <div className="flex items-center justify-between border-t border-parchment-100 px-4 py-2 dark:border-navy-800">
                <span className="text-xs text-slate-500">
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
