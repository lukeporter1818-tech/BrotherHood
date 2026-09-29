"use client";
import { useState, useTransition } from "react";
import { setRoomAvailability } from "@/app/bench/actions";

type Room = { slug: string; displayName: string };

export function AvailabilityToggles({
  rooms,
  enabledSlugs,
}: {
  rooms: Room[];
  enabledSlugs: string[];
}) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(enabledSlugs));
  const [, startTransition] = useTransition();

  function toggle(slug: string) {
    const next = !enabled.has(slug);
    setEnabled((prev) => {
      const s = new Set(prev);
      next ? s.add(slug) : s.delete(slug);
      return s;
    });
    startTransition(async () => {
      const { error } = await setRoomAvailability(slug, next);
      if (error) {
        setEnabled((prev) => {
          const s = new Set(prev);
          next ? s.delete(slug) : s.add(slug);
          return s;
        });
      }
    });
  }

  return (
    <ul className="flex flex-col gap-2">
      {rooms.map((room) => {
        const on = enabled.has(room.slug);
        return (
          <li
            key={room.slug}
            className="flex items-center justify-between rounded border border-parchment-200 bg-parchment-50 px-4 py-3 dark:border-navy-800 dark:bg-navy-900"
          >
            <span className="text-sm font-medium text-navy-950 dark:text-parchment-50">
              {room.displayName}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              onClick={() => toggle(room.slug)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700 ${
                on ? "bg-green-600 dark:bg-green-500" : "bg-slate-300 dark:bg-navy-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  on ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <span className="sr-only">
                {on ? "Opt out of" : "Opt in to"} {room.displayName}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
