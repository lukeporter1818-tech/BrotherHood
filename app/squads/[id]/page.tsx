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
          className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
        >
          ← All squads
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          {squad.name}
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
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
      identityUsed: true,
      user: { select: { realName: true, anonHandle: true } },
      _count: { select: { replies: { where: { deletedAt: null } } } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <Link
        href="/squads"
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← All squads
      </Link>

      <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        {squad.name}
      </h1>
      {squad.description && (
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {squad.description}
        </p>
      )}
      <p className="mt-1 text-xs text-zinc-500">
        {squad._count.memberships}{" "}
        {squad._count.memberships === 1 ? "member" : "members"} · private
      </p>

      <div className="mt-6">
        <PostComposer squadId={squad.id} />
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
                href={`/squads/${squad.id}/${post.id}`}
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
