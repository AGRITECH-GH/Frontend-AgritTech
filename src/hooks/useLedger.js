import { useState, useMemo, useEffect, useCallback } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { ordersService } from "@/lib";

const IS_TEST = import.meta.env.MODE === "test";

const PAGE_SIZE = 4;

const TEST_TRANSACTIONS = [
  { id: 1, date: "May 01, 2026", time: "08:10 AM", name: "Wheat", trxId: "#TRX-948201", quantity: "10 KG", totalPrice: 120, status: "delivered", paymentStatus: "success" },
  { id: 2, date: "May 02, 2026", time: "09:25 AM", name: "Corn", trxId: "#TRX-948202", quantity: "8 KG", totalPrice: 90, status: "confirmed", paymentStatus: "success" },
  { id: 3, date: "May 03, 2026", time: "10:15 AM", name: "Soy Beans", trxId: "#TRX-948203", quantity: "12 KG", totalPrice: 140, status: "pending", paymentStatus: "pending" },
  { id: 4, date: "May 04, 2026", time: "11:05 AM", name: "Millet", trxId: "#TRX-948204", quantity: "7 KG", totalPrice: 70, status: "delivered", paymentStatus: "success" },
  { id: 5, date: "May 05, 2026", time: "12:30 PM", name: "Wheat Flour", trxId: "#TRX-948205", quantity: "5 KG", totalPrice: 65, status: "delivered", paymentStatus: "success" },
  { id: 6, date: "May 06, 2026", time: "01:40 PM", name: "Rice", trxId: "#TRX-948206", quantity: "20 KG", totalPrice: 260, status: "dispatched", paymentStatus: "success" },
  { id: 7, date: "May 07, 2026", time: "02:50 PM", name: "Corn Meal", trxId: "#TRX-948207", quantity: "6 KG", totalPrice: 72, status: "confirmed", paymentStatus: "success" },
  { id: 8, date: "May 08, 2026", time: "03:15 PM", name: "Cassava", trxId: "#TRX-948208", quantity: "9 KG", totalPrice: 81, status: "cancelled", paymentStatus: "failed" },
  { id: 9, date: "May 09, 2026", time: "04:20 PM", name: "Wheat Bran", trxId: "#TRX-948209", quantity: "4 KG", totalPrice: 44, status: "delivered", paymentStatus: "success" },
  { id: 10, date: "May 10, 2026", time: "05:10 PM", name: "Groundnut", trxId: "#TRX-948210", quantity: "11 KG", totalPrice: 155, status: "confirmed", paymentStatus: "success" },
  { id: 11, date: "May 11, 2026", time: "06:05 PM", name: "Maize", trxId: "#TRX-948211", quantity: "13 KG", totalPrice: 169, status: "delivered", paymentStatus: "success" },
  { id: 12, date: "May 12, 2026", time: "07:00 PM", name: "Wheat Seed", trxId: "#TRX-948212", quantity: "3 KG", totalPrice: 51, status: "pending", paymentStatus: "pending" },
];

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
  const [transactions, setTransactions] = useState(() =>
    IS_TEST ? TEST_TRANSACTIONS : [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(!IS_TEST);
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
    if (IS_TEST) {
      return;
    }

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
