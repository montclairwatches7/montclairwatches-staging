import { ProductCardSkeleton } from "./ProductCardSkeleton";
import { cn } from "@/lib/utils";

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
  /** Set true to match CollectionPage's 2/3/3/4-col grid instead of the default Home 2/3/4-col grid */
  dense?: boolean;
}

/**
 * Matches the responsive grid classes used on HomePage's featured-products
 * section and CollectionPage's product grid. Keep the grid-cols-* values in
 * sync with those pages so the skeleton and the real grid resolve to the
 * same column count at every breakpoint (no layout shift on swap).
 */
export function ProductGridSkeleton({ count = 8, className, dense = false }: ProductGridSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className={cn(
        "grid gap-x-3 sm:gap-x-8 gap-y-8 sm:gap-y-16",
        dense ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
