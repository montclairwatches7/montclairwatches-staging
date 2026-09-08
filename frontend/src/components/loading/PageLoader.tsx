import { cn } from "@/lib/utils";

interface PageLoaderProps {
  className?: string;
  /** Fills the viewport (route-level) vs. a bounded container (section-level) */
  fullScreen?: boolean;
}

/**
 * Branded route/page-level loader. Used as the Suspense fallback for
 * lazy-loaded routes (see App.tsx) and anywhere an entire page's data
 * is still resolving.
 */
export function PageLoader({ className, fullScreen = false }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "min-h-[60vh]",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-eyebrow uppercase tracking-[0.25em] text-muted-foreground font-bold">
          Loading
        </p>
      </div>
    </div>
  );
}
