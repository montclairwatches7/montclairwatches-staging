import { useRef, useState, useEffect } from "react";
import { Watch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

const ROUNDED_CLASS: Record<NonNullable<SafeImageProps["rounded"]>, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  panel: "rounded-panel",
  full: "rounded-full",
};

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onError" | "onLoad"> {
  /** e.g. "1/1", "4/5", "16/9" — reserves the box up front so loading never shifts layout */
  aspectRatio?: string;
  wrapperClassName?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "panel" | "full";
}

/**
 * Drop-in <img> replacement with a loading -> loaded/error state machine.
 * - Reserves its box via aspectRatio so nothing shifts when the image resolves.
 * - Shows SkeletonImage while the request is in flight.
 * - Falls back to a branded (non-broken-icon) placeholder on error, exactly once
 *   (guarded so a failing fallback can't loop).
 */
export function SafeImage({
  src,
  alt,
  aspectRatio = "1/1",
  wrapperClassName,
  className,
  rounded = "lg",
  loading = "lazy",
  ...props
}: SafeImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");
  const hasErrored = useRef(false);

  // If the src prop changes (e.g. swapping product images), re-arm the loading state.
  useEffect(() => {
    hasErrored.current = false;
    setStatus(src ? "loading" : "error");
  }, [src]);

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-zinc-50", ROUNDED_CLASS[rounded], wrapperClassName)}
      style={{ aspectRatio }}
    >
      {status === "loading" && (
        <Skeleton rounded="none" className="absolute inset-0 w-full h-full" />
      )}

      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary/30 text-muted-foreground/50">
          <Watch className="w-1/4 h-1/4 max-w-10 max-h-10" strokeWidth={1.25} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => {
            if (hasErrored.current) return;
            hasErrored.current = true;
            setStatus("error");
          }}
          {...props}
        />
      )}
    </div>
  );
}
