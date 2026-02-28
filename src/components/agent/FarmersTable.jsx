import { Search, SlidersHorizontal, MoreVertical, User } from "lucide-react";

const statusConfig = {
  verified: {
    label: "VERIFIED",
    class: "bg-green-100 text-green-700",
  },
  processing: {
    label: "PROCESSING",
    class: "bg-blue-100 text-blue-700",
  },
  pending: {
    label: "PENDING",
    class: "bg-yellow-100 text-yellow-700",
  },
};

/**
 * FarmersTable – searchable list of farmers registered under the agent.
 *
 * @param {{
 *   farmers: Array,
 *   searchQuery: string,
 *   onSearchChange: (q: string) => void,
 *   onAction: (id, action) => void
 * }} props
 */
const FarmersTable = ({ farmers, searchQuery, onSearchChange, onAction }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    {/* Header */}
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-bold text-foreground">
        Your Registered Farmers
      </h2>

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-xl border border-border bg-surface px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search farmer name..."
            className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none sm:w-52"
          />
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted hover:bg-white hover:text-foreground"
          aria-label="Filter"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-border/60">
            {[
              "Farmer Details",
              "Location",
              "Status",
              "Last Activity",
              "Total Commission",
              "",
            ].map((col) => (
              <th
                key={col}
                className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {farmers.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-sm text-muted">
                No farmers match your search.
              </td>
            </tr>
          ) : (
            farmers.map((farmer) => {
              const status =
                statusConfig[farmer.status] ?? statusConfig.pending;
              return (
                <tr key={farmer.id} className="group">
                  {/* Farmer details */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-50 text-primary">
                        {farmer.avatarUrl ? (
                          <img
                            src={farmer.avatarUrl}
                            alt={farmer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {farmer.name}
                        </p>
                        <p className="text-xs text-muted">
                          Registered {farmer.registeredDate}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3 pr-4 text-foreground/70">
                    {farmer.location}
                  </td>

                  {/* Status badge */}
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${status.class}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  {/* Last activity */}
                  <td className="py-3 pr-4 text-foreground/70">
                    {farmer.lastActivity}
                  </td>

                  {/* Total commission */}
                  <td className="py-3 pr-4 font-semibold text-foreground">
                    {farmer.totalCommission}
                  </td>

                  {/* Actions */}
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => onAction(farmer.id, "menu")}
                      className="rounded-full p-1 text-muted/50 opacity-0 transition-opacity hover:bg-surface hover:text-foreground group-hover:opacity-100"
                      aria-label="More options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default FarmersTable;
