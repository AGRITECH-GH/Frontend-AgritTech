import { Skeleton, SkeletonTextBlock } from "@/components/ui/skeleton";

const StatCardSkeleton = () => (
  <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 shadow-sm">
    <Skeleton className="absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-70" />
    <Skeleton className="relative h-12 w-12 shrink-0 rounded-xl" />
    <div className="relative min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-xl" />
      <Skeleton className="h-3 w-20 rounded-full" />
    </div>
  </div>
);

const QuickActionCardSkeleton = ({ tone = "default" }) => (
  <div
    className={`rounded-2xl px-6 py-5 ${tone === "dark" ? "bg-primary" : "bg-white shadow-sm"}`}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-3">
        <Skeleton
          tone={tone === "dark" ? "dark" : "default"}
          className="h-11 w-11 rounded-xl"
        />
        <Skeleton
          tone={tone === "dark" ? "dark" : "default"}
          className="h-4 w-36 rounded-full"
        />
        <Skeleton
          tone={tone === "dark" ? "dark" : "default"}
          className="h-3 w-28 rounded-full"
        />
      </div>
      <Skeleton
        tone={tone === "dark" ? "dark" : "default"}
        className="h-5 w-5 rounded-full"
      />
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <main className="container py-6 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-[72%] max-w-64 rounded-xl" />
          <Skeleton className="h-4 w-[62%] max-w-52 rounded-full" />
        </div>
        <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="mb-6 h-11 w-full rounded-xl" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex-1">
            <StatCardSkeleton />
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <QuickActionCardSkeleton tone="dark" />
        <QuickActionCardSkeleton />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40 rounded-full" />
              <Skeleton className="h-3 w-32 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>

          <div className="mb-4 grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-3 rounded-full" />
            ))}
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border/60 bg-surface p-4"
                >
                  <Skeleton className="mb-2 h-3 w-16 rounded-full" />
                  <SkeletonTextBlock
                    lines={2}
                    className="mb-4"
                    lastLineClassName="w-5/6"
                  />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1 rounded-xl" />
                    <Skeleton className="h-9 w-20 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-full" />
                    <Skeleton className="h-3 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="rounded-2xl bg-foreground px-6 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Skeleton tone="dark" className="h-6 w-44 rounded-full" />
            <Skeleton
              tone="dark"
              className="h-4 w-[72%] max-w-60 rounded-full"
            />
          </div>
          <div className="flex gap-3">
            <Skeleton tone="dark" className="h-11 w-32 rounded-xl" />
            <Skeleton tone="dark" className="h-11 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
