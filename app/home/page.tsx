import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BriefPanel } from "@/app/home/BriefPanel";
import { InterestsForm } from "@/app/home/InterestsForm";
import { BriefPayloadSchema } from "@/lib/brief";

export const metadata = { title: "Home — Brotherhood" };

const QUICK_ACCESS = [
  {
    href: "/rooms",
    label: "Rooms",
    desc: "Post real or anon in the Locker Room",
  },
  {
    href: "/squads",
    label: "Squads",
    desc: "Private groups for your crew",
  },
  {
    href: "/bench",
    label: "The Bench",
    desc: "Talk to someone who's been there",
  },
  {
    href: "/checkin",
    label: "Daily 3",
    desc: "Sleep, mood, and movement",
  },
  {
    href: "/goose",
    label: "Goose",
    desc: "A quiet space to think out loud",
  },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { realName: true, anonHandle: true, interestTopics: true },
  });
  if (!dbUser) redirect("/login");

  const now = new Date();
  const utcToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [checkIn, benchProfile, activeBenchCount, recentPostCount, latestBrief] =
    await Promise.all([
      prisma.dailyCheckIn.findFirst({
        where: { userId: user.id, date: { gte: utcToday } },
        select: { id: true },
      }),
      prisma.benchProfile.findUnique({
        where: { userId: user.id },
        select: { id: true, role: true },
      }),
      prisma.benchMatch.count({
        where: {
          OR: [
            { mentorProfile: { userId: user.id } },
            { seekerProfile: { userId: user.id } },
          ],
          status: "ACTIVE",
        },
      }),
      prisma.post.count({
        where: {
          deletedAt: null,
          roomId: { not: null },
          createdAt: { gte: twentyFourHoursAgo },
        },
      }),
      prisma.brief.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, content: true },
      }),
    ]);

  // Brief.content is Prisma.Json — validate at the read boundary so the
  // client never sees a shape the panel isn't built to render.
  const parsedLatestBrief = latestBrief
    ? (() => {
        const parsed = BriefPayloadSchema.safeParse(latestBrief.content);
        return parsed.success
          ? { createdAt: latestBrief.createdAt, content: parsed.data }
          : null;
      })()
    : null;

  const displayName = dbUser.realName ?? dbUser.anonHandle;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-6 sm:py-10">
      {/* Greeting — full width above both columns */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          {greeting()}, {displayName}.
        </h1>
        <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
          Here&apos;s where things stand.
        </p>
      </div>

      {/* Two-column layout: Brief left, everything else right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[3fr_2fr]">

        {/* Left column: Brief panel */}
        <div>
          <BriefPanel
            latest={parsedLatestBrief}
            hasTopics={dbUser.interestTopics.length > 0}
          />
        </div>

        {/* Right column: Snapshot + Quick-access + Brief topics */}
        <div className="flex flex-col gap-8">

          {/* Personal snapshot */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Your snapshot
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {/* Daily 3 */}
              <div className="rounded border border-parchment-200 bg-parchment-100 p-4 dark:border-navy-800 dark:bg-navy-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Daily 3
                </p>
                {checkIn ? (
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-sm font-medium text-crimson-600">✓</span>
                    <span className="text-sm font-medium text-navy-950 dark:text-parchment-50">
                      Checked in today
                    </span>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
                    Not yet.{" "}
                    <Link
                      href="/checkin"
                      className="inline-block py-1 font-medium text-crimson-600 hover:text-crimson-700"
                    >
                      Take a minute →
                    </Link>
                  </p>
                )}
              </div>

              {/* Bench */}
              <div className="rounded border border-parchment-200 bg-parchment-100 p-4 dark:border-navy-800 dark:bg-navy-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  The Bench
                </p>
                {!benchProfile ? (
                  <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
                    <Link
                      href="/bench/profile"
                      className="inline-block py-1 font-medium text-crimson-600 hover:text-crimson-700"
                    >
                      Set up your profile →
                    </Link>
                  </p>
                ) : activeBenchCount > 0 ? (
                  <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
                    <Link
                      href="/bench"
                      className="inline-block py-1 font-medium text-crimson-600 hover:text-crimson-700"
                    >
                      {activeBenchCount} active{" "}
                      {activeBenchCount === 1 ? "conversation" : "conversations"} →
                    </Link>
                  </p>
                ) : benchProfile.role === "SEEKER" ? (
                  <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
                    <Link
                      href="/bench/browse"
                      className="inline-block py-1 font-medium text-crimson-600 hover:text-crimson-700"
                    >
                      Browse mentors →
                    </Link>
                  </p>
                ) : (
                  <p className="mt-2 text-sm font-medium text-navy-950 dark:text-parchment-50">
                    No active conversations yet
                  </p>
                )}
              </div>

              {/* Rooms pulse */}
              <div className="rounded border border-parchment-200 bg-parchment-100 p-4 dark:border-navy-800 dark:bg-navy-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Locker Room
                </p>
                {recentPostCount === 0 ? (
                  <p className="mt-2 text-sm font-medium text-navy-950 dark:text-parchment-50">
                    Quiet in the last 24h
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-navy-700 dark:text-parchment-200">
                    <Link
                      href="/rooms"
                      className="inline-block py-1 font-medium text-crimson-600 hover:text-crimson-700"
                    >
                      {recentPostCount}{" "}
                      {recentPostCount === 1 ? "post" : "posts"} in the last 24h →
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Quick-access cards */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Where to
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {QUICK_ACCESS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded border border-parchment-200 bg-parchment-50 p-4 transition-colors hover:border-navy-700 dark:border-navy-800 dark:bg-navy-900 dark:hover:border-navy-600"
                >
                  <p className="font-semibold text-navy-950 dark:text-parchment-50">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
                    {item.desc}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Brief topics */}
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Brief topics
            </h2>
            <div className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900">
              <InterestsForm initialTopics={dbUser.interestTopics} />
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
