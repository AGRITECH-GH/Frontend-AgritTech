import { Skeleton } from "@/components/ui/skeleton";

const AgentStatSkeleton = () => (
  <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
    <Skeleton className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-70" />
    <Skeleton className="relative h-12 w-12 shrink-0 rounded-xl" />
    <div className="relative min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
      <Skeleton className="h-3 w-20 rounded-full" />
    </div>
  </div>
);

export default function AgentDashboardSkeleton() {
  return (
    <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3 pl-12 lg:pl-0">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-[68%] max-w-56 rounded-full" />
        </div>
        <div className="flex w-full shrink-0 flex-wrap gap-3 sm:w-auto">
          <Skeleton className="h-10 flex-1 rounded-xl sm:w-32 sm:flex-none" />
          <Skeleton className="h-10 flex-1 rounded-xl sm:w-40 sm:flex-none" />
        </div>
      </div>

      <Skeleton className="mb-6 h-11 w-full rounded-xl" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex-1">
            <AgentStatSkeleton />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-44 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl bg-surface px-4 py-3"
              >
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-green-50 p-5 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-4 w-40 rounded-full" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-6 w-44 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-full rounded-xl sm:w-52" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-4 border-b border-border/60 pb-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 rounded-full" />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
