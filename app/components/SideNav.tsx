"use client";

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

function BenchIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 10h18M4 10v8M20 10v8M3 14h18" />
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

function ShieldIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3 4 6v6c0 4.5 3 7.5 8 9 5-1.5 8-4.5 8-9V6z" />
    </svg>
  );
}

type Props = { isAdmin: boolean; previewActive?: string };

export function SideNav({ isAdmin, previewActive }: Props) {
  const realPathname = usePathname();
  const pathname = previewActive ?? realPathname;
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden md:flex md:w-60 md:shrink-0 md:flex-col md:gap-6 md:rounded-2xl md:border md:border-border md:bg-surface md:px-4 md:py-6">
      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-dim">
          Navigate
        </p>
        <NavLink href="/home" label="Home" icon={<HomeIcon className="h-4 w-4" />} active={isActive("/home")} />
        <NavLink href="/rooms" label="Rooms" icon={<RoomsIcon className="h-4 w-4" />} active={isActive("/rooms")} />
        <NavLink href="/bench" label="Bench" icon={<BenchIcon className="h-4 w-4" />} active={isActive("/bench")} />
        <NavLink href="/goose" label="Goose" icon={<GooseIcon className="h-4 w-4" />} active={isActive("/goose")} />
        {isAdmin && (
          <NavLink
            href="/admin/reports"
            label="Admin"
            icon={<ShieldIcon className="h-4 w-4" />}
            active={pathname.startsWith("/admin")}
          />
        )}
      </nav>

      <div className="mt-auto">
        <Link
          href="/crisis"
          className="flex items-center justify-between rounded-xl border border-crisis/40 bg-crisis/10 px-3 py-2 text-sm font-medium text-crisis transition-colors hover:bg-crisis/20"
        >
          <span>Get help</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">24/7</span>
        </Link>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
        active
          ? "border border-border-active bg-signal/10 text-signal glow-signal-outline"
          : "border border-transparent text-text-muted hover:border-border-strong hover:bg-elevated hover:text-text"
      }`}
    >
      <span className={active ? "text-signal" : ""}>{icon}</span>
      {label}
    </Link>
  );
}
