import {
  Search,
  Calendar,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Wheat, Apple, Leaf, Carrot } from "lucide-react";

const statusConfig = {
  completed: { label: "COMPLETED", class: "bg-green-100 text-green-700" },
  pending: { label: "PENDING", class: "bg-orange-100 text-orange-600" },
  failed: { label: "FAILED", class: "bg-red-100 text-red-600" },
};

// Simple deterministic icon per product (cycles through list)
const productIcons = [Wheat, Apple, Leaf, Carrot];

const ProductIcon = ({ index }) => {
  const Icon = productIcons[index % productIcons.length];
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-50">
      <Icon className="h-5 w-5 text-primary" />
    </span>
  );
};

/**
 * TransactionsTable – searchable, date-filterable, paginated ledger table.
 */
const TransactionsTable = ({
  transactions,
  filtered,
  searchQuery,
  onSearch,
  dateRange,
  onDateChange,
  formattedDateRange,
  currentPage,
  totalPages,
  onPageChange,
  totalFiltered,
}) => {
  // Build page numbers to show: always show 1, last, current ± 1, with ellipsis
  const pageNumbers = (() => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set(
      [1, totalPages, currentPage, currentPage - 1, currentPage + 1].filter(
        (p) => p >= 1 && p <= totalPages,
      ),
    );
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
      result.push(sorted[i]);
    }
    return result;
  })();

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      {/* ── Toolbar ── */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="flex items-center rounded-xl border border-border bg-surface px-3 py-2.5">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search by item or transaction ID..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none sm:w-72"
          />
        </div>

        {/* Date range + Filters */}
        <div className="flex items-center gap-2">
          {/* Date range pickers (hidden inputs, display formatted label) */}
          <div className="relative flex items-center gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground">
            <Calendar className="mr-1 h-4 w-4 shrink-0 text-muted" />
            <span className="whitespace-nowrap">{formattedDateRange}</span>
            {/* Invisible stacked date inputs */}
            <div className="absolute inset-0 flex overflow-hidden rounded-xl opacity-0">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => onDateChange("from", e.target.value)}
                className="w-1/2 cursor-pointer"
              />
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => onDateChange("to", e.target.value)}
                className="w-1/2 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground hover:bg-white"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted" />
            Filters
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {[
                "Date",
                "Transaction Details",
                "Quantity",
                "Total Price",
                "Status",
              ].map((col) => (
                <th
                  key={col}
                  className="pb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted"
                >
                  No transactions match your search.
                </td>
              </tr>
            ) : (
              transactions.map((trx, idx) => {
                const status = statusConfig[trx.status] ?? statusConfig.pending;
                return (
                  <tr key={trx.id} className="group">
                    {/* Date */}
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-foreground">
                        {trx.date}
                      </p>
                      <p className="text-xs text-muted">{trx.time}</p>
                    </td>

                    {/* Transaction details */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <ProductIcon index={idx} />
                        <div>
                          <p className="font-semibold text-foreground">
                            {trx.name}
                          </p>
                          <p className="text-xs text-muted">{trx.trxId}</p>
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 pr-4 text-foreground/70">
                      {trx.quantity}
                    </td>

                    {/* Total price */}
                    <td className="py-4 pr-4 font-bold text-foreground">
                      $
                      {trx.totalPrice.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${status.class}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: count + pagination ── */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {transactions.length === 0 ? 0 : (currentPage - 1) * 4 + 1} -{" "}
            {Math.min(currentPage * 4, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          transactions
        </p>

        {/* Pagination */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-sm text-muted">
                ...
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  p === currentPage
                    ? "bg-primary text-white"
                    : "border border-border text-foreground hover:bg-surface"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;
