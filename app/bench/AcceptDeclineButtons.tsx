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
        className="rounded-full bg-signal px-3 py-1.5 text-xs font-medium text-white hover:bg-signal/90 disabled:opacity-50"
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
        className="rounded-full border border-border px-3 py-1.5 text-xs text-text-muted hover:border-text-muted disabled:opacity-50"
      >
        Decline
      </button>
    </div>
  );
}
