import Link from "next/link";

type BenchState =
  | { kind: "active"; count: number }
  | { kind: "idle" };

type Tone = "positive" | "action" | "idle";

const dotClass: Record<Tone, string> = {
  positive: "bg-signal glow-signal-sm",
  action: "bg-text",
  idle: "bg-text-muted",
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
  const active = tone === "positive";
  return (
    <Link
      href={href}
      className={`relative inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-[13px] transition-colors duration-200 before:absolute before:-inset-1.5 before:content-[''] ${
        active
          ? "border-[1.5px] border-signal bg-bg text-text glow-signal-md"
          : "border border-border bg-surface text-text/80 hover:border-signal"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-signal" : dotClass[tone]}`} />
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

  const benchPill =
    bench.kind === "active"
      ? {
          href: "/bench",
          label: `Bench ${bench.count}`,
          tone: "positive" as const,
        }
      : { href: "/bench", label: "Bench", tone: "idle" as const };

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
