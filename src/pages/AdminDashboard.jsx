import { Search, Calendar } from "lucide-react";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import AdminLayout from "@/components/admin/AdminLayout";
import StatCard from "@/components/dashboard/StatCard";
import ListingActivityChart from "@/components/admin/ListingActivityChart";
import RegionalFocusCard from "@/components/admin/RegionalFocusCard";
import UserManagementTable from "@/components/admin/UserManagementTable";

const AdminDashboard = () => {
  const {
    admin,
    stats,
    chartData,
    regionalFocus,
    paginatedUsers,
    totalUsers,
    currentPage,
    totalPages,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    dateRange,
    toggleUserStatus,
    onViewUser,
    onGenerateReport,
    onReviewRegion,
  } = useAdminDashboard();

  return (
    <AdminLayout admin={admin}>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
        {/* ── Page header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl font-bold text-foreground">
              Admin System Overview
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              Real-time marketplace performance and oversight.
            </p>
          </div>

          {/* Search + date + report */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center rounded-xl border border-border bg-white px-3 py-2 shadow-sm">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search data..."
                className="w-32 bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none sm:w-44"
              />
            </div>

            {/* Date range */}
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-surface"
            >
              <Calendar className="h-4 w-4 text-muted" />
              {dateRange}
            </button>

            {/* Generate report */}
            <button
              type="button"
              onClick={onGenerateReport}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Generate Report
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          {stats.map((stat) => (
            <StatCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendType={stat.trendType}
            />
          ))}
        </div>

        {/* ── Chart + Regional focus ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <ListingActivityChart data={chartData} />
          <RegionalFocusCard
            badge={regionalFocus.badge}
            title={regionalFocus.title}
            description={regionalFocus.description}
            imageUrl={regionalFocus.imageUrl}
            onReview={onReviewRegion}
          />
        </div>

        {/* ── User management table ── */}
        <UserManagementTable
          users={paginatedUsers}
          totalUsers={totalUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onToggle={toggleUserStatus}
          onView={onViewUser}
        />
      </main>
    </AdminLayout>
  );
};

export default AdminDashboard;
