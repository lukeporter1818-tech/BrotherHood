import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostComposer } from "@/app/components/PostComposer";
import { ReportButton } from "@/app/components/ReportButton";
import { Thread, ThreadEntry } from "@/app/components/ThreadEntry";

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
      userId: true,
      body: true,
      createdAt: true,
      editedAt: true,
      user: { select: { anonHandle: true } },
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24 sm:pb-10">
      <Link
        href="/rooms"
        className="hidden text-sm text-text-muted hover:text-text md:inline-block"
      >
        ← All rooms
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-text">
        {room.displayName}
      </h1>
      {room.description && (
        <p className="mt-1 text-text-muted">{room.description}</p>
      )}

      <div className="mt-6">
        <PostComposer roomSlug={room.slug} />
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-text-muted">
          No posts yet. Be first.
        </div>
      ) : (
        <div className="mt-8">
          <Thread>
            {posts.map((post) => {
              const edited =
                post.editedAt !== null &&
                post.editedAt.getTime() - post.createdAt.getTime() >
                  EDITED_THRESHOLD_MS;
              return (
                <ThreadEntry
                  key={post.id}
                  author={{
                    kind: "other",
                    userId: post.userId,
                    label: post.user.anonHandle,
                  }}
                  timestamp={post.createdAt}
                  edited={edited}
                  body={
                    <Link
                      href={`/rooms/${room.slug}/${post.id}`}
                      className="block before:absolute before:inset-0 before:z-0 before:rounded-lg before:content-[''] before:transition-colors hover:before:bg-elevated/40"
                    >
                      <span className="relative z-10 whitespace-pre-wrap break-words">
                        {post.body}
                      </span>
                    </Link>
                  }
                >
                  <div className="relative z-10 flex items-center justify-between pt-2">
                    <span className="text-xs text-text-muted">
                      {post._count.replies}{" "}
                      {post._count.replies === 1 ? "reply" : "replies"}
                    </span>
                    <span className="relative z-20">
                      <ReportButton targetType="POST" targetId={post.id} />
                    </span>
                  </div>
                </ThreadEntry>
              );
            })}
          </Thread>
        </div>
      )}
    </div>
  );
}
