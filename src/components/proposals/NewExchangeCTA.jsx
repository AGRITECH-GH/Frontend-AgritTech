import { ClipboardList } from "lucide-react";

/**
 * NewExchangeCTA – "Start a New Exchange" card shown in the proposals grid.
 * The Quick Create button is a no-op for now.
 */
const NewExchangeCTA = () => (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-green-50/50 p-8 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ClipboardList className="h-7 w-7 text-primary" />
        </div>
        <h3 className="mb-1 text-base font-bold text-foreground">
            Start a New Exchange
        </h3>
        <p className="mb-5 max-w-[180px] text-sm text-muted">
            Trade your surplus goods for the tools and supplies you need today.
        </p>
        <button
            type="button"
            className="rounded-xl border border-border bg-white px-6 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface"
        >
            Quick Create
        </button>
    </div>
);

export default NewExchangeCTA;
