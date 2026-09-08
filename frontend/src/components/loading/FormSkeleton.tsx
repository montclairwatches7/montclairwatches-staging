import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface FormSkeletonProps {
  fields?: number;
  className?: string;
  columns?: 1 | 2;
  showButton?: boolean;
}

/**
 * Replaces an async-loaded form (e.g. an edit modal fetching existing
 * data) while it's fetching, instead of showing an empty form shell.
 */
export function FormSkeleton({ fields = 4, className, columns = 1, showButton = true }: FormSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className={cn("space-y-5", className)}
    >
      <div className={cn("grid gap-5", columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton height="0.65rem" width="30%" rounded="sm" />
            <Skeleton height="2.75rem" width="100%" rounded="lg" />
          </div>
        ))}
      </div>
      {showButton && <Skeleton height="2.75rem" width="8rem" rounded="full" />}
    </div>
  );
}
