import { Sprout, Tractor, Package, ShieldCheck } from "lucide-react";

const iconMap = {
  seedling: Sprout,
  tractor: Tractor,
  box: Package,
  shield: ShieldCheck,
};

/**
 * CommissionCard – displays a single commission rate category.
 *
 * @param {{ label: string, rate: string, icon: string }} props
 */
const CommissionCard = ({ label, rate, icon }) => {
  const Icon = iconMap[icon] ?? Package;

  return (
    <div className="flex h-full items-center gap-3 rounded-xl bg-surface px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon className="h-5 w-5 text-primary" />
      </span>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-xl font-bold text-primary">{rate}</p>
      </div>
    </div>
  );
};

export default CommissionCard;
