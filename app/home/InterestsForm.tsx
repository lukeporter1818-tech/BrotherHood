"use client";

import { useActionState, useState } from "react";
import { saveInterests, type InterestsActionState } from "@/app/home/actions";

// Kept in sync with PRESET_TOPICS in app/home/actions.ts. Same shape as
// Bench's JOURNEYS constant — curated primary list, freeform for the tail.
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

const MAX_TOPICS = 6;

export function InterestsForm({ initialTopics }: { initialTopics: string[] }) {
  const [state, formAction, pending] = useActionState<
    InterestsActionState,
    FormData
  >(saveInterests, { error: null });

  const initialSelectedPresets = new Set(
    initialTopics.filter((t) => (PRESETS as readonly string[]).includes(t)),
  );
  const initialFreeform = initialTopics
    .filter((t) => !(PRESETS as readonly string[]).includes(t))
    .join(", ");

  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(
    initialSelectedPresets,
  );

  function togglePreset(topic: string) {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-slate-500">
          Pick from the list
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((topic) => {
            const active = selectedPresets.has(topic);
            return (
              <label
                key={topic}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-crimson-600 bg-crimson-600 text-white"
                    : "border-parchment-200 bg-parchment-50 text-navy-800 hover:border-navy-700 dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-200"
                }`}
              >
                <input
                  type="checkbox"
                  name="preset"
                  value={topic}
                  checked={active}
                  onChange={() => togglePreset(topic)}
                  className="sr-only"
                />
                {topic}
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-slate-500">
          Or add your own (comma-separated)
        </label>
        <input
          name="freeform"
          type="text"
          maxLength={200}
          defaultValue={initialFreeform}
          placeholder="e.g. Golf, F1, Rock Climbing"
          className="rounded border border-parchment-200 bg-parchment-50 px-3 py-2 text-sm text-navy-950 placeholder:text-slate-400 focus:border-crimson-600 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50"
        />
        <p className="text-xs text-slate-500">
          Up to {MAX_TOPICS} topics total.
        </p>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-navy-800 px-4 py-1.5 text-xs font-medium text-parchment-50 hover:bg-navy-700 disabled:opacity-50 dark:bg-parchment-100 dark:text-navy-950 dark:hover:bg-parchment-50"
      >
        {pending ? "Saving…" : "Save topics"}
      </button>
    </form>
  );
}
