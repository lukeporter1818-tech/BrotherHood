import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { ReplyComposer } from "@/app/components/ReplyComposer";
import { ReportButton } from "@/app/components/ReportButton";
import { EditDeleteControls } from "@/app/components/EditDeleteControls";
import { Thread, ThreadEntry } from "@/app/components/ThreadEntry";

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

  let currentUserAnonHandle: string | null = null;
  if (user) {
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { anonHandle: true },
    });
    currentUserAnonHandle = profile?.anonHandle ?? "?";
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      body: true,
      userId: true,
      createdAt: true,
      editedAt: true,
      deletedAt: true,
      room: { select: { slug: true, displayName: true } },
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

  if (!post || !post.room || post.room.slug !== slug) notFound();

  const postDeleted = post.deletedAt !== null;
  const postEdited = wasEdited(post.createdAt, post.editedAt);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-24 sm:pb-10">
      <Link
        href={`/rooms/${slug}`}
        className="text-sm text-text-muted hover:text-text"
      >
        ← {post.room.displayName}
      </Link>

      {post.replies.length > 0 && (
        <h2 className="mt-6 mb-2 text-sm font-medium uppercase tracking-wide text-text-muted">
          {post.replies.length}{" "}
          {post.replies.length === 1 ? "reply" : "replies"}
        </h2>
      )}

      <div className="mt-4 rounded-lg border border-border bg-surface p-6">
        <Thread>
          <ThreadEntry
            key={post.id}
            author={
              user?.id === post.userId
                ? { kind: "self", anonHandle: currentUserAnonHandle ?? "?" }
                : {
                    kind: "other",
                    userId: post.userId,
                    label: post.user.anonHandle,
                  }
            }
            timestamp={post.createdAt}
            body={postDeleted ? "[This post was removed.]" : post.body}
            edited={postEdited}
            tone={postDeleted ? "removed" : "normal"}
          >
            {!postDeleted &&
              (user?.id === post.userId ? (
                <EditDeleteControls type="post" id={post.id} body={post.body} />
              ) : (
                <ReportButton targetType="POST" targetId={post.id} />
              ))}
          </ThreadEntry>

          {post.replies.map((reply) => {
            const replyDeleted = reply.deletedAt !== null;
            const replyEdited = wasEdited(reply.createdAt, reply.editedAt);
            return (
              <ThreadEntry
                key={reply.id}
                author={
                  user?.id === reply.userId
                    ? { kind: "self", anonHandle: currentUserAnonHandle ?? "?" }
                    : {
                        kind: "other",
                        userId: reply.userId,
                        label: reply.user.anonHandle,
                      }
                }
                timestamp={reply.createdAt}
                body={replyDeleted ? "[This reply was removed.]" : reply.body}
                edited={replyEdited}
                tone={replyDeleted ? "removed" : "normal"}
              >
                {!replyDeleted &&
                  (user?.id === reply.userId ? (
                    <EditDeleteControls
                      type="reply"
                      id={reply.id}
                      body={reply.body}
                    />
                  ) : (
                    <ReportButton targetType="REPLY" targetId={reply.id} />
                  ))}
              </ThreadEntry>
            );
          })}
        </Thread>
      </div>

      {!postDeleted && (
        <div className="mt-4">
          <ReplyComposer postId={post.id} />
        </div>
      )}
    </div>
  );
}
