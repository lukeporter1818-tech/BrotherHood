import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BriefPanel } from "@/app/home/BriefPanel";
import { StatusStrip } from "@/app/home/StatusStrip";
import { BriefPayloadSchema } from "@/lib/brief";

export const metadata = { title: "Home — Brotherhood" };

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

  const benchState = !benchProfile
    ? ({ kind: "no-profile" } as const)
    : activeBenchCount > 0
      ? ({ kind: "active", count: activeBenchCount } as const)
      : benchProfile.role === "SEEKER"
        ? ({ kind: "browse" } as const)
        : ({ kind: "idle" } as const);

  const displayName = dbUser.realName ?? dbUser.anonHandle;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-navy-950 dark:text-parchment-50">
          {greeting()}, {displayName}.
        </h1>
        <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
          Here&apos;s where things stand.
        </p>
      </div>

      <div className="mb-8">
        <StatusStrip
          dailyDone={!!checkIn}
          bench={benchState}
          recentPostCount={recentPostCount}
        />
      </div>

      <BriefPanel
        latest={parsedLatestBrief}
        hasTopics={dbUser.interestTopics.length > 0}
        interestTopics={dbUser.interestTopics}
      />
    </div>
  );
}
