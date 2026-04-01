import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminService, categoriesService } from "@/lib";
import AdminLayout from "@/components/admin/AdminLayout";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const extractOrders = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.orders,
    response.items,
    response.data?.orders,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const getOrderPagination = (response, fallbackPage, fallbackLimit, totalItems) => {
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

const extractCategories = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

  const candidates = [
    response.categories,
    response.items,
    response.data?.categories,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "-";
  return `₵${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const AdminRevenue = () => {
  const { user: authUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [orderLimit, setOrderLimit] = useState(20);

  const [orders, setOrders] = useState([]);
  const [ordersPagination, setOrdersPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  const [categorySource, setCategorySource] = useState("admin");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    iconUrl: "",
    parentId: "",
  });
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const [updateForm, setUpdateForm] = useState({
    id: "",
    name: "",
    isActive: true,
  });
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl: authUser?.avatarUrl || authUser?.profileImage || null,
  };

  const ordersQuery = useMemo(
    () => ({
      status: statusFilter || undefined,
      page: orderPage,
      limit: orderLimit,
    }),
    [statusFilter, orderPage, orderLimit],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const response = await adminService.getAllOrders(ordersQuery);
        if (cancelled) return;

        const normalizedOrders = extractOrders(response);
        setOrders(normalizedOrders);
        setOrdersPagination(
          getOrderPagination(response, orderPage, orderLimit, normalizedOrders.length),
        );
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        if (!cancelled) {
          setOrdersError(err.message || "Failed to fetch orders.");
          setOrders([]);
          setOrdersPagination({
            page: orderPage,
            limit: orderLimit,
            total: 0,
            totalPages: 1,
          });
        }
      } finally {
        if (!cancelled) {
          setOrdersLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [ordersQuery, orderPage, orderLimit]);

  useEffect(() => {
    let cancelled = false;

    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        const response =
          categorySource === "admin"
            ? await adminService.getCategories()
            : await categoriesService.getCategories();

        if (cancelled) return;

        const extracted = extractCategories(response);
        setCategories(extracted);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        if (!cancelled) {
          setCategoriesError(err.message || "Failed to fetch categories.");
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, [categorySource]);

  const handleCreateCategory = async (event) => {
    event.preventDefault();

    setCreateError("");
    setCreateSuccess("");

    if (!createForm.name.trim()) {
      setCreateError("Category name is required.");
      return;
    }

    setCreatingCategory(true);
    try {
      await adminService.createCategory({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        iconUrl: createForm.iconUrl.trim() || undefined,
        parentId: createForm.parentId.trim() || null,
      });

      setCreateSuccess("Category created successfully.");
      setCreateForm({ name: "", description: "", iconUrl: "", parentId: "" });

      if (categorySource === "admin") {
        const refreshed = await adminService.getCategories();
        setCategories(extractCategories(refreshed));
      }
    } catch (err) {
      console.error("Failed to create category:", err);
      setCreateError(err.message || "Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleUpdateCategory = async (event) => {
    event.preventDefault();

    setUpdateError("");
    setUpdateSuccess("");

    if (!updateForm.id.trim()) {
      setUpdateError("Category ID is required for update.");
      return;
    }

    setUpdatingCategory(true);
    try {
      const payload = {};
      if (updateForm.name.trim()) payload.name = updateForm.name.trim();
      payload.isActive = Boolean(updateForm.isActive);

      await adminService.updateCategory(updateForm.id.trim(), payload);
      setUpdateSuccess("Category updated successfully.");

      if (categorySource === "admin") {
        const refreshed = await adminService.getCategories();
        setCategories(extractCategories(refreshed));
      }
    } catch (err) {
      console.error("Failed to update category:", err);
      setUpdateError(err.message || "Failed to update category.");
    } finally {
      setUpdatingCategory(false);
    }
  };

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
        <div className="mb-6 pl-12 lg:pl-0">
          <h1 className="text-2xl font-bold text-foreground">Revenue & Categories</h1>
          <p className="mt-1 text-sm text-muted">
            Manage orders and category resources from admin endpoints.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Orders</h2>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Filter by status"
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none"
            />

            <select
              value={orderLimit}
              onChange={(e) => {
                setOrderLimit(Number(e.target.value));
                setOrderPage(1);
              }}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              type="button"
              onClick={() => setOrderPage(1)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Apply
            </button>
          </div>

          {ordersError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {ordersError}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Created</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">Loading orders...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr key={order.id || order._id || index} className="border-b border-border/40">
                      <td className="px-4 py-3 text-foreground">{order.id || order._id || "-"}</td>
                      <td className="px-4 py-3 text-foreground/80">{order.status || "-"}</td>
                      <td className="px-4 py-3 text-foreground/80">
                        {formatCurrency(order.totalPrice || order.total || order.amount)}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {formatDate(order.createdAt || order.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <p>
              Page {ordersPagination.page} of {ordersPagination.totalPages} • Total {ordersPagination.total}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                disabled={ordersPagination.page <= 1 || ordersLoading}
                className="rounded-lg border border-border px-3 py-1 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() =>
                  setOrderPage((prev) =>
                    Math.min(ordersPagination.totalPages || 1, prev + 1),
                  )
                }
                disabled={ordersPagination.page >= ordersPagination.totalPages || ordersLoading}
                className="rounded-lg border border-border px-3 py-1 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Categories</h2>
            <select
              value={categorySource}
              onChange={(e) => setCategorySource(e.target.value)}
              className="rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="admin">Admin: /api/admin/categories</option>
              <option value="public">Public: /api/categories</option>
            </select>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">Create Category</h3>
              <form onSubmit={handleCreateCategory} className="space-y-3">
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Name"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Description"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="url"
                  value={createForm.iconUrl}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, iconUrl: e.target.value }))}
                  placeholder="Icon URL"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  value={createForm.parentId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, parentId: e.target.value }))}
                  placeholder="Parent ID (optional)"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />

                {createError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {createError}
                  </div>
                )}
                {createSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-700">
                    {createSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {creatingCategory ? "Creating..." : "Create Category"}
                </button>
              </form>
            </div>

            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">Update Category</h3>
              <form onSubmit={handleUpdateCategory} className="space-y-3">
                <input
                  type="text"
                  value={updateForm.id}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, id: e.target.value }))}
                  placeholder="Category ID"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <input
                  type="text"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Updated Name (optional)"
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground focus:outline-none"
                />
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={updateForm.isActive}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                  isActive
                </label>

                {updateError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                    {updateError}
                  </div>
                )}
                {updateSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-2 text-xs text-green-700">
                    {updateSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingCategory}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {updatingCategory ? "Updating..." : "Update Category"}
                </button>
              </form>
            </div>
          </div>

          {categoriesError && (
            <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {categoriesError}
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-border bg-surface/60">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-foreground">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">Children</th>
                </tr>
              </thead>
              <tbody>
                {categoriesLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">Loading categories...</td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted">No categories found.</td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category.id || category._id || index} className="border-b border-border/40">
                      <td className="px-4 py-3 text-foreground/80">{category.id || category._id || "-"}</td>
                      <td className="px-4 py-3 text-foreground">{category.name || "-"}</td>
                      <td className="px-4 py-3 text-foreground/80">{category.description || "-"}</td>
                      <td className="px-4 py-3 text-foreground/80">
                        {Array.isArray(category.children) ? category.children.length : 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminRevenue;