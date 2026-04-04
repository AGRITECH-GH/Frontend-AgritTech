import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/lib";
import AdminLayout from "@/components/admin/AdminLayout";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractUsers = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.users,
    response.items,
    response.data?.users,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getPagination = (response, fallbackPage, fallbackLimit, totalItems) => {
  const pagination = response?.pagination || response?.data?.pagination || {};

  const page = toNumber(pagination.page, fallbackPage);
  const limit = toNumber(pagination.limit, fallbackLimit);
  const total = toNumber(pagination.total, totalItems);
  const totalPages = toNumber(
    pagination.totalPages,
    Math.max(1, Math.ceil(total / Math.max(1, limit))),
  );

  return { page, limit, total, totalPages };
};

const normalizeUser = (user, index) => {
  const id = user.id || user._id || `user-${index}`;
  const name = user.fullName || user.name || user.username || "Unknown User";
  const email = user.email || "No email";
  const role = user.role || "UNKNOWN";
  const isVerified = Boolean(
    user.isVerified ?? user.verified ?? user.emailVerified ?? false,
  );

  const activeFromIsActive =
    typeof user.isActive === "boolean" ? user.isActive : undefined;
  const activeFromStatus =
    typeof user.status === "string"
      ? user.status.toLowerCase() === "active"
      : undefined;
  const isActive =
    activeFromIsActive !== undefined
      ? activeFromIsActive
      : activeFromStatus !== undefined
        ? activeFromStatus
        : false;

  const joinedAt = user.createdAt || user.dateJoined || user.joinedAt || null;

  return {
    id,
    name,
    email,
    role,
    isActive,
    isVerified,
    joinedAt,
  };
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const roleBadgeClass = (role) => {
  const normalized = String(role || "").toUpperCase();

  if (normalized === "FARMER") return "bg-green-50 text-green-700";
  if (normalized === "BUYER") return "bg-blue-50 text-blue-700";
  if (normalized === "AGENT") return "bg-purple-50 text-purple-700";
  if (normalized === "ADMIN") return "bg-orange-50 text-orange-700";
  return "bg-gray-100 text-gray-700";
};

const AdminUsers = () => {
  const { user: authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch =
    searchParams.get("q") || searchParams.get("sellerId") || "";

  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: "BUYER",
    isActive: true,
    isVerified: false,
  });

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl:
      authUser?.profilePhotoUrl ||
      authUser?.avatarUrl ||
      authUser?.profileImage ||
      null,
  };

  const queryParams = useMemo(
    () => ({
      role: role || undefined,
      isActive:
        isActiveFilter === ""
          ? undefined
          : isActiveFilter === "true"
            ? true
            : false,
      search: search.trim() || undefined,
      page,
      limit,
    }),
    [role, isActiveFilter, search, page, limit],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await adminService.getAllUsers(queryParams);
        if (cancelled) return;

        const normalizedUsers = extractUsers(response).map(normalizeUser);
        setUsers(normalizedUsers);
        setPagination(
          getPagination(response, page, limit, normalizedUsers.length),
        );
      } catch (err) {
        console.error("Failed to load users:", err);
        if (!cancelled) {
          setError(err.message || "Failed to load users.");
          setUsers([]);
          setPagination({ page, limit, total: 0, totalPages: 1 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [queryParams, page, limit]);

  const onApplyFilters = () => setPage(1);

  const onClearFilters = () => {
    setSearch("");
    setRole("");
    setIsActiveFilter("");
    setPage(1);
    setLimit(20);
  };

  const handleToggleUserActive = async (user) => {
    if (!user?.id) return;

    setActionError("");
    setActionSuccess("");
    setUpdatingUserId(user.id);

    try {
      const nextIsActive = !user.isActive;
      await adminService.updateUser(user.id, { isActive: nextIsActive });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id ? { ...item, isActive: nextIsActive } : item,
        ),
      );

      setActionSuccess(
        nextIsActive
          ? "User account enabled successfully."
          : "User account disabled successfully.",
      );
    } catch (err) {
      console.error("Failed to update user:", err);
      setActionError(err.message || "Failed to update user.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const openEditModal = (user) => {
    setActionError("");
    setActionSuccess("");
    setEditingUser(user);
    setEditForm({
      role: String(user?.role || "BUYER").toUpperCase(),
      isActive: Boolean(user?.isActive),
      isVerified: Boolean(user?.isVerified),
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({
      role: "BUYER",
      isActive: true,
      isVerified: false,
    });
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    if (!editingUser?.id) return;

    setActionError("");
    setActionSuccess("");
    setUpdatingUserId(editingUser.id);

    try {
      await adminService.updateUser(editingUser.id, {
        role: editForm.role,
        isActive: editForm.isActive,
        isVerified: editForm.isVerified,
      });

      setUsers((prev) =>
        prev.map((item) =>
          item.id === editingUser.id
            ? {
                ...item,
                role: editForm.role,
                isActive: editForm.isActive,
                isVerified: editForm.isVerified,
              }
            : item,
        ),
      );

      setActionSuccess("User updated successfully.");
      closeEditModal();
    } catch (err) {
      console.error("Failed to update user:", err);
      setActionError(err.message || "Failed to update user.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      `Delete user ${user.name}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionError("");
    setActionSuccess("");
    setDeletingUserId(user.id);

    try {
      await adminService.deleteUser(user.id);
      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setPagination((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));
      setActionSuccess("User deleted successfully.");
    } catch (err) {
      console.error("Failed to delete user:", err);
      setActionError(err.message || "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 pl-12 lg:pl-0">
          <h1 className="text-2xl font-bold text-foreground">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted">
            Fetch and filter users using the admin users endpoint.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex items-center rounded-xl border border-border px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
              />
            </div>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="FARMER">FARMER</option>
              <option value="BUYER">BUYER</option>
              <option value="AGENT">AGENT</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <select
              value={isActiveFilter}
              onChange={(e) => setIsActiveFilter(e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onApplyFilters}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={onClearFilters}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {actionError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {actionError}
          </div>
        )}

        {actionSuccess && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {actionSuccess}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-white shadow-sm">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-border bg-surface/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Verified
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 hover:bg-surface/30"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          user.isVerified
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {user.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {formatDate(user.joinedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          disabled={
                            updatingUserId === user.id ||
                            deletingUserId === user.id
                          }
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleUserActive(user)}
                          disabled={
                            updatingUserId === user.id ||
                            deletingUserId === user.id
                          }
                          className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {updatingUserId === user.id
                            ? "Saving..."
                            : user.isActive
                              ? "Disable"
                              : "Enable"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user)}
                          disabled={
                            deletingUserId === user.id ||
                            updatingUserId === user.id
                          }
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingUserId === user.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing page {pagination.page} of {pagination.totalPages}. Total
            users: {pagination.total}.
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={pagination.page <= 1 || loading}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="h-4 w-4" />
                Previous
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((prev) =>
                  Math.min(pagination.totalPages || 1, prev + 1),
                )
              }
              disabled={pagination.page >= pagination.totalPages || loading}
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex items-center gap-1">
                Next
                <ChevronRight className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>

        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-5 shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Update User
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    Manage access, role, and verification for {editingUser.name}
                    .
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-lg border border-border px-3 py-1 text-sm text-foreground hover:bg-surface"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="rounded-xl bg-surface/60 p-3 text-sm text-foreground/80">
                  <p className="font-medium text-foreground">
                    {editingUser.name}
                  </p>
                  <p>{editingUser.email}</p>
                </div>

                <label className="block text-sm text-foreground">
                  Role
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                  >
                    <option value="FARMER">FARMER</option>
                    <option value="BUYER">BUYER</option>
                    <option value="AGENT">AGENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                    Active account
                  </label>

                  <label className="flex items-center gap-2 rounded-xl border border-border px-3 py-3 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={editForm.isVerified}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          isVerified: e.target.checked,
                        }))
                      }
                    />
                    Verified user
                  </label>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  Set <strong>isActive</strong> to false to revoke access. Set
                  the role to <strong>ADMIN</strong> to transfer ownership to
                  another user.
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={updatingUserId === editingUser.id}
                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {updatingUserId === editingUser.id
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminLayout>
  );
};

export default AdminUsers;
