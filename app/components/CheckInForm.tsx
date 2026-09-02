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

  if (!hydrated) {
    return (
      <div
        className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-40 rounded bg-parchment-200 dark:bg-navy-800" />
          <div className="h-11 w-32 rounded bg-parchment-200 dark:bg-navy-800" />
          <div className="h-11 w-72 rounded bg-parchment-200 dark:bg-navy-800" />
          <div className="h-5 w-48 rounded bg-parchment-200 dark:bg-navy-800" />
          <div className="flex justify-end">
            <div className="h-11 w-24 rounded-full bg-parchment-200 dark:bg-navy-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="rounded border border-parchment-200 bg-parchment-50 p-5 dark:border-navy-800 dark:bg-navy-900"
    >
      <input
        ref={dateInputRef}
        type="hidden"
        name="localDate"
        defaultValue=""
      />
      <div className="grid gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-navy-800 dark:text-parchment-200">
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
            className="w-32 rounded border border-parchment-200 bg-parchment-50 px-3 py-3 text-sm text-navy-950 focus:border-crimson-600 focus:outline-none dark:border-navy-700 dark:bg-navy-950 dark:text-parchment-50"
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-navy-800 dark:text-parchment-200">
            Mood (1 rough → 5 solid)
          </legend>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                className="flex cursor-pointer items-center justify-center rounded-full border border-parchment-200 px-4 py-3 text-sm text-navy-800 has-checked:border-crimson-600 has-checked:bg-crimson-600 has-checked:text-white dark:border-navy-700 dark:text-parchment-200 dark:has-checked:border-crimson-600 dark:has-checked:bg-crimson-600 dark:has-checked:text-white"
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

        <label className="flex min-h-[44px] items-center gap-3">
          <input
            type="checkbox"
            name="moved"
            checked={moved}
            onChange={(e) => setMoved(e.target.checked)}
            className="h-4 w-4 rounded border-parchment-200 accent-crimson-600"
          />
          <span className="text-sm font-medium text-navy-800 dark:text-parchment-200">
            Moved my body today
          </span>
        </label>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {today ? "Updating today's check-in." : "One check-in per day."}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-crimson-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-crimson-700 disabled:opacity-50"
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
