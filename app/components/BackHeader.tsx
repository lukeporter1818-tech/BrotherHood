import Link from "next/link";
import { HeaderMenu } from "@/app/components/HeaderMenu";

type Props = {
  backHref: string;
  title: string;
  isAdmin: boolean;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export function BackHeader({
  backHref,
  title,
  isAdmin,
  subtitle,
  rightSlot,
}: Props) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:text-text"
        >
          <BackIcon className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-text">
            {title}
          </h1>
          {subtitle && (
            <p className="truncate text-xs text-text-muted">{subtitle}</p>
          )}
        </div>
      </div>

      {rightSlot ?? <HeaderMenu isAdmin={isAdmin} />}
    </header>
  );
}

function BackIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 6l-6 6 6 6" />
    </svg>
  );
}
