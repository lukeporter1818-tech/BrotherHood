import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
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

export default async function SquadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const squad = await prisma.squad.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      _count: { select: { memberships: true } },
    },
  });
  if (!squad) notFound();

  const membership = await prisma.squadMembership.findUnique({
    where: { userId_squadId: { userId: user.id, squadId: squad.id } },
    select: { id: true },
  });
  if (!membership) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10">
        <Link
          href="/squads"
          className="text-sm text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          ← All squads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          {squad.name}
        </h1>
        <p className="mt-4 text-navy-700 dark:text-parchment-200">
          You need to join this squad to see its posts.
        </p>
      </div>
    );
  }

  const posts = await prisma.post.findMany({
    where: { squadId: squad.id, deletedAt: null },
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
        href="/squads"
        className="text-sm text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
      >
        ← All squads
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-navy-950 dark:text-parchment-50">
        {squad.name}
      </h1>
      {squad.description && (
        <p className="mt-1 text-navy-700 dark:text-parchment-200">
          {squad.description}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">
        {squad._count.memberships}{" "}
        {squad._count.memberships === 1 ? "member" : "members"} · private
      </p>

      <div className="mt-6">
        <PostComposer squadId={squad.id} />
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
                href={`/squads/${squad.id}/${post.id}`}
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
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-navy-950 dark:text-parchment-50">
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
