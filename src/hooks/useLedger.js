import { useState, useMemo, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ordersService } from "@/lib";

const PAGE_SIZE = 4;

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getQuantityString = (items) => {
  if (!Array.isArray(items) || items.length === 0) return "1";

  const totalQuantity = items.reduce((sum, item) => {
    const quantity = Number(item?.quantity ?? item?.qty ?? 0);
    return sum + (Number.isFinite(quantity) ? quantity : 0);
  }, 0);

  const unit =
    items[0]?.unit || items[0]?.unitType || items[0]?.unitOfMeasure || "";

  return `${totalQuantity || 1}${unit ? ` ${unit}` : ""}`;
};

const normalizeOrder = (order) => {
  const createdAt =
    order?.createdAt ||
    order?.created_at ||
    order?.updatedAt ||
    order?.updated_at;
  const timestamp = createdAt ? new Date(createdAt) : new Date();
  const items = Array.isArray(order?.items)
    ? order.items
    : Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];

  const firstItem = items[0] || {};
  const productName =
    firstItem?.productName || firstItem?.name || firstItem?.title || "Order";

  const totalPrice = Number(
    order?.totalPrice ?? order?.total ?? order?.amount ?? order?.subtotal ?? 0,
  );

  const status = String(order?.status || "PENDING").toLowerCase();
  const paymentStatus = String(
    order?.payment?.status || order?.paymentStatus || "",
  ).toLowerCase();

  return {
    id: String(
      order?._id || order?.id || order?.orderId || order?.reference || "",
    ),
    date: formatDate(timestamp),
    time: formatTime(timestamp),
    name: productName,
    trxId: String(
      order?._id || order?.id || order?.orderId || order?.reference || "N/A",
    ),
    quantity: getQuantityString(items),
    totalPrice: Number.isFinite(totalPrice) ? totalPrice : 0,
    status,
    paymentStatus,
  };
};

export function useLedger() {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await ordersService.getMyOrders({ limit: 100 });
      const orders =
        response?.orders ?? response?.data?.orders ?? response?.data ?? [];

      const normalized = Array.isArray(orders)
        ? orders.map(normalizeOrder)
        : [];

      setTransactions(normalized);
    } catch (err) {
      setError(err?.message || "Failed to load ledger entries");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const stats = useMemo(() => {
    const totalSales = transactions.reduce((sum, trx) => {
      const status = String(trx.status || "").toLowerCase();
      const paymentStatus = String(trx.paymentStatus || "").toLowerCase();
      const isCancelled = status === "cancelled";
      const isPendingOrder = status === "pending";
      const isPendingPayment = paymentStatus === "pending";
      const isSuccessfulPayment =
        paymentStatus === "success" ||
        status === "delivered" ||
        status === "dispatched";

      if (
        isCancelled ||
        isPendingOrder ||
        isPendingPayment ||
        !isSuccessfulPayment
      ) {
        return sum;
      }

      return sum + trx.totalPrice;
    }, 0);

    const pendingCount = transactions.filter((trx) => {
      const status = String(trx.status || "").toLowerCase();
      const paymentStatus = String(trx.paymentStatus || "").toLowerCase();
      return (
        status === "pending" ||
        paymentStatus === "pending" ||
        (status === "confirmed" && paymentStatus && paymentStatus !== "success")
      );
    }).length;

    return [
      {
        id: "sales",
        label: "Total Sales",
        value: `₵${totalSales.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        icon: "sales",
      },
      {
        id: "pending",
        label: "Pending Payments",
        value: `${pendingCount}`,
        icon: "pending",
      },
      {
        id: "transactions",
        label: "Total Transactions",
        value: `${transactions.length}`,
        icon: "transactions",
      },
    ];
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return transactions.filter((t) => {
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.trxId.toLowerCase().includes(q);
      return matchesSearch;
    });
  }, [transactions, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const totalFiltered = filtered.reduce((sum, t) => sum + t.totalPrice, 0);

  const formattedDateRange = (() => {
    if (!dateRange.from || !dateRange.to) return "Select range";
    const fmt = (d) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    return `${fmt(dateRange.from)} - ${fmt(dateRange.to)}`;
  })();

  const onSearch = (q) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const onDateChange = (field, value) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const onDownloadPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Sales & Transaction Ledger", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Period: ${formattedDateRange}`, 14, 26);
    doc.text(`Farmer: Farmer`, 14, 32);
    doc.text(
      `Total: ₵${totalFiltered.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      14,
      38,
    );

    const head = [
      ["Date", "Transaction", "TRX ID", "Quantity", "Total Price", "Status"],
    ];
    const body = filtered.map((t) => [
      `${t.date} ${t.time}`,
      t.name,
      t.trxId,
      t.quantity,
      `₵${t.totalPrice.toFixed(2)}`,
      t.status.toUpperCase(),
    ]);

    doc.autoTable({ head, body, startY: 44, styles: { fontSize: 9 } });
    doc.save("ledger.pdf");
  };

  return {
    user: {},
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
    loading,
    error,
  };
}
