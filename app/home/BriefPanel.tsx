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

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Your brief
        </h2>
      </div>

      <div className="rounded border border-border bg-surface p-5">
        <div className="flex flex-col gap-2 sm:flex-row">
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
            className="min-w-0 flex-1 rounded border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-signal focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => runSearch(topic)}
            disabled={pending || !topic.trim()}
            className="w-full shrink-0 rounded-full bg-signal px-4 py-2 text-sm font-medium text-white hover:bg-signal/90 disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Generating… (15–40s)" : "Search"}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => runSearch(preset)}
              disabled={pending}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-signal disabled:opacity-50"
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
          <div className="mt-5 max-h-[480px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-8">
              {latest.content.sections.map((section) => (
                <div key={section.topic}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-signal">
                    {section.topic}
                  </h3>
                  <ul className="flex flex-col gap-4">
                    {section.items.map((item, i) => (
                      <li key={i}>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-text hover:text-signal"
                          >
                            {item.headline}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-text">
                            {item.headline}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-text-muted">
                          {item.blurb}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {!pending && !latest && dailyBrief && (
          <div className="mt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-signal">
              This morning
            </h3>
            <a
              href={dailyBrief.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <p className="text-base font-semibold text-text hover:text-signal">
                {dailyBrief.headline}
              </p>
            </a>
            <p className="mt-2 text-sm text-text-muted">
              {dailyBrief.blurb}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
