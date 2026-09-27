import Link from "next/link";

type BenchState =
  | { kind: "no-profile" }
  | { kind: "active"; count: number }
  | { kind: "browse" }
  | { kind: "idle" };

type Tone = "positive" | "action" | "idle";

const dotClass: Record<Tone, string> = {
  positive: "bg-emerald-500",
  action: "bg-crimson-600",
  idle: "bg-slate-400",
};

function Pill({
  href,
  label,
  tone,
}: {
  href: string;
  label: string;
  tone: Tone;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-parchment-200 bg-parchment-50 px-3 py-1.5 text-xs text-navy-800 transition-colors hover:border-navy-700 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-200 dark:hover:border-navy-600"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass[tone]}`} />
      {label}
    </Link>
  );
}

export function StatusStrip({
  dailyDone,
  bench,
  recentPostCount,
}: {
  dailyDone: boolean;
  bench: BenchState;
  recentPostCount: number;
}) {
  const daily = dailyDone
    ? { label: "Check-in ✓", tone: "positive" as const }
    : { label: "Check-in", tone: "action" as const };

  const benchPill = (() => {
    switch (bench.kind) {
      case "no-profile":
        return {
          href: "/bench/profile",
          label: "Bench: set up",
          tone: "action" as const,
        };
      case "active":
        return {
          href: "/bench",
          label: `Bench ${bench.count}`,
          tone: "positive" as const,
        };
      case "browse":
        return {
          href: "/bench/browse",
          label: "Bench: browse",
          tone: "action" as const,
        };
      case "idle":
        return { href: "/bench", label: "Bench", tone: "idle" as const };
    }
  })();

  const rooms =
    recentPostCount === 0
      ? { label: "Rooms: quiet", tone: "idle" as const }
      : { label: `Rooms ${recentPostCount}`, tone: "positive" as const };

  return (
    <div className="flex flex-wrap gap-2">
      <Pill href="/goose" label={daily.label} tone={daily.tone} />
      <Pill
        href={benchPill.href}
        label={benchPill.label}
        tone={benchPill.tone}
      />
      <Pill href="/rooms" label={rooms.label} tone={rooms.tone} />
    </div>
  );
}
