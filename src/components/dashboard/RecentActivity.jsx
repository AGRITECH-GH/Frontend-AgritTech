import { CreditCard, CheckCircle2, TrendingUp } from "lucide-react";

const activityConfig = {
  payment: {
    Icon: CreditCard,
    iconClass: "text-blue-500",
    bgClass: "bg-blue-50",
  },
  order: {
    Icon: CheckCircle2,
    iconClass: "text-green-600",
    bgClass: "bg-green-50",
  },
  price: {
    Icon: TrendingUp,
    iconClass: "text-orange-500",
    bgClass: "bg-orange-50",
  },
};

/**
 * RecentActivity – feed of the latest farm events.
 *
 * @param {{ items: Array, onViewHistory: () => void }} props
 */
const RecentActivity = ({ items, onViewHistory }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    <h2 className="mb-4 text-base font-bold text-foreground">
      Recent Activity
    </h2>

    <div className="flex flex-col gap-4">
      {items.map((item) => {
        const { Icon, iconClass, bgClass } =
          activityConfig[item.type] ?? activityConfig.order;

        return (
          <div key={item.id} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass}`}
            >
              <Icon className={`h-4 w-4 ${iconClass}`} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {item.title}
              </p>
              <p className="truncate text-xs text-muted">{item.detail}</p>
              <p className="mt-0.5 text-[11px] text-muted/70">{item.timeAgo}</p>
            </div>
          </div>
        );
      })}
    </div>

    <button
      type="button"
      onClick={onViewHistory}
      className="mt-5 w-full text-center text-sm font-medium text-primary hover:underline"
    >
      View Full History
    </button>
  </div>
);

export default RecentActivity;
