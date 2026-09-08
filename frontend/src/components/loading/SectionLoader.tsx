import { cn } from "@/lib/utils";

interface SectionLoaderProps {
  className?: string;
  label?: string;
  size?: "sm" | "md";
}

/**
 * Small inline loader for a section/component that's fetching data
 * while the rest of the page is already interactive (e.g. a filtered
 * results panel). Not for full-page loads — use PageLoader for that.
 */
export function SectionLoader({ className, label, size = "md" }: SectionLoaderProps) {
  const spinnerSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div
      role="status"
      aria-label={label || "Loading"}
      className={cn("flex items-center justify-center gap-3 py-10", className)}
    >
      <div className={cn("border-2 border-primary border-t-transparent rounded-full animate-spin", spinnerSize)} />
      {label && <span className="text-xs text-muted-foreground font-medium">{label}</span>}
    </div>
  );
}
