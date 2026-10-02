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
        className="inline-flex items-center min-h-[44px] px-2 text-sm text-text-muted hover:text-text disabled:opacity-50"
      >
        Dismiss
      </button>
      <button
        onClick={handleRemove}
        disabled={pending}
        className="inline-flex items-center min-h-[44px] px-2 text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}
