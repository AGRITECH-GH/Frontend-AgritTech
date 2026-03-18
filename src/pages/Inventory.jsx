import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import StatCard from "@/components/dashboard/StatCard";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Inventory = () => {
  const navigate = useNavigate();
  const {
    products,
    paginatedProducts,
    tabs,
    tabFilter,
    setTabFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredProducts,
    stats,
  } = useInventory();

  const [showFilter, setShowFilter] = useState(false);
  const user = { name: "Farmer Joe", avatarUrl: null };

  const handleAddProduct = () => {
    navigate("/farmer/inventory/add-product");
  };

  const handleEdit = (product) => {
    // TODO: Open edit modal
    console.log("Edit product:", product);
  };

  const handleDelete = (product) => {
    // TODO: Show confirmation and delete
    console.log("Delete product:", product);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-100 text-green-700",
      low: "bg-orange-100 text-orange-700",
      critical: "bg-red-100 text-red-700",
      outofstock: "bg-gray-100 text-gray-700",
    };
    const labels = {
      active: "Active",
      low: "Low Stock",
      critical: "Critical",
      outofstock: "Out of Stock",
    };
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getStockBarColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "low":
        return "bg-orange-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Navigation */}
      <DashboardNavbar user={user} searchPlaceholder="Search inventory..." />

      <main className="container py-6 lg:py-8">
        {/* ── Page Header ── */}
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-foreground">
            Product Inventory
          </h1>
          <p className="text-sm text-muted">
            Real-time tracking of your harvest and stock levels.
          </p>
        </div>

        {/* ── Tabs and Controls ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex gap-6 border-b border-border pb-4 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setTabFilter(tab.id);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap text-sm font-medium transition-colors ${
                  tabFilter === tab.id
                    ? "border-b-2 border-primary pb-2 text-primary sm:border-b-0 sm:pb-4"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {tab.label}{" "}
                <span className="ml-1 text-xs text-muted">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-surface"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Products Table (Scrollable on mobile) ── */}
        <div className="mb-6 overflow-x-auto rounded-lg border border-border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Image
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Product Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Stock Level
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 hover:bg-surface/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                        {product.image}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted">SKU: {product.sku}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-32">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">
                            {Math.round(
                              (product.stockLevel / product.maxStock) * 100,
                            )}
                            % full
                          </span>
                          <span className="text-xs text-muted">
                            {product.stockLevel} kg
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className={`h-full ${getStockBarColor(product.status)}`}
                            style={{
                              width: `${(product.stockLevel / product.maxStock) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        ${product.price.toFixed(2)} / {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="rounded p-1 text-muted transition hover:bg-primary/10 hover:text-primary"
                          title="Edit product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="rounded p-1 text-muted transition hover:bg-red-100 hover:text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-muted">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-xs text-muted">
            Showing{" "}
            {paginatedProducts.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to{" "}
            {Math.min(currentPage * 10, filteredProducts.length)} of{" "}
            {filteredProducts.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded p-2 text-muted transition disabled:opacity-50 hover:bg-surface"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded text-xs font-medium transition ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="text-muted">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`h-8 w-8 rounded text-xs font-medium transition ${
                    currentPage === totalPages
                      ? "bg-primary text-white"
                      : "text-muted hover:bg-surface"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="rounded p-2 text-muted transition disabled:opacity-50 hover:bg-surface"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <StatCard
            label="Total Value"
            value={`$${stats.totalValue}`}
            icon="dollar"
            trend="+2.5%"
            trendType="positive"
          />
          <StatCard
            label="Items Low in Stock"
            value={stats.lowStockCount.toString()}
            icon="tag"
            trend="Needs attention"
            trendType="warning"
          />
          <StatCard
            label="Restock Orders Pending"
            value={stats.restockPending.toString()}
            icon="repeat"
            trend="In progress"
            trendType="neutral"
          />
        </div>
      </main>
    </div>
  );
};

export default Inventory;
