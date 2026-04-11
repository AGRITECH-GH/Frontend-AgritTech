import { Skeleton } from "@/components/ui/skeleton";

export default function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      <section className="rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border/60 bg-[#fcfdf9] p-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="mt-1 h-4 w-4 rounded" />
                <Skeleton className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-3 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <div className="flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1">
                      <Skeleton className="h-7 w-7 rounded-full" />
                      <Skeleton className="h-4 w-6 rounded-full" />
                      <Skeleton className="h-7 w-7 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
          <Skeleton className="mb-5 h-6 w-28 rounded-full" />
          <div className="space-y-3 border-b border-border/60 pb-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3"
              >
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 py-4">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="mx-auto mt-4 h-4 w-32 rounded-full" />
        </section>
      </aside>
    </div>
  );
}
