const cx = (...classes) => classes.filter(Boolean).join(" ");

export function Skeleton({ className = "", tone = "default", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cx(tone === "dark" ? "skeleton-dark" : "skeleton", className)}
      {...props}
    />
  );
}

export function SkeletonTextBlock({
  lines = 3,
  className = "",
  lastLineClassName = "w-2/3",
  lineClassName = "h-3 rounded-full",
}) {
  return (
    <div className={cx("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cx(
            lineClassName,
            index === lines - 1 ? lastLineClassName : "w-full",
          )}
        />
      ))}
    </div>
  );
}
