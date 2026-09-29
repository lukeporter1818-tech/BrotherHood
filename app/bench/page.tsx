import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AcceptDeclineButtons } from "@/app/bench/AcceptDeclineButtons";
import { AvailabilityToggles } from "@/app/bench/AvailabilityToggles";

export const metadata = { title: "The Bench — Brotherhood" };

export default async function BenchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [asInitiator, asRecipient, rooms, myAvailability] = await Promise.all([
    prisma.benchMatch.findMany({
      where: { initiatorId: user.id },
      include: { recipient: { select: { anonHandle: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.benchMatch.findMany({
      where: { recipientId: user.id },
      include: { initiator: { select: { anonHandle: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.room.findMany({
      select: { slug: true, displayName: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.roomAvailability.findMany({
      where: { userId: user.id },
      select: { room: { select: { slug: true } } },
    }),
  ]);

  const enabledSlugs = myAvailability.map((a) => a.room.slug);

  const pendingForMe = asRecipient.filter((m) => m.status === "PENDING");
  const pendingFromMe = asInitiator.filter((m) => m.status === "PENDING");
  const activeAsInitiator = asInitiator.filter((m) => m.status === "ACTIVE");
  const activeAsRecipient = asRecipient.filter((m) => m.status === "ACTIVE");
  const hasAny =
    pendingForMe.length + pendingFromMe.length + activeAsInitiator.length + activeAsRecipient.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 pt-8 pb-24 sm:pb-8">
      <section>
        <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          The Bench
        </h1>
        <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
          Private 1:1 connections — when Goose thinks you and another guy should talk, it&apos;ll offer to connect you here.
        </p>
      </section>

      {!hasAny && (
        <section>
          <p className="text-sm text-slate-500">
            No connections yet. Keep talking with{" "}
            <Link
              href="/goose"
              className="text-navy-700 underline hover:text-navy-950 dark:text-parchment-200 dark:hover:text-parchment-50"
            >
              Goose
            </Link>{" "}
            — when the time is right, it will offer to connect you with someone.
          </p>
        </section>
      )}

      {pendingForMe.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Pending — needs your response
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingForMe.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
              >
                <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                  {m.initiator.anonHandle}
                </p>
                <AcceptDeclineButtons matchId={m.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(activeAsInitiator.length > 0 || activeAsRecipient.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Active conversations
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {activeAsInitiator.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/bench/match/${m.id}`}
                  className="block rounded border border-parchment-200 bg-parchment-50 p-4 hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
                >
                  <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.recipient.anonHandle}
                  </p>
                </Link>
              </li>
            ))}
            {activeAsRecipient.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/bench/match/${m.id}`}
                  className="block rounded border border-parchment-200 bg-parchment-50 p-4 hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
                >
                  <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.initiator.anonHandle}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pendingFromMe.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Waiting on a reply
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingFromMe.map((m) => (
              <li
                key={m.id}
                className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
              >
                <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                  {m.recipient.anonHandle}
                </p>
                <p className="text-xs text-slate-500">waiting for them to accept</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
          Where you&apos;re open to connecting
        </h2>
        <p className="mt-1 mb-3 text-sm text-navy-700 dark:text-parchment-200">
          Turn on the rooms where you&apos;re willing to support someone who&apos;s going through it. Goose will only suggest you as a connection in rooms you&apos;ve enabled.
        </p>
        <AvailabilityToggles rooms={rooms} enabledSlugs={enabledSlugs} />
      </section>
    </div>
  );
}
