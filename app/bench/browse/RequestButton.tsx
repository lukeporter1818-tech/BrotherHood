"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestMatch } from "@/app/bench/match/[id]/actions";

export function RequestButton({ mentorProfileId }: { mentorProfileId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const router = useRouter();

  if (done) {
    return (
      <span className="text-xs text-zinc-500">
        Request sent — waiting on them
      </span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await requestMatch(mentorProfileId);
            if (res.error !== null) {
              setError(res.error);
              return;
            }
            setDone(true);
            router.refresh();
          })
        }
        className="rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "…" : "Ask for a listen"}
      </button>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
