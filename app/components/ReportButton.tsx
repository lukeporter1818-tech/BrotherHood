"use client";

import { useActionState, useRef, useState } from "react";
import { createReport, type ReportActionState } from "@/app/rooms/report-actions";

const initial: ReportActionState = { error: null, ok: false };

const REASONS = ["Harassment", "Spam", "Self-harm risk", "Other"] as const;

type Props = {
  targetType: "POST" | "REPLY";
  targetId: string;
};

export function ReportButton({ targetType, targetId }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createReport, initial);
  const formRef = useRef<HTMLFormElement>(null);

  if (state.ok) {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500">Reported.</span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
        aria-label="Report this content"
      >
        Report
      </button>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <select
        name="reason"
        required
        defaultValue=""
        className="rounded border border-parchment-200 bg-parchment-50 px-2 py-0.5 text-xs text-navy-800 focus:outline-none dark:border-navy-700 dark:bg-navy-900 dark:text-parchment-200"
      >
        <option value="" disabled>
          Reason…
        </option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        {pending ? "Sending…" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-400"
      >
        Cancel
      </button>
      {state.error && (
        <span className="text-xs text-red-600 dark:text-red-400">
          {state.error}
        </span>
      )}
    </form>
  );
}
