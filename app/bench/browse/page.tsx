import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { browsableMentorsForSeeker } from "@/lib/bench/matching";
import { RequestButton } from "@/app/bench/browse/RequestButton";

const JOURNEY_LABELS: Record<string, string> = {
  SOBRIETY: "Sobriety",
  DIVORCE: "Divorce",
  GRIEF: "Grief",
  FATHERHOOD: "Fatherhood",
  MENTAL_HEALTH: "Mental health",
  CAREER_CHANGE: "Career change",
  OTHER: "Other",
};

export const metadata = { title: "Browse mentors — The Bench" };

export default async function BenchBrowsePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.benchProfile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) redirect("/bench/profile");
  if (profile.role !== "SEEKER") redirect("/bench");

  const mentors = await browsableMentorsForSeeker({
    seekerProfileId: profile.id,
    journey: profile.journey,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <div>
        <Link
          href="/bench"
          className="text-xs text-slate-500 hover:text-navy-950 dark:hover:text-parchment-50"
        >
          ← Back to Bench
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          Mentors · {JOURNEY_LABELS[profile.journey]}
        </h1>
        <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
          Guys who&apos;ve been through this and volunteered to listen. Pick one to ask for a listen — they can accept or decline.
        </p>
      </div>

      {mentors.length === 0 ? (
        <div className="rounded border border-dashed border-parchment-200 bg-parchment-50 p-6 text-center text-sm text-navy-700 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-200">
          No mentors available in this journey yet. Check back soon.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {mentors.map((m) => (
            <li
              key={m.id}
              className="rounded border border-parchment-200 bg-parchment-50 p-4 dark:border-navy-800 dark:bg-navy-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                    {m.user.anonHandle}
                  </p>
                  <p className="text-xs text-slate-500">{m.stageText}</p>
                  {m.bio && (
                    <p className="mt-2 text-sm text-navy-800 dark:text-parchment-200">
                      {m.bio}
                    </p>
                  )}
                  {m.user.hoursListened > 0 && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                      🪑 {m.user.hoursListened.toFixed(1)}h listened
                    </p>
                  )}
                </div>
                <RequestButton mentorProfileId={m.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
