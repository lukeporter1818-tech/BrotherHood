import { logout } from "@/app/auth/actions";
import { WordmarkDropdown } from "@/app/components/WordmarkDropdown";

export function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <header className="flex items-center justify-between border-b-2 border-signal bg-surface px-6 py-4">
      <WordmarkDropdown isAdmin={isAdmin} />

      <div className="flex items-center gap-4">
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-text-muted hover:text-signal"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}
