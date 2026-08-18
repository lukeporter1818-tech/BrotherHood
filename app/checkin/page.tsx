import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { CheckInForm } from "@/app/components/CheckInForm";
import { WellnessGraph } from "@/app/components/WellnessGraph";

function utcMidnight(now: Date = new Date()): Date {
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function CheckInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Query a wider window than the graph shows: +1 day forward to catch users
  // whose local day is ahead of UTC, and -1 day back for the mirror case.
  // The client uses its own local day to pick "today" out of this map.
  const utcToday = utcMidnight();
  const queryEnd = new Date(utcToday);
  queryEnd.setUTCDate(queryEnd.getUTCDate() + 1);
  const queryStart = new Date(utcToday);
  queryStart.setUTCDate(queryStart.getUTCDate() - 30);

  const checkIns = await prisma.dailyCheckIn.findMany({
    where: {
      userId: user.id,
      date: { gte: queryStart, lte: queryEnd },
    },
    select: { date: true, sleepHours: true, mood: true, moved: true },
    orderBy: { date: "asc" },
  });

  // Map keyed by the stored date's YYYY-MM-DD (UTC representation, which is
  // exactly what @db.Date stores). The client compares against its local day
  // string — same format, no Date conversion on the client.
  const recentByDay: Record<
    string,
    { sleepHours: number; mood: number; moved: boolean }
  > = {};
  for (const c of checkIns) {
    recentByDay[isoDay(c.date)] = {
      sleepHours: c.sleepHours,
      mood: c.mood,
      moved: c.moved,
    };
  }

  // Graph shows last 30 days ending at server UTC today. Boundary drift of a
  // few hours between server UTC and user local is imperceptible on a 30-point
  // sparkline; the correctness that matters is on the write path.
  const graphStart = new Date(utcToday);
  graphStart.setUTCDate(graphStart.getUTCDate() - 29);
  const points = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(graphStart);
    d.setUTCDate(d.getUTCDate() + i);
    const key = isoDay(d);
    const row = recentByDay[key];
    return {
      date: key,
      sleepHours: row?.sleepHours ?? null,
      mood: row?.mood ?? null,
      moved: row?.moved ?? null,
    };
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
        Daily 3
      </h1>
      <p className="mt-1 text-zinc-600 dark:text-zinc-400">
        Sleep, mood, movement. Three seconds, once a day.
      </p>

      <div className="mt-6">
        <CheckInForm recentByDay={recentByDay} />
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Last 30 days
        </h2>
        <WellnessGraph points={points} />
      </div>
    </div>
  );
}
