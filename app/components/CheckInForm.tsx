"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  submitCheckIn,
  type CheckInActionState,
} from "@/app/checkin/actions";

const initial: CheckInActionState = { error: null, ok: false };

const DEFAULT_SLEEP = 7;
const DEFAULT_MOOD = 3;
const DEFAULT_MOVED = false;

// "YYYY-MM-DD" from local wall clock. Never a Date object — that would
// re-introduce timezone reinterpretation on comparison.
function localDayString(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Row = { sleepHours: number; mood: number; moved: boolean };

export function CheckInForm({
  recentByDay,
}: {
  recentByDay: Record<string, Row>;
}) {
  const [state, formAction, pending] = useActionState(submitCheckIn, initial);
  const [today, setToday] = useState<Row | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [sleepHours, setSleepHours] = useState<number>(DEFAULT_SLEEP);
  const [mood, setMood] = useState<number>(DEFAULT_MOOD);
  const [moved, setMoved] = useState<boolean>(DEFAULT_MOVED);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = localDayString();
    if (dateInputRef.current) dateInputRef.current.value = key;
    const row = recentByDay[key] ?? null;
    setToday(row);
    setSleepHours(row?.sleepHours ?? DEFAULT_SLEEP);
    setMood(row?.mood ?? DEFAULT_MOOD);
    setMoved(row?.moved ?? DEFAULT_MOVED);
    setHydrated(true);
  }, [recentByDay]);

  function handleSubmit() {
    if (dateInputRef.current) {
      dateInputRef.current.value = localDayString();
    }
  }

  // Skeleton until hydration completes. This eliminates any race where the
  // user could interact with pre-hydration DOM controls and have their input
  // wiped when useEffect syncs today's row into state.
  if (!hydrated) {
    return (
      <div
        className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-9 w-72 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex justify-end">
            <div className="h-9 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <input
        ref={dateInputRef}
        type="hidden"
        name="localDate"
        defaultValue=""
      />
      <div className="grid gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Sleep last night (hours)
          </span>
          <input
            type="number"
            name="sleepHours"
            min={0}
            max={14}
            step={0.5}
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            required
            className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-950 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mood (1 rough → 5 solid)
          </legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex cursor-pointer items-center justify-center rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 has-checked:border-zinc-950 has-checked:bg-zinc-950 has-checked:text-white dark:border-zinc-700 dark:text-zinc-300 dark:has-checked:border-zinc-50 dark:has-checked:bg-zinc-50 dark:has-checked:text-zinc-950"
              >
                <input
                  type="radio"
                  name="mood"
                  value={String(n)}
                  checked={mood === n}
                  onChange={() => setMood(n)}
                  className="sr-only"
                  required
                />
                {n}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="moved"
            checked={moved}
            onChange={(e) => setMoved(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-400 accent-zinc-950 dark:accent-zinc-50"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Moved my body today
          </span>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {today ? "Updating today's check-in." : "One check-in per day."}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {pending ? "Saving…" : today ? "Update" : "Check in"}
        </button>
      </div>

      {state.error && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">
          Saved.
        </p>
      )}
    </form>
  );
}
