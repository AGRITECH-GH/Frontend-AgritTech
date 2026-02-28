import { Plus, BookOpen } from "lucide-react";

/**
 * QuickActions – "Add New Product" and "View Ledger" primary CTA cards.
 *
 * @param {{ onAddProduct: () => void, onViewLedger: () => void }} props
 */
const QuickActions = ({ onAddProduct, onViewLedger }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {/* Add New Product */}
    <button
      type="button"
      onClick={onAddProduct}
      className="flex items-center gap-4 rounded-2xl bg-primary px-6 py-5 text-left transition-opacity hover:opacity-90"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
        <Plus className="h-5 w-5 text-white" />
      </span>
      <div>
        <p className="text-base font-bold text-white">Add New Product</p>
        <p className="text-sm text-white/80">
          List your crops for sale or barter
        </p>
      </div>
    </button>

    {/* View Ledger */}
    <button
      type="button"
      onClick={onViewLedger}
      className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 text-left shadow-sm transition-shadow hover:shadow"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50">
        <BookOpen className="h-5 w-5 text-primary" />
      </span>
      <div>
        <p className="text-base font-bold text-foreground">View Ledger</p>
        <p className="text-sm text-muted">Track payments and transactions</p>
      </div>
    </button>
  </div>
);

export default QuickActions;
