import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface SkeletonImageProps {
  /** e.g. "1/1", "4/5", "16/9" — must match the eventual <img>'s aspect ratio to prevent layout shift */
  aspectRatio?: string;
  className?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "panel" | "full";
  showIcon?: boolean;
}

/**
 * Placeholder for an image that hasn't loaded yet. Always reserves the
 * same box the real image will occupy (via aspect-ratio), so swapping
 * skeleton -> image never shifts layout.
 */
export function SkeletonImage({
  aspectRatio = "1/1",
  className,
  rounded = "lg",
  showIcon = true,
}: SkeletonImageProps) {
  return (
    <Skeleton
      rounded={rounded}
      className={cn("w-full flex items-center justify-center", className)}
      style={{ aspectRatio }}
    >
      {showIcon && <ImageIcon className="w-1/5 h-1/5 max-w-8 max-h-8 text-muted-foreground/30" strokeWidth={1.25} />}
    </Skeleton>
  );
}
