"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";

type Props = { isAdmin: boolean };

export function HeaderMenu({ isAdmin }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    close();
  }, [pathname, close]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-signal-bright transition-colors hover:text-signal"
      >
        <MenuIcon className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-xl"
        >
          {isAdmin && (
            <Link
              href="/admin/reports"
              role="menuitem"
              className="block px-4 py-3 text-sm text-text-muted transition-colors hover:bg-elevated hover:text-text"
            >
              Admin
            </Link>
          )}
          <form action={logout} className={isAdmin ? "border-t border-border" : ""}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-4 py-3 text-left text-sm text-text-muted transition-colors hover:bg-elevated hover:text-text"
            >
              Log out
            </button>
          </form>
          <Link
            href="/crisis"
            role="menuitem"
            className="block border-t border-border bg-crisis/10 px-4 py-3 text-sm font-medium text-crisis transition-colors hover:bg-crisis/20"
          >
            Get help
          </Link>
        </div>
      )}
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="3" y1="6" x2="4.5" y2="6" />
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="4.5" y2="12" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="4.5" y2="18" />
      <line x1="8" y1="18" x2="21" y2="18" />
    </svg>
  );
}
