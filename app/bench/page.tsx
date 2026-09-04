import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { AcceptDeclineButtons } from "@/app/bench/AcceptDeclineButtons";

const JOURNEY_LABELS: Record<string, string> = {
  SOBRIETY: "Sobriety",
  DIVORCE: "Divorce",
  GRIEF: "Grief",
  FATHERHOOD: "Fatherhood",
  MENTAL_HEALTH: "Mental health",
  CAREER_CHANGE: "Career change",
  OTHER: "Other",
};

export const metadata = { title: "The Bench — Brotherhood" };

export default async function BenchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.benchProfile.findUnique({
    where: { userId: user.id },
    include: { user: { select: { hoursListened: true } } },
  });

  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pt-8 pb-24 sm:pb-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
            The Bench
          </h1>
          <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
            Get paired with someone further along your journey — or volunteer to sit with someone just starting.
          </p>
        </div>
        <Link
          href="/bench/profile"
          className="self-start rounded-full bg-crimson-600 px-5 py-2 text-sm font-medium text-white hover:bg-crimson-700"
        >
          Create your Bench profile
        </Link>
      </div>
    );
  }

  const [asMentor, asSeeker] = await Promise.all([
    prisma.benchMatch.findMany({
      where: { mentorProfileId: profile.id },
      include: {
        seekerProfile: { include: { user: { select: { realName: true, anonHandle: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.benchMatch.findMany({
      where: { seekerProfileId: profile.id },
      include: {
        mentorProfile: { include: { user: { select: { realName: true, anonHandle: true, hoursListened: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const pendingRequests = asMentor.filter((m) => m.status === "PENDING");
  const activeAsMentor = asMentor.filter((m) => m.status === "ACTIVE");
  const activeAsSeeker = asSeeker.filter((m) => m.status === "ACTIVE");
  const pendingAsSeeker = asSeeker.filter((m) => m.status === "PENDING");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 pt-8 pb-24 sm:pb-8">
      <section>
        <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          The Bench
        </h1>
        <div className="mt-4 rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Your profile · {profile.role === "MENTOR" ? "Mentor" : "Seeker"}
              </p>
              <p className="mt-1 text-sm font-medium text-navy-950 dark:text-parchment-50">
                {JOURNEY_LABELS[profile.journey]} · {profile.stageText}
              </p>
              {profile.bio && (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-navy-700 dark:text-parchment-200">
                  {profile.bio}
                </p>
              )}
              {profile.role === "MENTOR" && profile.user.hoursListened > 0 && (
                <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                  🪑 On the Bench · {profile.user.hoursListened.toFixed(1)}h listened
                </p>
              )}
            </div>
            <Link
              href="/bench/profile"
              className="inline-flex items-center min-h-[44px] px-2 text-xs text-navy-700 hover:text-navy-950 dark:text-parchment-200 dark:hover:text-parchment-50"
            >
              Edit
            </Link>
          </div>
        </div>
        {profile.role === "SEEKER" && (
          <Link
            href="/bench/browse"
            className="mt-4 inline-block rounded-full bg-crimson-600 px-5 py-2 text-sm font-medium text-white hover:bg-crimson-700"
          >
            Browse mentors
          </Link>
        )}
      </section>

      {profile.role === "MENTOR" && pendingRequests.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Pending requests
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingRequests.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
              >
                <div>
                  <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.seekerProfile.user.anonHandle}
                  </p>
                  <p className="text-xs text-slate-500">{m.seekerProfile.stageText}</p>
                </div>
                <AcceptDeclineButtons matchId={m.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {(activeAsMentor.length > 0 || activeAsSeeker.length > 0) && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Active conversations
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {activeAsMentor.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/bench/match/${m.id}`}
                  className="block rounded border border-parchment-200 bg-parchment-50 p-4 hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    You&apos;re listening to
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.seekerProfile.user.anonHandle} · {m.seekerProfile.stageText}
                  </p>
                </Link>
              </li>
            ))}
            {activeAsSeeker.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/bench/match/${m.id}`}
                  className="block rounded border border-parchment-200 bg-parchment-50 p-4 hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Talking with
                  </p>
                  <p className="mt-1 text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.mentorProfile.user.anonHandle} · {m.mentorProfile.stageText}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.role === "SEEKER" && pendingAsSeeker.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-navy-950 dark:text-parchment-50">
            Waiting on a reply
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingAsSeeker.map((m) => (
              <li
                key={m.id}
                className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
              >
                <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                  {m.mentorProfile.user.anonHandle}
                </p>
                <p className="text-xs text-slate-500">
                  {m.mentorProfile.stageText} · waiting for them to accept
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
