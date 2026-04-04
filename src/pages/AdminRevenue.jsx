import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/lib";
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

const getOrderPagination = (
  response,
  fallbackPage,
  fallbackLimit,
  totalItems,
) => {
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

  const sidebarAdmin = {
    name: authUser?.fullName || authUser?.name || authUser?.username || "Admin",
    email: authUser?.email || "",
    avatarUrl:
      authUser?.profilePhotoUrl ||
      authUser?.avatarUrl ||
      authUser?.profileImage ||
      null,
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
          getOrderPagination(
            response,
            orderPage,
            orderLimit,
            normalizedOrders.length,
          ),
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

  return (
    <AdminLayout admin={sidebarAdmin}>
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-6 rounded-2xl border border-border/60 bg-gradient-to-r from-emerald-50 to-white p-5 pl-12 shadow-sm lg:pl-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Revenue Reports
          </h1>
          <p className="mt-1 text-sm text-muted">
            Monitor order performance and review revenue data from admin
            endpoints.
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-border/60 bg-white p-5 shadow-sm ring-1 ring-black/5">
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
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted"
                    >
                      Loading orders...
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id || order._id || index}
                      className="border-b border-border/40"
                    >
                      <td className="px-4 py-3 text-foreground">
                        {order.id || order._id || "-"}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {order.status || "-"}
                      </td>
                      <td className="px-4 py-3 text-foreground/80">
                        {formatCurrency(
                          order.totalPrice || order.total || order.amount,
                        )}
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
              Page {ordersPagination.page} of {ordersPagination.totalPages} •
              Total {ordersPagination.total}
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
                disabled={
                  ordersPagination.page >= ordersPagination.totalPages ||
                  ordersLoading
                }
                className="rounded-lg border border-border px-3 py-1 text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
};

export default AdminRevenue;
