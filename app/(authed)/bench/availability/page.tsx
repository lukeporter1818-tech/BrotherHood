import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/get-user";
import { prisma } from "@/lib/prisma";
import { AvailabilityToggles } from "@/app/(authed)/bench/AvailabilityToggles";

export const metadata = { title: "The Bench — Brotherhood" };

export default async function AvailabilityPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const [rooms, myAvailability] = await Promise.all([
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7 px-[18px] pt-0 pb-24 sm:px-6 sm:pt-8 sm:pb-8">
      <section>
        <h1 className="text-[28px] font-semibold text-text">The Bench</h1>
        <p className="mt-[2px] text-[16px] leading-[22px] text-subhead">
          Choose where you&apos;re open to connecting.
        </p>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-signal">
          Where you&apos;re open to connecting
        </h2>
        <p className="mt-2 mb-3 text-[14px] leading-[20px] text-subhead">
          Turn on the rooms where you&apos;re willing to support someone who&apos;s going through it. Goose will only suggest you as a connection in rooms you&apos;ve enabled.
        </p>
        <AvailabilityToggles rooms={rooms} enabledSlugs={enabledSlugs} />
      </section>
    </div>
  );
}
