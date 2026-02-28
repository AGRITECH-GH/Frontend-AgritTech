import CommissionCard from "@/components/agent/CommissionCard";

/**
 * CommissionTransparency – grid of commission rate cards with tier badge.
 *
 * @param {{ tiers: Array<{ id, label, rate, icon }> }} props
 */
const CommissionTransparency = ({ tiers }) => (
  <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">
        Commission Transparency
      </h2>
      <span className="rounded-full border border-border px-3 py-0.5 text-xs font-semibold text-foreground/70">
        Standard Tiers
      </span>
    </div>

    {/* Grid */}
    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
      {tiers.map((tier) => (
        <CommissionCard
          key={tier.id}
          label={tier.label}
          rate={tier.rate}
          icon={tier.icon}
        />
      ))}
    </div>

    {/* Footnote */}
    <p className="mt-4 text-[11px] leading-relaxed text-muted/80">
      * Commission is calculated on the net value of each transaction and
      deposited into your account upon successful verification.
    </p>
  </div>
);

export default CommissionTransparency;
