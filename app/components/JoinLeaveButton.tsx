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
          ? "rounded-full border border-parchment-200 px-4 py-1.5 text-sm text-navy-800 hover:border-navy-700 hover:text-navy-950 disabled:opacity-50 dark:border-navy-700 dark:text-parchment-200 dark:hover:border-parchment-200 dark:hover:text-parchment-50"
          : "rounded-full bg-crimson-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-crimson-700 disabled:opacity-50"
      }
    >
      {pending ? "…" : isMember ? "Leave" : "Join"}
    </button>
  );
}
