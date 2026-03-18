import { ShieldCheck } from "lucide-react";

const stats = [
    { value: "1.2k+", label: "Successful Trades" },
    { value: "98%", label: "Trust Rating" },
    { value: "24h", label: "Avg. Response" },
];

/**
 * BarterProtocolBanner – dark green banner that communicates trust & safety stats.
 */
const BarterProtocolBanner = () => (
    <div className="rounded-2xl bg-[#0f2d1a] px-6 py-8 text-white sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: copy */}
            <div className="max-w-md">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    Safe Barter Protocol
                </span>
                <h2 className="mb-1 text-lg font-bold">
                    Your trades are protected by BarterHub
                </h2>
                <p className="text-sm text-white/60">
                    All users are verified through our local agriculture network. We hold
                    assets in digital escrow until both parties confirm delivery for
                    high-value barters.
                </p>
            </div>

            {/* Right: stats */}
            <div className="flex shrink-0 gap-8">
                {stats.map(({ value, label }) => (
                    <div key={label} className="text-center">
                        <p className="text-2xl font-bold text-primary">{value}</p>
                        <p className="text-xs text-white/60">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default BarterProtocolBanner;
