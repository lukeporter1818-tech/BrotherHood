import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { JoinLeaveButton } from "@/app/components/JoinLeaveButton";

export default async function SquadsListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [squads, myMemberships] = await Promise.all([
    prisma.squad.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        _count: { select: { memberships: true } },
      },
    }),
    user
      ? prisma.squadMembership.findMany({
          where: { userId: user.id },
          select: { squadId: true },
        })
      : Promise.resolve([]),
  ]);

  const memberIds = new Set(myMemberships.map((m) => m.squadId));

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Squads
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Private micro-communities. Join a squad to see and post inside it.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {squads.length === 0 && (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
            No squads yet.
          </div>
        )}
        {squads.map((squad) => {
          const isMember = memberIds.has(squad.id);
          return (
            <div
              key={squad.id}
              className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  {isMember ? (
                    <Link
                      href={`/squads/${squad.id}`}
                      className="text-lg font-semibold text-zinc-950 hover:underline dark:text-zinc-50"
                    >
                      {squad.name}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                      {squad.name}
                    </span>
                  )}
                  {squad.description && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {squad.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {squad._count.memberships}{" "}
                    {squad._count.memberships === 1 ? "member" : "members"}
                  </p>
                </div>
                <JoinLeaveButton squadId={squad.id} isMember={isMember} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
