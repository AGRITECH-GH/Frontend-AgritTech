import { Skeleton, SkeletonTextBlock } from "@/components/ui/skeleton";

const SpecCell = () => (
  <div className="rounded-lg bg-[#f5f6f1] p-3">
    <Skeleton className="mb-2 h-3 w-20 rounded-full" />
    <Skeleton className="h-5 w-24 rounded-full" />
  </div>
);

const SimilarCard = () => (
  <div className="overflow-hidden rounded-2xl border border-border/60 bg-white">
    <Skeleton className="aspect-square w-full rounded-none" />
    <div className="p-4">
      <Skeleton className="mb-2 h-5 w-3/4 rounded-full" />
      <Skeleton className="mb-4 h-4 w-1/2 rounded-full" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export default function MarketplaceDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-16 shrink-0 rounded-full sm:w-20" />
        <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-20 shrink-0 rounded-full sm:w-24" />
        <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
        <Skeleton className="h-4 w-24 shrink-0 rounded-full sm:w-32" />
      </div>

      <div className="grid gap-4 rounded-3xl border border-border/60 bg-white p-3 shadow-sm sm:gap-6 sm:p-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3 sm:space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-16 w-16 shrink-0 rounded-lg sm:h-20 sm:w-20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-5 sm:space-y-6">
          <div>
            <Skeleton className="mb-3 h-6 w-28 rounded-full sm:w-32" />
            <Skeleton className="h-10 w-full rounded-xl sm:w-4/5" />
            <Skeleton className="mt-3 h-4 w-24 rounded-full sm:w-32" />
          </div>

          <div className="rounded-xl border border-border/40 bg-[#f9faf7] p-4">
            <Skeleton className="mb-2 h-3 w-12 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-xl sm:w-32" />
            <Skeleton className="mt-3 h-3 w-16 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg sm:h-10 sm:w-10" />
              <Skeleton className="h-9 w-16 rounded-lg sm:h-10 sm:w-20" />
              <Skeleton className="h-9 w-9 rounded-lg sm:h-10 sm:w-10" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row border-t border-border/60 pt-4">
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-3 w-full max-w-48 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 w-full sm:flex-1 rounded-lg" />
          <Skeleton className="h-10 w-full sm:flex-1 rounded-lg" />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-6 w-44 rounded-full" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SpecCell key={index} />
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-6 w-40 rounded-full" />
        <SkeletonTextBlock lines={6} lastLineClassName="w-4/5" />
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-6 w-44 rounded-full" />
        <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SimilarCard key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
