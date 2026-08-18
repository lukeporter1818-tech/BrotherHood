"use client";

import { useState } from "react";

type Identity = "REAL" | "ANON";

export function IdentityToggle({
  realName,
  anonHandle,
}: {
  realName: string | null;
  anonHandle: string;
}) {
  const [identity, setIdentity] = useState<Identity>("ANON");

  const options: { value: Identity; label: string; disabled?: boolean }[] = [
    { value: "REAL", label: realName ?? "Real name", disabled: !realName },
    { value: "ANON", label: anonHandle },
  ];

  return (
    <div className="flex items-center rounded-full border border-zinc-300 bg-white p-0.5 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => setIdentity(opt.value)}
          title={opt.disabled ? "Add a real name to use this identity" : undefined}
          className={`rounded-full px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            identity === opt.value
              ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
              : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
