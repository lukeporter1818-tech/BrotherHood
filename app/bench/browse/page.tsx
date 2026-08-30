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
          className="text-xs text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
        >
          ← Back to Bench
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
          Mentors · {JOURNEY_LABELS[profile.journey]}
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Guys who&apos;ve been through this and volunteered to listen. Pick one to ask for a listen — they can accept or decline.
        </p>
      </div>

      {mentors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400">
          No mentors available in this journey yet. Check back soon.
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {mentors.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                    {m.user.anonHandle}
                  </p>
                  <p className="text-xs text-zinc-500">{m.stageText}</p>
                  {m.bio && (
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
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
