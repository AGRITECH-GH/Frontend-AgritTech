import { Skeleton } from "@/components/ui/skeleton";

const OrdersHeaderSkeleton = ({ showAction = true }) => (
  <section className="mb-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-7 w-36 rounded-xl" />
          <Skeleton className="h-4 w-[86%] max-w-48 rounded-full" />
        </div>
      </div>
      {showAction ? <Skeleton className="h-10 w-28 rounded-xl" /> : null}
    </div>
  </section>
);

export function OrdersBuyerSkeleton({ showHeader = true, showFilters = true }) {
  return (
    <>
      {showHeader ? <OrdersHeaderSkeleton /> : null}
      {showFilters ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : null}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
              </div>
              <Skeleton className="hidden h-6 w-24 rounded-full sm:block" />
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
              <Skeleton className="hidden h-5 w-5 rounded-full sm:block" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export function OrdersFarmerSkeleton({
  showHeader = true,
  showFilters = true,
}) {
  return (
    <>
      {showHeader ? (
        <div className="mb-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-xl" />
            <Skeleton className="h-4 w-[78%] max-w-56 rounded-full" />
          </div>
        </div>
      ) : null}
      {showFilters ? (
        <div className="mb-5 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      ) : null}
      <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="min-w-[860px]">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-3 border-b border-border px-4 py-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_1fr_80px] items-center gap-3 border-b border-border/50 px-4 py-4"
            >
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
