"use client";

import { useState, useTransition } from "react";
import { generateBrief } from "@/app/home/actions";
import { InterestsForm } from "@/app/home/InterestsForm";
import type { BriefPayload } from "@/lib/brief";

type Props = {
  latest: {
    createdAt: Date;
    content: BriefPayload;
  } | null;
  hasTopics: boolean;
  interestTopics: string[];
};

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

function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function BriefPanel({ latest, hasTopics, interestTopics }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  function onGenerate() {
    setError(null);
    const topic = customTopic.trim();
    startTransition(async () => {
      const res = await generateBrief(topic || undefined);
      if (res.error) {
        setError(res.error);
      } else {
        setCustomTopic("");
      }
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Your brief
        </h2>
        <div className="flex items-center gap-3">
          {latest && (
            <span className="text-xs text-slate-500">
              {formatTimestamp(latest.createdAt)}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            aria-label="Manage brief topics"
            aria-expanded={showSettings}
            className="text-slate-500 transition-colors hover:text-navy-800 dark:hover:text-parchment-100"
          >
            <GearIcon />
          </button>
        </div>
      </div>

      <div className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900">
        {showSettings && (
          <div className="mb-5 border-b border-parchment-200 pb-5 dark:border-navy-800">
            <InterestsForm initialTopics={interestTopics} />
          </div>
        )}

        {!hasTopics && !showSettings && (
          <p className="mb-3 text-xs text-slate-500">
            Tap the gear above to add saved topics, or search a one-off topic
            below.
          </p>
        )}

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !pending) onGenerate();
            }}
            placeholder="Or search a specific topic…"
            maxLength={40}
            disabled={pending}
            className="min-w-0 flex-1 rounded border border-parchment-200 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:border-crimson-600 focus:outline-none disabled:opacity-50 dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50 dark:placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={onGenerate}
            disabled={pending || (!hasTopics && !customTopic.trim())}
            className="w-full shrink-0 rounded-full bg-crimson-600 px-4 py-2 text-sm font-medium text-white hover:bg-crimson-700 disabled:opacity-50 sm:w-auto"
          >
            {pending
              ? "Generating… (15–40s)"
              : customTopic.trim()
                ? "Search"
                : latest
                  ? "Generate a new brief"
                  : "Generate my brief"}
          </button>
        </div>

        {customTopic.trim() && (
          <p className="mt-1.5 text-xs text-slate-500">
            One-off — won&apos;t affect your saved topics.
          </p>
        )}

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
