// Shown instantly while a tab's data loads, so a tap gives immediate feedback.
export function PageSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-[18px] pt-0 pb-24 sm:px-6 sm:pt-8 sm:pb-8"
    >
      <div className="h-8 w-40 animate-pulse rounded-lg bg-surface" />
      <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-[58px] animate-pulse rounded-[14px] border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
