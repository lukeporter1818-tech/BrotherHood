"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptMatch, declineMatch } from "@/app/bench/match/[id]/actions";

export function AcceptDeclineButtons({ matchId }: { matchId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await acceptMatch(matchId);
            if (res.error === null) router.push(`/bench/match/${matchId}`);
          })
        }
        className="rounded-full bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        Accept
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await declineMatch(matchId);
            router.refresh();
          })
        }
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
      >
        Decline
      </button>
    </div>
  );
}
