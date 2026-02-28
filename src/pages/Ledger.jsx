import { FileDown } from "lucide-react";
import { useLedger } from "@/hooks/useLedger";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import LedgerStatCard from "@/components/ledger/LedgerStatCard";
import TransactionsTable from "@/components/ledger/TransactionsTable";
import Footer from "@/components/Footer";

const Ledger = () => {
  const {
    user,
    stats,
    paginated,
    filtered,
    totalPages,
    currentPage,
    setCurrentPage,
    totalFiltered,
    searchQuery,
    onSearch,
    dateRange,
    onDateChange,
    formattedDateRange,
    onDownloadPDF,
  } = useLedger();

  return (
    <div className="min-h-screen bg-surface">
      <DashboardNavbar user={user} />

      <main className="container py-6 lg:py-8">
        {/* ── Page header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Sales &amp; Transaction Ledger
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Detailed record of your agricultural business activities
            </p>
          </div>

          <button
            type="button"
            onClick={onDownloadPDF}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <FileDown className="h-4 w-4" />
            Download PDF Ledger
          </button>
        </div>

        {/* ── Stat cards ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {stats.map((stat) => (
            <LedgerStatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* ── Transactions table ── */}
        <TransactionsTable
          transactions={paginated}
          filtered={filtered}
          searchQuery={searchQuery}
          onSearch={onSearch}
          dateRange={dateRange}
          onDateChange={onDateChange}
          formattedDateRange={formattedDateRange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalFiltered={totalFiltered}
        />

        {/* ── Total filtered period ── */}
        <div className="mt-4 text-right">
          <p className="text-sm text-muted">Total Filtered Period:</p>
          <div className="inline-block">
            <p className="text-3xl font-bold text-primary">
              <span className="mr-1 text-lg font-semibold text-muted">$</span>
              {totalFiltered.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </p>
            <div className="mt-1 h-0.5 w-full rounded-full bg-primary" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Ledger;
