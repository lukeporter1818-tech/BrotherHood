import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PostComposer } from "@/app/components/PostComposer";
import { ReportButton } from "@/app/components/ReportButton";
import { RoomIcon } from "@/app/components/RoomIcons";
import { ThreadEntry } from "@/app/components/ThreadEntry";

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
    <div className="mx-auto w-full max-w-3xl px-[18px] pt-6 pb-24 sm:px-6 sm:pb-10">
      <Link
        href="/rooms"
        className="hidden text-sm text-text-muted hover:text-text md:inline-block"
      >
        ← All rooms
      </Link>

      <div className="flex items-start gap-[19px]">
        <div
          className="flex h-[75px] w-[75px] shrink-0 items-center justify-center rounded-[16px] border border-border bg-signal/[0.07] text-signal"
          aria-hidden
        >
          <RoomIcon name={room.displayName} className="h-10 w-10" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[26px] font-bold text-text">
            {room.displayName}
          </h1>
          {room.description && (
            <p className="mt-1 line-clamp-2 max-w-[240px] text-[15px] leading-[19px] text-text-muted">
              {room.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-[11px]">
        <PostComposer roomSlug={room.slug} />
      </div>

      <div className="mt-4 border-b border-border">
        <div className="relative inline-block pb-2">
          <span className="text-[16px] font-medium text-text">Posts</span>
          <span className="absolute -bottom-px left-0 h-[2px] w-[54px] bg-signal" />
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-text-muted">
          No posts yet. Be first.
        </div>
      ) : (
        <ol className="divide-y divide-border border-b border-border">
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
                size={37}
                variant="solid"
                density="feed"
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
                <div className="relative z-10 mt-2 flex items-center gap-3 text-[14px]">
                  <span className="text-text-muted underline underline-offset-2">
                    {post._count.replies}{" "}
                    {post._count.replies === 1 ? "reply" : "replies"}
                  </span>
                  <span aria-hidden className="h-3 w-px bg-border" />
                  <span className="relative z-20">
                    <ReportButton targetType="POST" targetId={post.id} />
                  </span>
                </div>
              </ThreadEntry>
            );
          })}
        </ol>
      )}
    </div>
  );
}
