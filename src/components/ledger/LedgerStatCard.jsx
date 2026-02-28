import { DollarSign, Clock, BarChart2 } from "lucide-react";

const config = {
  sales: {
    Icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-primary",
    cardBorder: "border-green-100",
  },
  pending: {
    Icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
    cardBorder: "border-orange-100",
  },
  transactions: {
    Icon: BarChart2,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    cardBorder: "border-blue-100",
  },
};

/**
 * LedgerStatCard – KPI card styled for the Ledger page.
 * Lighter variant without the bold green blob of the main StatCard.
 *
 * @param {{ label: string, value: string, icon: string }} props
 */
const LedgerStatCard = ({ label, value, icon }) => {
  const { Icon, iconBg, iconColor, cardBorder } = config[icon] ?? config.sales;

  return (
    <div
      className={`flex flex-1 items-center gap-4 rounded-2xl border bg-white px-5 py-5 shadow-sm ${cardBorder}`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted">{label}</p>
        <p className="truncate text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default LedgerStatCard;
