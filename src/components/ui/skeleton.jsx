import { cn } from "@/lib/utils";

export function Skeleton({ className = "" }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-gray-200", className)} />
  );
}

export function SkeletonTextBlock({
  lines = 3,
  className = "",
  lastLineClassName = "w-2/3",
  lineClassName = "h-3 rounded-full",
}) {
  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            lineClassName,
            index === lines - 1 ? lastLineClassName : "w-full",
          )}
        />
      ))}
    </div>
  );
}

export default Skeleton;
