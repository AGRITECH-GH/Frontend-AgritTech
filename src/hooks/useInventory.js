import { useState, useMemo, useEffect } from "react";
import { listingsService } from "@/lib";
import { useAuth } from "@/context/AuthContext";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";
import { validateImageFiles } from "@/lib/utils";

const getIdentifier = (value) =>
  value?.id || value?._id || value?.userId || value?.ownerId || null;

const isOwnedByUser = (listing, userId) => {
  if (!listing || !userId) return false;

  const ownerId =
    getIdentifier(listing.owner) ||
    listing.ownerId ||
    listing.farmerId ||
    listing.sellerId ||
    getIdentifier(listing.seller) ||
    getIdentifier(listing.farmer) ||
    null;

  return ownerId === userId;
};

// Categories
export const PRODUCT_CATEGORIES = [
  "Root Veggie",
  "Vegetable",
  "Fruit",
  "Leafy Green",
  "Pantry",
  "Dairy",
];

// Units of measurement
export const PRODUCT_UNITS = ["KG", "BAG", "CRATE", "PIECE", "LITRE", "BUNDLE"];

/**
 * useInventory – manage product inventory data, filtering, and pagination
 */
export const useInventory = () => {
  const { user } = useAuth();
  const currentUserId = getIdentifier(user);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabFilter, setTabFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch listings from API
  useEffect(() => {
    if (!user) return;

    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await listingsService.getListings({
          limit: 100,
          ownerId: currentUserId,
          mine: true,
        });
        const listings = (res.listings || [])
          .filter((listing) => isOwnedByUser(listing, currentUserId))
          .map((listing) => ({
            id: listing.id,
            name: listing.title,
            sku: listing.id.slice(0, 8),
            image: "📦",
            imageUrl: getPrimaryListingImageUrl(listing),
            category: listing.category?.name || "General",
            stockLevel: parseInt(listing.quantityAvailable) || 0,
            maxStock: parseInt(listing.quantity) || 0,
            price: parseFloat(listing.pricePerUnit) || 0,
            unit: listing.unit || "KG",
            status:
              listing.status === "SOLD"
                ? "outofstock"
                : listing.quantityAvailable === 0
                  ? "outofstock"
                  : parseInt(listing.quantityAvailable) <
                      parseInt(listing.quantity) * 0.2
                    ? "low"
                    : "active",
          }));
        setProducts(listings);
      } catch (err) {
        console.error("Failed to fetch listings:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, currentUserId]);

  // Filter products based on tab and search
  const filteredProducts = useMemo(() => {
    let result = products;

    // Apply tab filter
    if (tabFilter === "active") {
      result = result.filter((p) => p.status === "active");
    } else if (tabFilter === "low") {
      result = result.filter((p) => p.status === "low");
    } else if (tabFilter === "outofstock") {
      result = result.filter((p) => p.status === "outofstock");
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return result;
  }, [products, tabFilter, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + itemsPerPage,
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.stockLevel,
      0,
    );
    const lowStockCount = products.filter((p) => p.status === "low").length;
    const restockPending = products.filter(
      (p) => p.status === "critical",
    ).length;
    const totalItems = products.length;

    return {
      totalValue: totalValue.toFixed(2),
      lowStockCount,
      restockPending,
      totalItems,
      organicPercentage: 82,
    };
  }, [products]);

  // Tab data
  const tabs = [
    { id: "all", label: "All Products", count: products.length },
    {
      id: "active",
      label: "Active",
      count: products.filter((p) => p.status === "active").length,
    },
    {
      id: "low",
      label: "Low Stock",
      count: products.filter((p) => p.status === "low").length,
    },
    {
      id: "outofstock",
      label: "Out of Stock",
      count: products.filter((p) => p.status === "outofstock").length,
    },
  ];

  // Update product listing
  const updateProduct = async (productId, updateData) => {
    try {
      await listingsService.updateListing(productId, updateData);

      // Update local state
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              ...(updateData.title && { name: updateData.title }),
              ...(updateData.pricePerUnit && {
                price: updateData.pricePerUnit,
              }),
              ...(updateData.quantityAvailable && {
                stockLevel: updateData.quantityAvailable,
              }),
              ...(updateData.status && {
                status:
                  updateData.status === "SOLD"
                    ? "outofstock"
                    : updateData.status === "PAUSED"
                      ? "inactive"
                      : "active",
              }),
            };
          }
          return p;
        }),
      );

      return { success: true };
    } catch (err) {
      console.error("Failed to update product:", err);
      return { success: false, error: err.message };
    }
  };

  // Delete product listing
  const deleteProduct = async (productId) => {
    try {
      await listingsService.deleteListing(productId);

      // Update local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      return { success: true };
    } catch (err) {
      console.error("Failed to delete product:", err);
      return { success: false, error: err.message };
    }
  };

  // Upload images for product
  const uploadProductImages = async (productId, files) => {
    if (!files || files.length === 0) {
      return { success: false, error: "No files selected." };
    }

    const { isValid, error } = validateImageFiles(files, { maxFiles: 5 });
    if (!isValid) {
      return { success: false, error };
    }

    try {
      const response = await listingsService.uploadListingImages(
        productId,
        files,
      );
      return { success: true, images: response.images };
    } catch (err) {
      console.error("Failed to upload images:", err);
      return { success: false, error: err.message };
    }
  };

  return {
    products,
    filteredProducts,
    paginatedProducts,
    tabs,
    tabFilter,
    setTabFilter,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    stats,
    loading,
    error,
    updateProduct,
    deleteProduct,
    uploadProductImages,
  };
};
