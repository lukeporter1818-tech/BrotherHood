"use client";

import { useCallback, useState, useTransition } from "react";
import { generateBrief } from "@/app/(authed)/home/actions";
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
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  // The image can finish (or fail) before React hydrates, so onLoad/onError
  // may never fire. Check its state once on mount.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) setImageLoaded(true);
    else setImageFailed(true);
  }, []);

  const inner = (
    <article className="flex gap-3 rounded-[10px] border border-border bg-surface p-3 transition-colors group-hover:border-border-strong">
      <div
        aria-hidden="true"
        className="relative flex h-[79px] w-[79px] shrink-0 self-start items-center justify-center overflow-hidden rounded-[8px] border border-border bg-bg font-mono text-base text-text-dim"
      >
        {initial}
        {url && !imageFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={`/api/brief-image?u=${encodeURIComponent(url)}`}
            alt=""
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-[15.5px] font-semibold leading-[1.3] text-text group-hover:text-signal">
          {headline}
        </h4>
        {meta && (
          <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-text-muted">
            {meta}
          </p>
        )}
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
      <div className="mb-[9px]">
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
              className="pointer-events-none absolute left-3.5 top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-signal"
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
              className="min-h-[48px] w-full rounded-xl border border-border bg-surface pl-11 pr-3 text-base text-text placeholder:text-[13.5px] placeholder:text-subhead/70 focus:border-signal focus:outline-none disabled:opacity-50"
            />
          </div>
          <button
            type="button"
            onClick={() => runSearch(topic)}
            disabled={pending || !topic.trim()}
            className="min-h-[42px] w-full shrink-0 rounded-[13px] border border-signal bg-[#06180F] px-5 text-[16.5px] font-medium text-signal-bright transition-shadow duration-200 glow-signal-md hover:shadow-[0_0_28px_4px_rgba(125,247,185,0.45)] disabled:cursor-default"
          >
            {pending ? "Searching the news…" : "Search"}
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {[PRESETS.slice(0, 4), PRESETS.slice(4)].map((row, rowIndex) => (
            <div key={rowIndex} className="flex flex-wrap gap-2">
              {row.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => runSearch(preset)}
                  disabled={pending}
                  className="inline-flex flex-auto items-center justify-center whitespace-nowrap rounded-full border border-text/20 bg-surface px-[10px] py-[9px] text-[13px] text-text transition-colors duration-150 hover:bg-elevated hover:border-text/40 hover:text-signal focus-visible:bg-elevated focus-visible:border-text/40 focus-visible:text-signal focus-visible:outline-none disabled:opacity-50"
                >
                  {preset}
                </button>
              ))}
            </div>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {pending && (
          <div className="mt-5 flex flex-col gap-2" aria-busy="true" aria-label="Searching the news">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex animate-pulse gap-3 rounded-[10px] border border-border bg-surface p-3"
              >
                <div className="h-[79px] w-[79px] shrink-0 rounded-[8px] bg-bg" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3.5 w-11/12 rounded bg-bg" />
                  <div className="h-3.5 w-3/4 rounded bg-bg" />
                  <div className="h-2.5 w-1/3 rounded bg-bg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!pending && latest && (
          <div className="mt-5 max-h-[480px] overflow-y-auto pr-1">
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
