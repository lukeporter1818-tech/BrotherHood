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
      <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
        Squads
      </h1>
      <p className="mt-1 text-navy-700 dark:text-parchment-200">
        Private micro-communities. Join a squad to see and post inside it.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {squads.length === 0 && (
          <div className="rounded border border-dashed border-parchment-200 p-8 text-center text-slate-500 dark:border-navy-700">
            No squads yet.
          </div>
        )}
        {squads.map((squad) => {
          const isMember = memberIds.has(squad.id);
          return (
            <div
              key={squad.id}
              className="rounded border border-parchment-200 bg-parchment-50 dark:border-navy-800 dark:bg-navy-900"
            >
              <div className="flex items-start justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  {isMember ? (
                    <Link
                      href={`/squads/${squad.id}`}
                      className="text-lg font-semibold text-navy-950 hover:underline dark:text-parchment-50"
                    >
                      {squad.name}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
                      {squad.name}
                    </span>
                  )}
                  {squad.description && (
                    <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
                      {squad.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-slate-500">
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
