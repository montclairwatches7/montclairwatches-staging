import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
  /** Render as stacked cards (mobile) instead of a grid of table cells */
  asCards?: boolean;
}

/**
 * Generic table-shaped skeleton. Pass `asCards` when the real table
 * collapses into a card list on mobile, so the loading state follows
 * the same responsive transform as the real content.
 */
export function TableSkeleton({ rows = 5, columns = 4, className, asCards = false }: TableSkeletonProps) {
  if (asCards) {
    return (
      <div role="status" aria-label="Loading" className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="rounded-2xl border border-border/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton height="0.9rem" width="40%" rounded="sm" />
              <Skeleton height="1.5rem" width="4rem" rounded="full" />
            </div>
            <Skeleton height="0.75rem" width="70%" rounded="sm" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading table" className={cn("w-full overflow-x-auto rounded-xl border border-border", className)}>
      <div className="min-w-full">
        <div className="flex gap-4 px-4 sm:px-6 py-3 border-b border-border bg-secondary/20">
          {Array.from({ length: columns }).map((_, c) => (
            <Skeleton key={c} height="0.7rem" width={`${100 / columns}%`} rounded="sm" className="flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 px-4 sm:px-6 py-4 border-b border-border/60 last:border-b-0">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton key={c} height="0.85rem" width={`${100 / columns}%`} rounded="sm" className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
