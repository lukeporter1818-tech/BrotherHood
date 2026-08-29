"use client";

import { useTransition } from "react";
import { joinSquad, leaveSquad } from "@/app/squads/actions";

export function JoinLeaveButton({
  squadId,
  isMember,
}: {
  squadId: string;
  isMember: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(() =>
      isMember ? leaveSquad(squadId) : joinSquad(squadId),
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={
        isMember
          ? "rounded-full border border-zinc-300 px-4 py-1.5 text-sm text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-50 dark:hover:text-zinc-50"
          : "rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      }
    >
      {pending ? "…" : isMember ? "Leave" : "Join"}
    </button>
  );
}
