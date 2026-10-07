"use client";

import { useState, useTransition } from "react";
import { generateBrief } from "@/app/home/actions";
import type { BriefPayload } from "@/lib/brief";

type Props = {
  latest: {
    createdAt: Date;
    content: BriefPayload;
  } | null;
  dailyBrief: {
    headline: string;
    blurb: string;
    url: string;
  } | null;
};

const PRESETS = [
  "AI",
  "Sports",
  "Movies",
  "Video Games",
  "Business",
  "Technology",
  "Politics",
  "Science",
] as const;

function hostnameOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toUpperCase();
  } catch {
    return null;
  }
}

function sourceInitial(url: string | undefined): string {
  const h = hostnameOf(url);
  return h ? h.charAt(0) : "?";
}

function formatBriefDate(date: Date): string {
  return date
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase();
}

function BriefCard({
  headline,
  blurb,
  url,
  timeLabel,
}: {
  headline: string;
  blurb: string;
  url?: string;
  timeLabel: string;
}) {
  const source = hostnameOf(url);
  const meta = [source, timeLabel].filter(Boolean).join(" • ");
  const initial = sourceInitial(url);

  const inner = (
    <article className="flex gap-[14px] rounded-[14px] border border-border bg-surface p-[14px] transition-colors group-hover:border-border-strong">
      <div
        aria-hidden="true"
        className="flex w-[79px] shrink-0 self-stretch items-center justify-center rounded-[12px] border border-border bg-bg font-mono text-base text-text-dim"
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-base font-semibold leading-snug text-text group-hover:text-signal">
          {headline}
        </h4>
        {meta && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
            {meta}
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-text/75">{blurb}</p>
      </div>
    </article>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        {inner}
      </a>
    );
  }
  return inner;
}

export function BriefPanel({ latest, dailyBrief }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState("");

  function runSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setError(null);
    startTransition(async () => {
      const res = await generateBrief(trimmed);
      if (res.error) {
        setError(res.error);
      } else {
        setTopic("");
      }
    });
  }

  const timeLabel = latest ? formatBriefDate(latest.createdAt) : "";

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-signal">
          Your brief
        </h2>
      </div>

      <div>
        <div className="flex flex-col gap-[7px]">
          <div className="relative flex-1">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-signal"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" />
            </svg>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !pending) runSearch(topic);
              }}
              placeholder="Conspiracies, Peptides, Golf, UFC…"
              maxLength={40}
              disabled={pending}
              className="min-h-[48px] w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-base text-text placeholder:text-text-muted focus:border-signal focus:outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => runSearch(topic)}
            disabled={pending || !topic.trim()}
            className="min-h-[42px] w-full shrink-0 rounded-[13px] border-2 border-signal bg-bg px-5 text-[15px] font-medium text-signal transition-shadow duration-200 glow-signal-md hover:shadow-[0_0_28px_4px_rgba(125,247,185,0.65)]"
          >
            {pending ? "Generating… (15–40s)" : "Search"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-2 gap-y-3">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => runSearch(preset)}
              disabled={pending}
              className="inline-flex items-center rounded-full border border-border bg-surface px-[13px] py-2 text-[12.5px] text-text/80 transition-colors duration-150 hover:bg-elevated hover:border-border-strong hover:text-signal focus-visible:bg-elevated focus-visible:border-border-strong focus-visible:text-signal focus-visible:outline-none disabled:opacity-50"
            >
              {preset}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {!pending && latest && (
          <div className="mt-11 max-h-[480px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-8">
              {latest.content.sections.map((section) => (
                <div key={section.topic}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-signal">
                      {section.topic}
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">
                      {String(section.items.length).padStart(2, "0")} briefs
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {section.items.map((item, i) => (
                      <BriefCard
                        key={i}
                        headline={item.headline}
                        blurb={item.blurb}
                        url={item.url}
                        timeLabel={timeLabel}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!pending && !latest && dailyBrief && (
          <div className="mt-5">
            <div className="mb-3">
              <h3 className="text-[13px] font-semibold uppercase tracking-[0.15em] text-signal">
                This morning
              </h3>
            </div>
            <BriefCard
              headline={dailyBrief.headline}
              blurb={dailyBrief.blurb}
              url={dailyBrief.url}
              timeLabel="TODAY"
            />
          </div>
        )}
      </div>
    </section>
  );
}
