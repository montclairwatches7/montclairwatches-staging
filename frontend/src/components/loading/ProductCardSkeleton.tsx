import { Skeleton } from "./Skeleton";

/**
 * Mirrors ProductCard's exact box model (article > aspect-square image tile >
 * p-3 sm:p-5 text block) so swapping this for the real card causes zero
 * layout shift. Keep in sync with components/ProductCard.tsx.
 */
export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
      <Skeleton rounded="none" className="w-full aspect-square bg-zinc-100" />

      <div className="flex flex-col p-3 sm:p-5 gap-2 sm:gap-3.5">
        <div className="space-y-1.5 sm:space-y-2">
          <Skeleton height="0.6rem" width="35%" rounded="sm" />
          <div className="h-8 sm:h-10 flex flex-col justify-start gap-1.5">
            <Skeleton height="0.75rem" width="90%" rounded="sm" />
            <Skeleton height="0.75rem" width="60%" rounded="sm" />
          </div>
        </div>

        <Skeleton height="1rem" width="45%" rounded="sm" />
      </div>
    </article>
  );
}
