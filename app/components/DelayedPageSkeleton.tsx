import { PageSkeleton } from "@/app/components/PageSkeleton";

export function DelayedPageSkeleton({ rows }: { rows?: number }) {
  return (
    <div className="delayed-fade-in">
      <PageSkeleton rows={rows} />
    </div>
  );
}
