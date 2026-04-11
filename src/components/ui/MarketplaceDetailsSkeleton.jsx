import { Skeleton, SkeletonTextBlock } from "@/components/ui/skeleton";

const SpecCell = () => (
  <div className="rounded-lg bg-[#f5f6f1] p-3">
    <Skeleton className="mb-2 h-3 w-20 rounded-full" />
    <Skeleton className="h-5 w-24 rounded-full" />
  </div>
);

const SimilarCard = () => (
  <div className="overflow-hidden rounded-lg border border-border/60">
    <Skeleton className="aspect-square w-full" />
    <div className="space-y-2 p-3">
      <Skeleton className="h-4 w-3/4 rounded-full" />
      <Skeleton className="h-3 w-1/2 rounded-full" />
      <Skeleton className="h-4 w-16 rounded-full" />
    </div>
  </div>
);

export default function MarketplaceDetailsSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32 rounded-full" />
      </div>

      <div className="grid gap-6 rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-3 overflow-x-auto">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-20 shrink-0 rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Skeleton className="mb-3 h-6 w-32 rounded-full" />
            <Skeleton className="h-10 w-4/5 rounded-xl" />
            <Skeleton className="mt-3 h-4 w-32 rounded-full" />
          </div>

          <div className="rounded-xl border border-border/40 bg-[#f9faf7] p-4">
            <Skeleton className="mb-2 h-3 w-12 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="mt-3 h-3 w-16 rounded-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-10 w-20 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>

          <div className="flex gap-3 border-t border-border/60 pt-4">
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-36 rounded-full" />
            <Skeleton className="h-3 w-[86%] max-w-48 rounded-full" />
            <Skeleton className="h-3 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 flex-1 rounded-lg" />
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-border/60 bg-white p-4 shadow-sm sm:p-6">
        <Skeleton className="mb-4 h-6 w-44 rounded-full" />
        <div className="grid gap-4 md:grid-cols-4">
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
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SimilarCard key={index} />
          ))}
        </div>
      </section>
    </div>
  );
}
