import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRevenueSkeleton() {
  return (
    <>
      <div className="mb-6 rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-50 to-white p-5 pl-12 shadow-sm lg:pl-5">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="mt-3 h-4 w-64 rounded-full" />
      </div>

      <section className="mb-8 rounded-2xl border border-border/60 bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Skeleton className="h-10 w-40 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-4 gap-4 border-b border-border bg-surface/60 px-4 py-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 rounded-full" />
              ))}
            </div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 border-b border-border/40 px-4 py-3"
              >
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <Skeleton className="h-4 w-36 rounded-full" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </section>
    </>
  );
}
