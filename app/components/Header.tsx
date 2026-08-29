import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { IdentityToggle } from "@/app/components/IdentityToggle";

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black">
      <div className="flex items-center gap-6">
        <Link
          href="/rooms"
          className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
        >
          Brotherhood
        </Link>
        <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href="/rooms"
            className="hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            Rooms
          </Link>
          <Link
            href="/squads"
            className="hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            Squads
          </Link>
          <Link
            href="/checkin"
            className="hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            Daily 3
          </Link>
          {isAdmin && (
            <Link
              href="/admin/reports"
              className="hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              Admin
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <IdentityToggle />
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
