import { logout } from "@/app/auth/actions";
import { WordmarkDropdown } from "@/app/components/WordmarkDropdown";

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="flex items-center justify-between border-b-2 border-crimson-600 bg-parchment-100 px-6 py-4 dark:bg-navy-900">
      <WordmarkDropdown isAdmin={isAdmin} />

      <div className="flex items-center gap-4">
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-navy-800 hover:text-crimson-600 dark:text-parchment-200 dark:hover:text-crimson-500"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
