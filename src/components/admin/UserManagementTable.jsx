import { Eye, SlidersHorizontal, Download } from "lucide-react";

const roleColors = {
  FARMER: "bg-green-50 text-green-700",
  BUYER: "bg-blue-50 text-blue-700",
  AGENT: "bg-purple-50 text-purple-700",
};

/** Generates initials from a full name */
const initials = (name) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

/**
 * UserManagementTable – paginated, searchable user table with status toggles.
 *
 * @param {{
 *   users: Array,
 *   totalUsers: number,
 *   currentPage: number,
 *   totalPages: number,
 *   onPageChange: (page: number) => void,
 *   onToggle: (id: number) => void,
 *   onView: (id: number) => void
 * }} props
 */
const UserManagementTable = ({
  users,
  totalUsers,
  currentPage,
  totalPages,
  onPageChange,
  onToggle,
  onView,
}) => {
  const pageSize = 3;
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalUsers);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">User Management</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground"
            aria-label="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground"
            aria-label="Export"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-border/60">
              {["User Details", "Role", "Date Joined", "Status", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted"
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((user) => {
              const isActive = user.status === "active";
              return (
                <tr key={user.id} className="group">
                  {/* User details */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-foreground/70">
                        {initials(user.name)}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
                        roleColors[user.role] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Date joined */}
                  <td className="py-3 pr-4 text-foreground/70">
                    {user.dateJoined}
                  </td>

                  {/* Status */}
                  <td className="py-3 pr-4">
                    <span
                      className={`flex items-center gap-1.5 text-sm font-semibold ${
                        isActive ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      <span
                        className={`inline-block h-2 w-2 rounded-full ${
                          isActive ? "bg-green-500" : "bg-red-400"
                        }`}
                      />
                      {isActive ? "Active" : "Suspended"}
                    </span>
                  </td>

                  {/* Actions: view + toggle */}
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      {/* Eye icon */}
                      <button
                        type="button"
                        onClick={() => onView(user.id)}
                        className="text-muted hover:text-foreground"
                        aria-label="View user"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {/* Toggle switch */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => onToggle(user.id)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                          isActive ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                            isActive ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-muted">
          Showing {startItem} to {endItem} of {totalUsers.toLocaleString()}{" "}
          users
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementTable;
