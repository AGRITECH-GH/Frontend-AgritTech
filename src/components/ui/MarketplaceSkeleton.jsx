import { Skeleton } from "@/components/ui/skeleton";

export default function MarketplaceSkeleton() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="h-fit rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </aside>

      <section className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Skeleton className="h-4 w-36 rounded-full" />
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-2xl border border-border/60"
            >
              <Skeleton className="h-52 w-full" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded-full" />
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </section>
    </section>
  );
}
