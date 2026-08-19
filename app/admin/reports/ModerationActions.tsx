"use client";

import { useTransition } from "react";
import { dismissReport, removeContent } from "./actions";

export function ModerationActions({ reportId }: { reportId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDismiss() {
    startTransition(() => dismissReport(reportId));
  }

  function handleRemove() {
    if (!confirm("Remove this content? This cannot be undone.")) return;
    startTransition(() => removeContent(reportId));
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleDismiss}
        disabled={pending}
        className="text-sm text-zinc-500 hover:text-zinc-950 disabled:opacity-50 dark:hover:text-zinc-50"
      >
        Dismiss
      </button>
      <button
        onClick={handleRemove}
        disabled={pending}
        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
      >
        Remove
      </button>
    </div>
  );
}
