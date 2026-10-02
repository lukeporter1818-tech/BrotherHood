"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/bench", label: "Bench" },
  { href: "/goose", label: "Goose" },
] as const;

export function HeaderNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...LINKS, { href: "/admin/reports", label: "Admin" }]
    : LINKS;

  return (
    <nav className="flex items-center gap-4">
      {items.map((link) => {
        const active =
          link.href === "/admin/reports"
            ? pathname.startsWith("/admin")
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`text-xs font-semibold uppercase tracking-wide ${
              active
                ? "text-signal"
                : "text-text-muted hover:text-signal"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
