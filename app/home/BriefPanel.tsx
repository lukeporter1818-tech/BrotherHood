"use client";

import { useState, useTransition } from "react";
import { generateBrief } from "@/app/home/actions";
import type { BriefPayload } from "@/lib/brief";

type Props = {
  latest: {
    createdAt: Date;
    content: BriefPayload;
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

function formatTimestamp(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function BriefPanel({ latest }: Props) {
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
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Your brief
        </h2>
        {latest && (
          <span className="text-xs text-slate-500">
            {formatTimestamp(latest.createdAt)}
          </span>
        )}
      </div>

      <div className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !pending) runSearch(topic);
            }}
            placeholder="Search a topic…"
            maxLength={40}
            disabled={pending}
            className="min-w-0 flex-1 rounded border border-parchment-200 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:border-crimson-600 focus:outline-none disabled:opacity-50 dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={() => runSearch(topic)}
            disabled={pending || !topic.trim()}
            className="w-full shrink-0 rounded-full bg-crimson-600 px-4 py-2 text-sm font-medium text-white hover:bg-crimson-700 disabled:opacity-50 sm:w-auto"
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
              className="rounded-full border border-parchment-200 bg-parchment-50 px-3 py-1.5 text-xs text-navy-800 transition-colors hover:border-navy-700 disabled:opacity-50 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-200"
            >
              {preset}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {latest && !pending && (
          <div className="mt-5 max-h-[480px] overflow-y-auto pr-1">
            <div className="flex flex-col gap-8">
              {latest.content.sections.map((section) => (
                <div key={section.topic}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-crimson-600">
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
                            className="text-sm font-semibold text-navy-950 hover:text-crimson-600 dark:text-parchment-50 dark:hover:text-crimson-500"
                          >
                            {item.headline}
                          </a>
                        ) : (
                          <p className="text-sm font-semibold text-navy-950 dark:text-parchment-50">
                            {item.headline}
                          </p>
                        )}
                        <p className="mt-1 text-sm text-navy-700 dark:text-parchment-200">
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
      </div>
    </section>
  );
}
