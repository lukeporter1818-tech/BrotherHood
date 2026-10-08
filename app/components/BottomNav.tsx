"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AvailabilityIcon,
  RoomsIcon,
  GooseIcon,
  BenchIcon,
} from "@/app/components/NavIcons";

type Props = { pendingMatchCount?: number };

export function BottomNav({ pendingMatchCount = 0 }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  // Bench = conversations (/bench and /bench/match/...). The availability
  // toggles live on their own tab, so they must not light up Bench.
  const benchActive = pathname === "/bench" || pathname.startsWith("/bench/match");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg pb-[env(safe-area-inset-bottom)] md:inset-x-auto md:left-1/2 md:right-auto md:bottom-6 md:-translate-x-1/2 md:rounded-full md:border md:border-border md:shadow-xl md:pb-0"
    >
      <div className="mx-auto flex items-stretch justify-around px-2 md:gap-2 md:px-4">
        <NavSlot
          href="/goose"
          label="Goose"
          icon={<GooseIcon className="h-[26px] w-[26px]" />}
          active={isActive("/goose")}
        />
        <NavSlot
          href="/rooms"
          label="Rooms"
          icon={<RoomsIcon className="h-[26px] w-[26px]" />}
          active={isActive("/rooms")}
        />
        <CenterSlot />
        <NavSlot
          href="/bench"
          label="Chat"
          icon={<BenchIcon className="h-[26px] w-[26px]" />}
          active={benchActive}
          badge={pendingMatchCount}
        />
        <NavSlot
          href="/bench/availability"
          label="Bench"
          icon={<AvailabilityIcon className="h-[26px] w-[26px]" />}
          active={isActive("/bench/availability")}
        />
      </div>
    </nav>
  );
}

function NavSlot({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`relative flex min-w-14 items-center justify-center py-2 text-[11px] font-medium transition-colors duration-150 ${
        active ? "text-signal glow-signal-text" : "text-text-muted hover:text-text"
      }`}
    >
      <span
        className="flex flex-col items-center gap-1.5 rounded-xl border border-transparent px-3 py-1"
      >
        <span className="relative">
          {active && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(125,247,185,0.28) 0%, transparent 70%)",
              }}
            />
          )}
          <span
            className={
              active
                ? "relative text-signal [filter:drop-shadow(0_0_6px_rgba(125,247,185,0.7))]"
                : ""
            }
          >
            {icon}
          </span>
        </span>
        <span className="relative">
          {label}
          {active && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-full mt-0.5 h-[2px] w-[13px] -translate-x-1/2 bg-signal"
            />
          )}
        </span>
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          aria-label={`${badge} pending`}
          className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-surface bg-signal px-1 text-[10px] font-semibold text-bg"
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function CenterSlot() {
  return (
    <Link
      href="/home"
      aria-label="Brotherhood home"
      className="relative -mt-3 flex h-[66px] w-[66px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-signal/80 bg-elevated shadow-[0_0_18px_4px_rgba(125,247,185,0.35)] md:-mt-3 md:h-[52px] md:w-[52px]"
    >
      <Image
        src="/icons/bh-glyph.png"
        alt=""
        width={32}
        height={38}
        priority
        className="h-[38px] w-[32px] shrink-0"
      />
    </Link>
  );
}
