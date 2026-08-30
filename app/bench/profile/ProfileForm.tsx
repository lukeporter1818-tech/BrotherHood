"use client";

import { useActionState } from "react";
import {
  upsertBenchProfile,
  type ProfileFormState,
} from "@/app/bench/profile/actions";

const JOURNEYS = [
  { value: "SOBRIETY", label: "Sobriety" },
  { value: "DIVORCE", label: "Divorce" },
  { value: "GRIEF", label: "Grief" },
  { value: "FATHERHOOD", label: "Fatherhood" },
  { value: "MENTAL_HEALTH", label: "Mental health" },
  { value: "CAREER_CHANGE", label: "Career change" },
  { value: "OTHER", label: "Other" },
] as const;

type Initial = {
  journey: string;
  role: string;
  stageText: string;
  bio: string;
} | null;

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<
    ProfileFormState,
    FormData
  >(upsertBenchProfile, { error: null });

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Journey
        </label>
        <select
          name="journey"
          defaultValue={initial?.journey ?? "SOBRIETY"}
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        >
          {JOURNEYS.map((j) => (
            <option key={j.value} value={j.value}>
              {j.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Role
        </label>
        <div className="flex gap-2">
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50">
            <input
              type="radio"
              name="role"
              value="SEEKER"
              defaultChecked={initial?.role !== "MENTOR"}
              required
            />
            Seeker (just starting)
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50">
            <input
              type="radio"
              name="role"
              value="MENTOR"
              defaultChecked={initial?.role === "MENTOR"}
              required
            />
            Mentor (further along)
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          Where you are
        </label>
        <input
          name="stageText"
          type="text"
          maxLength={100}
          defaultValue={initial?.stageText ?? ""}
          placeholder="e.g. Day 12 · 5 years sober · Just got served papers"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-zinc-500">
          A few words (optional)
        </label>
        <textarea
          name="bio"
          rows={3}
          maxLength={500}
          defaultValue={initial?.bio ?? ""}
          placeholder="Why you're here, or what you'd want from a match."
          className="resize-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-zinc-950 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
