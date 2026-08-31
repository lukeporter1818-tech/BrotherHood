"use client";

import { useState, useTransition } from "react";
import { generateDigest } from "@/app/home/actions";
import type { DigestPayload } from "@/lib/digest";

type Props = {
  latest: {
    createdAt: Date;
    content: DigestPayload;
  } | null;
  hasTopics: boolean;
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

export function DigestPanel({ latest, hasTopics }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await generateDigest();
      if (res.error) setError(res.error);
    });
  }

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Your digest
        </h2>
        {latest && (
          <span className="text-xs text-slate-500">
            {formatTimestamp(latest.createdAt)}
          </span>
        )}
      </div>

      <div className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900">
        {!hasTopics ? (
          <p className="text-sm text-navy-700 dark:text-parchment-200">
            Add interest topics below, then generate your first digest.
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={onGenerate}
              disabled={pending}
              className="rounded-full bg-crimson-600 px-4 py-2 text-sm font-medium text-white hover:bg-crimson-700 disabled:opacity-50"
            >
              {pending
                ? "Generating… (this takes 15–40s)"
                : latest
                  ? "Generate a new digest"
                  : "Generate my digest"}
            </button>

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
          </>
        )}
      </div>
    </section>
  );
}
