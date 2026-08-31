"use client";

import {
  useOptionalIdentity,
  type Identity,
} from "@/app/components/IdentityProvider";

export function IdentityToggle() {
  const ctx = useOptionalIdentity();
  if (!ctx) return null;
  const { identity, setIdentity, realName, anonHandle } = ctx;

  const options: { value: Identity; label: string; disabled?: boolean }[] = [
    { value: "REAL", label: realName ?? "Real name", disabled: !realName },
    { value: "ANON", label: anonHandle },
  ];

  return (
    <div className="flex items-center rounded-full border border-parchment-200 bg-parchment-50 p-0.5 text-sm dark:border-navy-700 dark:bg-navy-900">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => setIdentity(opt.value)}
          title={opt.disabled ? "Add a real name to use this identity" : undefined}
          className={`rounded-full px-3 py-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            identity === opt.value
              ? "bg-crimson-600 text-white"
              : "text-navy-700 hover:text-navy-950 dark:text-parchment-200 dark:hover:text-parchment-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
