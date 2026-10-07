"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10.5 12 3l9 7.5V21H3z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function RoomsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="5" width="8" height="6" rx="1" />
      <rect x="13" y="5" width="8" height="6" rx="1" />
      <rect x="3" y="13" width="18" height="6" rx="1" />
    </svg>
  );
}

function GooseIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 20c0-4 3-5 3-9 0-3-2.5-5.5-5.5-5.5" />
      <path d="M3.5 10c1.5 0 3-1 3-2.5" />
      <circle cx="5" cy="7" r="0.6" fill="currentColor" />
      <path d="M18 20l-2-4-3-1" />
    </svg>
  );
}

function BenchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10h18M4 10v8M20 10v8M3 14h18" />
    </svg>
  );
}

type Props = { pendingMatchCount?: number };

export function BottomNav({ pendingMatchCount = 0 }: Props) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-strong bg-surface pb-[env(safe-area-inset-bottom)] md:inset-x-auto md:left-1/2 md:right-auto md:bottom-6 md:-translate-x-1/2 md:rounded-full md:border md:border-border md:shadow-xl md:pb-0"
    >
      <div className="mx-auto flex items-stretch justify-around px-2 md:gap-2 md:px-4">
        <NavSlot
          href="/home"
          label="Home"
          icon={<HomeIcon className="h-5 w-5" />}
          active={isActive("/home")}
        />
        <NavSlot
          href="/rooms"
          label="Rooms"
          icon={<RoomsIcon className="h-5 w-5" />}
          active={isActive("/rooms")}
        />
        <CenterSlot />
        <NavSlot
          href="/goose"
          label="Goose"
          icon={<GooseIcon className="h-5 w-5" />}
          active={isActive("/goose")}
        />
        <NavSlot
          href="/bench"
          label="Bench"
          icon={<BenchIcon className="h-5 w-5" />}
          active={isActive("/bench")}
          badge={pendingMatchCount}
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
        className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-1 ${
          active ? "border-signal/30 bg-signal/10" : "border-transparent"
        }`}
      >
        <span className={active ? "text-signal drop-shadow-[0_0_6px_rgba(152,223,155,0.6)]" : ""}>{icon}</span>
        <span>{label}</span>
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
      className="relative -mt-3 flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full border-2 border-signal bg-elevated shadow-[0_0_28px_4px_rgba(152,223,155,0.6)] md:-mt-3 md:h-[52px] md:w-[52px]"
    >
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={34}
        height={34}
        priority
        className="shrink-0"
      />
    </Link>
  );
}
