"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/rooms", label: "Rooms" },
  { href: "/squads", label: "Squads" },
  { href: "/checkin", label: "Daily 3" },
  { href: "/goose", label: "Goose" },
] as const;

export function HeaderNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = isAdmin
    ? [...LINKS, { href: "/admin/reports", label: "Admin" }]
    : LINKS;

  return (
    <nav className="flex items-center gap-4 text-sm">
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
            className={
              active
                ? "font-medium text-zinc-950 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
