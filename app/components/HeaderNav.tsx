"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/squads", label: "Squads" },
  { href: "/bench", label: "Bench" },
  { href: "/checkin", label: "Daily 3" },
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
                ? "text-crimson-600 dark:text-crimson-500"
                : "text-navy-700 hover:text-crimson-600 dark:text-parchment-200 dark:hover:text-crimson-500"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
