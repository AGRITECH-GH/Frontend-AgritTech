import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import { useAuth } from "@/context/AuthContext";
import DashboardNavbar from "@/components/dashboard/DashboardNavbar";
import StatCard from "@/components/dashboard/StatCard";
import EditProductModal from "@/components/dashboard/EditProductModal";
import { listingsService } from "@/lib";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

const normalizeListingResponse = (response) => {
  if (!response || typeof response !== "object") return null;
  return (
    response.listing || response.data?.listing || response.data || response
  );
};

const toEditableProduct = (listing, fallback = {}) => {
  const safeListing = listing || {};
  const statusValue = String(
    safeListing.status || fallback.status || "ACTIVE",
  ).toUpperCase();

  return {
    id: safeListing.id || safeListing._id || fallback.id,
    title: safeListing.title || safeListing.name || fallback.name || "",
    description: safeListing.description || fallback.description || "",
    category:
      safeListing.category?.name ||
      safeListing.categoryName ||
      fallback.category ||
      "",
    pricePerUnit: Number(
      safeListing.pricePerUnit ?? safeListing.price ?? fallback.price ?? 0,
    ),
    quantityAvailable: Number(
      safeListing.quantityAvailable ??
        safeListing.quantity ??
        fallback.stockLevel ??
        0,
    ),
    unit: safeListing.unit || fallback.unit || "KG",
    status:
      statusValue === "PAUSED" || statusValue === "INACTIVE"
        ? "inactive"
        : "active",
  };
};

const Inventory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
    updateProduct,
    deleteProduct,
    uploadProductImages,
  } = useInventory();

  const [showFilter, setShowFilter] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const displayName = user?.name || user?.fullName || "Farmer Joe";
  const navbarUser = {
    name: displayName,
    avatarUrl: user?.profilePhotoUrl || user?.avatarUrl || null,
  };

  const handleAddProduct = () => {
    navigate("/farmer/inventory/add-product");
  };

  const handleEdit = async (product) => {
    if (!product?.id) return;

    setEditingProductId(product.id);
    try {
      const response = await listingsService.getListingById(product.id);
      const latestListing = normalizeListingResponse(response);

      setSelectedProduct(toEditableProduct(latestListing, product));
    } catch (error) {
      console.error("Failed to fetch latest listing details:", error);
      // Fallback to current table data so user can still proceed.
      setSelectedProduct(toEditableProduct(null, product));
    } finally {
      setEditingProductId("");
      setShowEditModal(true);
    }
  };

  const handleDelete = (productId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone.",
      )
    ) {
      setIsSaving(true);
      deleteProduct(productId)
        .then(() => {
          setIsSaving(false);
          setSelectedProduct(null);
          setShowEditModal(false);
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          setIsSaving(false);
          alert("Failed to delete product. Please try again.");
        });
    }
  };

  const handleSaveProduct = async (updatedData) => {
    setIsSaving(true);
    try {
      await updateProduct(selectedProduct.id, updatedData);
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadImages = async (files) => {
    try {
      await uploadProductImages(selectedProduct.id, files);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    }
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
      <DashboardNavbar
        user={navbarUser}
        searchPlaceholder="Search inventory..."
      />

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
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
                          {product.image}
                        </div>
                      )}
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
                        ₵{product.price.toFixed(2)} / {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          disabled={editingProductId === product.id}
                          className="rounded p-1 text-muted transition hover:bg-primary/10 hover:text-primary"
                          title="Edit product"
                        >
                          {editingProductId === product.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Edit2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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
            value={`₵${stats.totalValue}`}
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

        {/* ── Edit Product Modal ── */}
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={handleSaveProduct}
          onUploadImages={handleUploadImages}
          isSaving={isSaving}
        />
      </main>
    </div>
  );
};

export default Inventory;
