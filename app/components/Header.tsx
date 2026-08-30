import Link from "next/link";
import { logout } from "@/app/auth/actions";
import { HeaderNav } from "@/app/components/HeaderNav";
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
        <HeaderNav isAdmin={isAdmin} />
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
