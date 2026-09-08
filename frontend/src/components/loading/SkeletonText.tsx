import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
  /** Width of the last line, so paragraphs don't look like uniform bars */
  lastLineWidth?: string;
}

const LINE_WIDTHS = ["100%", "92%", "97%", "85%", "90%"];

/**
 * Multi-line text skeleton. Varies each line's width so it reads as
 * paragraph copy rather than a stack of identical bars.
 */
export function SkeletonText({
  lines = 3,
  className,
  lineClassName,
  lastLineWidth = "60%",
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)} role="status" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="0.85em"
          rounded="sm"
          width={i === lines - 1 && lines > 1 ? lastLineWidth : LINE_WIDTHS[i % LINE_WIDTHS.length]}
          className={lineClassName}
        />
      ))}
    </div>
  );
}
