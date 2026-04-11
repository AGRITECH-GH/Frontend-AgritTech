import { Skeleton } from "@/components/ui/skeleton";

const ProposalCardSkeleton = () => (
  <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>

    <div className="rounded-xl bg-surface px-4 py-4">
      <div className="flex items-center justify-center gap-4">
        <div className="text-center">
          <Skeleton className="mx-auto mb-2 h-14 w-14 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
        <div className="text-center">
          <Skeleton className="mx-auto mb-2 h-14 w-14 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
    </div>

    <div className="mt-4 space-y-2">
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-3/4 rounded-full" />
    </div>

    <div className="mt-4 flex gap-2">
      <Skeleton className="h-10 flex-1 rounded-xl" />
      <Skeleton className="h-10 w-24 rounded-xl" />
    </div>
  </div>
);

export default function BarterProposalsSkeleton() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-[64%] max-w-48 rounded-xl" />
          <Skeleton className="h-4 w-[76%] max-w-60 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl sm:w-64" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <ProposalCardSkeleton key={index} />
          ))}
        </div>
        <div className="flex flex-col gap-5">
          {Array.from({ length: 2 }).map((_, index) => (
            <ProposalCardSkeleton key={index} />
          ))}
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-green-50/50 p-8 text-center">
            <Skeleton className="mx-auto mb-4 h-14 w-14 rounded-full" />
            <Skeleton className="mx-auto h-5 w-32 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-4 w-40 rounded-full" />
            <Skeleton className="mx-auto mt-5 h-10 w-28 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#0f2d1a] px-6 py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton tone="dark" className="h-6 w-40 rounded-full" />
            <Skeleton
              tone="dark"
              className="h-4 w-[82%] max-w-64 rounded-full"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 text-center">
                <Skeleton tone="dark" className="h-8 w-16 rounded-xl" />
                <Skeleton tone="dark" className="h-3 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
