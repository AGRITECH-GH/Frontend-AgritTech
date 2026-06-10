import { Skeleton } from "@/components/ui/skeleton";

const InventoryStatCardSkeleton = () => (
  <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
    <Skeleton className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-70" />
    <Skeleton className="relative h-12 w-12 shrink-0 rounded-xl" />
    <div className="relative min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

export default function InventorySkeleton() {
  return (
    <main className="container py-6 lg:py-8">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-6 border-b border-border pb-4 sm:pb-0">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 pb-2">
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[80px_1.6fr_1fr_1.2fr_1fr_1fr_100px] gap-3 border-b border-border px-4 py-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[80px_1.6fr_1fr_1.2fr_1fr_1fr_100px] items-center gap-3 border-b border-border/50 px-4 py-3"
            >
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Skeleton className="h-3 w-10 rounded-full" />
                  <Skeleton className="h-3 w-8 rounded-full" />
                </div>
                <Skeleton className="h-1.5 w-32 rounded-full" />
              </div>
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <Skeleton className="h-4 w-40 rounded-full" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex-1">
            <InventoryStatCardSkeleton />
          </div>
        ))}
      </div>
    </main>
  );
}
