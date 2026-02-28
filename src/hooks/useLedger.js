import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_USER = { name: "Farmer Joe", avatarUrl: null };

const MOCK_STATS = [
  {
    id: "sales",
    label: "Total Sales (Monthly)",
    value: "$12,450.00",
    icon: "sales",
  },
  {
    id: "pending",
    label: "Pending Payments",
    value: "$1,840.50",
    icon: "pending",
  },
  {
    id: "transactions",
    label: "Total Transactions",
    value: "48",
    icon: "transactions",
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: "Oct 24, 2023",
    time: "14:30 PM",
    name: "Organic Wheat",
    trxId: "#TRX-948201",
    quantity: "200 kg",
    totalPrice: 450.0,
    status: "completed",
  },
  {
    id: 2,
    date: "Oct 22, 2023",
    time: "09:15 AM",
    name: "New Potatoes (Grade A)",
    trxId: "#TRX-948185",
    quantity: "500 kg",
    totalPrice: 1120.0,
    status: "completed",
  },
  {
    id: 3,
    date: "Oct 20, 2023",
    time: "16:45 PM",
    name: "Sweet Corn",
    trxId: "#TRX-948112",
    quantity: "1,200 kg",
    totalPrice: 2840.5,
    status: "pending",
  },
  {
    id: 4,
    date: "Oct 18, 2023",
    time: "11:20 AM",
    name: "Organic Carrots",
    trxId: "#TRX-948090",
    quantity: "150 kg",
    totalPrice: 320.0,
    status: "completed",
  },
  {
    id: 5,
    date: "Oct 15, 2023",
    time: "08:00 AM",
    name: "Maize Grain",
    trxId: "#TRX-948041",
    quantity: "3,000 kg",
    totalPrice: 4200.0,
    status: "completed",
  },
  {
    id: 6,
    date: "Oct 12, 2023",
    time: "13:30 PM",
    name: "Soybean Batch",
    trxId: "#TRX-947998",
    quantity: "800 kg",
    totalPrice: 1760.0,
    status: "pending",
  },
  {
    id: 7,
    date: "Oct 10, 2023",
    time: "10:45 AM",
    name: "Cassava Tubers",
    trxId: "#TRX-947944",
    quantity: "600 kg",
    totalPrice: 540.0,
    status: "completed",
  },
  {
    id: 8,
    date: "Oct 08, 2023",
    time: "15:20 PM",
    name: "Fresh Tomatoes",
    trxId: "#TRX-947881",
    quantity: "250 kg",
    totalPrice: 875.0,
    status: "completed",
  },
  {
    id: 9,
    date: "Oct 05, 2023",
    time: "07:50 AM",
    name: "Groundnut Oil",
    trxId: "#TRX-947820",
    quantity: "100 L",
    totalPrice: 620.0,
    status: "pending",
  },
  {
    id: 10,
    date: "Oct 03, 2023",
    time: "12:00 PM",
    name: "Rice (Local)",
    trxId: "#TRX-947772",
    quantity: "1,000 kg",
    totalPrice: 2200.0,
    status: "completed",
  },
  {
    id: 11,
    date: "Oct 01, 2023",
    time: "09:00 AM",
    name: "Yam Tubers",
    trxId: "#TRX-947710",
    quantity: "400 kg",
    totalPrice: 680.0,
    status: "completed",
  },
  {
    id: 12,
    date: "Sep 28, 2023",
    time: "16:00 PM",
    name: "Pepper (Dried)",
    trxId: "#TRX-947650",
    quantity: "75 kg",
    totalPrice: 525.0,
    status: "completed",
  },
];

const PAGE_SIZE = 4;

export function useLedger() {
  const [user] = useState(MOCK_USER);
  const [stats] = useState(MOCK_STATS);
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "2023-10-01",
    to: "2023-10-31",
  });
  const [currentPage, setCurrentPage] = useState(1);

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
    doc.text(`Farmer: ${user.name}`, 14, 32);
    doc.text(
      `Total: $${totalFiltered.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
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
      `$${t.totalPrice.toFixed(2)}`,
      t.status.toUpperCase(),
    ]);

    doc.autoTable({ head, body, startY: 44, styles: { fontSize: 9 } });
    doc.save("ledger.pdf");
  };

  return {
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
  };
}
