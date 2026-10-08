import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { BriefPanel } from "@/app/home/BriefPanel";
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
    select: { anonHandle: true },
  });
  if (!dbUser) redirect("/login");

  const now = new Date();
  const utcToday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const [latestBrief, dailyBrief] =
    await Promise.all([
      prisma.brief.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true, content: true },
      }),
      prisma.dailyBrief.findUnique({
        where: { date: utcToday },
        select: { headline: true, blurb: true, url: true },
      }),
    ]);

  const parsedLatestBrief = latestBrief
    ? (() => {
        const parsed = BriefPayloadSchema.safeParse(latestBrief.content);
        return parsed.success
          ? { createdAt: latestBrief.createdAt, content: parsed.data }
          : null;
      })()
    : null;

  const displayName = dbUser.anonHandle;

  return (
    <div className="mx-auto w-full max-w-5xl px-[18px] pt-1 pb-6 sm:px-6 sm:pt-10 sm:pb-10">
      <div className="mb-[21px]">
        <h1 className="text-[28px] font-semibold text-text sm:text-4xl">
          {greeting()}, {displayName}.
        </h1>
        <p className="mt-[2px] text-[18px] text-subhead">
          Here&apos;s where things stand.
        </p>
      </div>

      <BriefPanel latest={parsedLatestBrief} dailyBrief={dailyBrief} />
    </div>
  );
}
