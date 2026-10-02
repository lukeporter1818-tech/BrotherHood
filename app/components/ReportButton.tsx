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
      <span className="text-xs text-text-muted">Reported.</span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-text-muted hover:text-text"
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
        className="rounded border border-border bg-surface px-2 py-0.5 text-xs text-text-muted focus:outline-none"
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
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        {pending ? "Sending…" : "Submit"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="inline-flex items-center min-h-[44px] -my-2 px-2 text-xs text-text-muted hover:text-text"
      >
        Cancel
      </button>
      {state.error && (
        <span className="text-xs text-red-400">
          {state.error}
        </span>
      )}
    </form>
  );
}
