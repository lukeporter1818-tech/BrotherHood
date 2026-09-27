"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";

const RETRACT_MS = 160;

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/bench", label: "Bench" },
  { href: "/goose", label: "Goose" },
] as const;

export function WordmarkDropdown({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const close = useCallback(() => {
    setIsClosing(true);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, RETRACT_MS);
  }, []);

  function toggle() {
    if (open && !isClosing) {
      close();
    } else {
      if (closeTimer.current) clearTimeout(closeTimer.current);
      setIsClosing(false);
      setOpen(true);
    }
  }

  // Close on click-outside or Escape
  useEffect(() => {
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
  }, [close]);

  // Close on navigation
  useEffect(() => {
    close();
  }, [pathname, close]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => { if (closeTimer.current) clearTimeout(closeTimer.current); };
  }, []);

  const links = isAdmin
    ? [...NAV_LINKS, { href: "/admin/reports", label: "Admin" } as const]
    : NAV_LINKS;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={toggle}
        className="text-sm font-bold uppercase tracking-widest text-navy-950 dark:text-parchment-50"
        aria-haspopup="true"
        aria-expanded={open && !isClosing}
      >
        Brotherhood ★
      </button>

      {open && (
        <div
          style={{ transformOrigin: "top center" }}
          className={`absolute left-0 top-full z-50 mt-2 w-44 rounded border border-parchment-200 bg-parchment-50 shadow-lg dark:border-navy-700 dark:bg-navy-900 ${
            isClosing ? "animate-rope-retract" : "animate-rope-drop"
          }`}
        >
          {/* Rope rungs — three horizontal lines anchoring the ladder to the wordmark */}
          <div className="flex flex-col items-center gap-1 px-4 py-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-px w-3/4 bg-parchment-200 dark:bg-navy-700"
              />
            ))}
          </div>

          {links.map((link) => {
            const active =
              link.href === "/admin/reports"
                ? pathname.startsWith("/admin")
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => close()}
                className={`block px-4 py-2 text-sm ${
                  active
                    ? "font-semibold text-crimson-600 dark:text-crimson-500"
                    : "text-navy-800 hover:bg-parchment-100 hover:text-navy-950 dark:text-parchment-200 dark:hover:bg-navy-800 dark:hover:text-parchment-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/crisis"
            onClick={() => close()}
            className="block border-t border-parchment-200 bg-amber-50/50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 dark:border-navy-700 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-950/40"
          >
            Get help
          </Link>
        </div>
      )}
    </div>
  );
}
