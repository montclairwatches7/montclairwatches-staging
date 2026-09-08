import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "panel" | "full";
  circle?: boolean;
}

const ROUNDED_MAP: Record<NonNullable<SkeletonProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  panel: "rounded-panel",
  full: "rounded-full",
};

/**
 * Base skeleton atom. Wraps the shadcn `ui/skeleton` primitive with
 * width/height/rounded convenience props instead of duplicating the
 * shimmer implementation. Respects prefers-reduced-motion globally
 * (handled once in index.css).
 */
export function Skeleton({
  width,
  height,
  rounded = "md",
  circle,
  className,
  style,
  ...props
}: SkeletonProps) {
  const dimStyle: CSSProperties = {
    ...(width !== undefined ? { width } : {}),
    ...(height !== undefined ? { height } : {}),
    ...style,
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-pulse bg-muted",
        circle ? "rounded-full aspect-square" : ROUNDED_MAP[rounded],
        className
      )}
      style={dimStyle}
      {...props}
    />
  );
}
