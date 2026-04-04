import { Tag, DollarSign, Repeat, Clock, Users } from "lucide-react";

const iconMap = {
  tag: Tag,
  dollar: DollarSign,
  repeat: Repeat,
  clock: Clock,
  users: Users,
};

/**
 * StatCard – displays a single KPI on the dashboard header row.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   icon: string,
 *   trend?: string,
 *   trendType?: 'positive' | 'negative' | 'warning' | 'neutral'
 * }} props
 *
 * trendType controls the colour of the trend sub-label:
 *   positive → green, negative → red, warning → orange, neutral → muted (default)
 */
const trendColors = {
  positive: "text-green-600",
  negative: "text-red-500",
  warning: "text-orange-500",
  neutral: "text-muted",
};

const StatCard = ({
  label,
  value,
  icon,
  trend,
  trendType = "neutral",
  onClick,
}) => {
  const Icon = iconMap[icon] ?? Tag;

  const content = (
    <>
      {/* Decorative green blob */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-primary/10"
      />

      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary">
        <Icon className="h-5 w-5 text-white" />
      </span>

      <div className="relative min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="truncate text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className={`mt-0.5 text-xs font-medium ${trendColors[trendType]}`}>
            {trend}
          </p>
        )}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`View ${label} details`}
        className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 text-left shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="relative flex flex-1 items-center gap-4 overflow-hidden rounded-2xl bg-white px-5 py-5 text-left shadow-sm">
      {content}
    </div>
  );
};

export default StatCard;
