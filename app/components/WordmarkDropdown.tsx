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
        className="text-sm font-bold uppercase tracking-widest text-text"
        aria-haspopup="true"
        aria-expanded={open && !isClosing}
      >
        Brotherhood ★
      </button>

      {open && (
        <div
          style={{ transformOrigin: "top center" }}
          className={`absolute left-0 top-full z-50 mt-2 w-44 rounded border border-border bg-surface shadow-lg ${
            isClosing ? "animate-rope-retract" : "animate-rope-drop"
          }`}
        >
          {/* Rope rungs — three horizontal lines anchoring the ladder to the wordmark */}
          <div className="flex flex-col items-center gap-1 px-4 py-2.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-px w-3/4 bg-border"
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
                    ? "font-semibold text-signal"
                    : "text-text-muted hover:bg-elevated hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          <Link
            href="/crisis"
            onClick={() => close()}
            className="block border-t border-border bg-crisis/10 px-4 py-2 text-sm font-medium text-crisis hover:bg-crisis/20"
          >
            Get help
          </Link>
        </div>
      )}
    </div>
  );
}
