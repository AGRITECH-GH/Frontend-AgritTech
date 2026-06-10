import { Skeleton } from "@/components/ui/skeleton";

const LedgerStatCardSkeleton = () => (
  <div className="flex flex-1 items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-5 shadow-sm">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-3 w-20 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

export default function LedgerSkeleton() {
  return (
    <main className="container py-6 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-72 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {Array.from({ length: 3 }).map((_, index) => (
          <LedgerStatCardSkeleton key={index} />
        ))}
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-10 w-full rounded-xl sm:w-72" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 border-b border-border/60 pb-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 rounded-full" />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-4"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-40 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </section>

      <div className="mt-4 text-right">
        <Skeleton className="ml-auto h-4 w-32 rounded-full" />
        <Skeleton className="ml-auto mt-2 h-10 w-36 rounded-xl" />
      </div>
    </main>
  );
}
