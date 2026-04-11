import { Skeleton } from "@/components/ui/skeleton";

const AdminStatSkeleton = () => (
  <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
    <Skeleton className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-70" />
    <Skeleton className="relative h-12 w-12 shrink-0 rounded-xl" />
    <div className="relative min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-xl" />
      <Skeleton className="h-3 w-16 rounded-full" />
    </div>
  </div>
);

export default function AdminDashboardSkeleton() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3 pl-12 lg:pl-0">
          <Skeleton className="h-8 w-[72%] max-w-64 rounded-xl" />
          <Skeleton className="h-4 w-[66%] max-w-60 rounded-full" />
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-3 sm:w-auto">
          <Skeleton className="h-10 w-full rounded-xl sm:w-40" />
          <Skeleton className="h-10 w-[48%] rounded-xl sm:w-32" />
          <Skeleton className="h-10 w-[48%] rounded-xl sm:w-36" />
        </div>
      </div>

      <Skeleton className="mb-4 h-11 w-full rounded-xl" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex-1">
            <AdminStatSkeleton />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </section>

        <section className="overflow-hidden rounded-2xl shadow-sm">
          <Skeleton className="h-[280px] w-full" />
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] gap-4 border-b border-border/60 pb-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-4 rounded-full" />
              ))}
            </div>
            <div className="space-y-4 pt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_100px] items-center gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-28 rounded-full" />
                      <Skeleton className="h-3 w-20 rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16 rounded-md" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
