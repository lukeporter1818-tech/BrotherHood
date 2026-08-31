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
        className="rounded-full bg-crimson-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-crimson-700 disabled:opacity-50"
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
        className="rounded-full border border-parchment-200 px-3 py-1.5 text-xs text-navy-800 hover:border-navy-700 disabled:opacity-50 dark:border-navy-700 dark:text-parchment-200 dark:hover:border-parchment-200"
      >
        Decline
      </button>
    </div>
  );
}
