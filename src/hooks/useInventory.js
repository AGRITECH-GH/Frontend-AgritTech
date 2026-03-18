import { useState, useMemo } from "react";

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
export const PRODUCT_UNITS = [
  "kg",
  "lbs",
  "count",
  "dozen",
  "jar",
  "liter",
  "gallon",
];

// Mock inventory data
const mockProducts = [
  {
    id: 1,
    name: "Heirloom Carrots",
    sku: "CR-001",
    image: "🥕",
    category: "Root Veggie",
    stockLevel: 650,
    maxStock: 1000,
    price: 2.5,
    unit: "kg",
    status: "active",
  },
  {
    id: 2,
    name: "Roma Tomatoes",
    sku: "TM-012",
    image: "🍅",
    category: "Vegetable",
    stockLevel: 110,
    maxStock: 500,
    price: 4.25,
    unit: "kg",
    status: "low",
  },
  {
    id: 3,
    name: "Curly Kale",
    sku: "KL-089",
    image: "🥬",
    category: "Leafy Green",
    stockLevel: 5,
    maxStock: 100,
    price: 5.5,
    unit: "kg",
    status: "critical",
  },
  {
    id: 4,
    name: "Gala Apples",
    sku: "AP-201",
    image: "🍎",
    category: "Fruit",
    stockLevel: 480,
    maxStock: 600,
    price: 3.1,
    unit: "kg",
    status: "active",
  },
  {
    id: 5,
    name: "Wildflower Honey",
    sku: "HN-534",
    image: "🍯",
    category: "Pantry",
    stockLevel: 200,
    maxStock: 250,
    price: 12.0,
    unit: "jar",
    status: "active",
  },
  {
    id: 6,
    name: "Organic Spinach",
    sku: "SP-045",
    image: "🥗",
    category: "Leafy Green",
    stockLevel: 0,
    maxStock: 300,
    price: 3.75,
    unit: "kg",
    status: "outofstock",
  },
  {
    id: 7,
    name: "Bell Peppers",
    sku: "BP-123",
    image: "🫑",
    category: "Vegetable",
    stockLevel: 45,
    maxStock: 200,
    price: 2.8,
    unit: "kg",
    status: "low",
  },
  {
    id: 8,
    name: "Blueberries",
    sku: "BLM-056",
    image: "🫐",
    category: "Fruit",
    stockLevel: 32,
    maxStock: 500,
    price: 8.5,
    unit: "kg",
    status: "low",
  },
  {
    id: 9,
    name: "Free Range Eggs",
    sku: "EGG-101",
    image: "🥚",
    category: "Pantry",
    stockLevel: 360,
    maxStock: 500,
    price: 5.0,
    unit: "dozen",
    status: "active",
  },
  {
    id: 10,
    name: "Fresh Mozzarella",
    sku: "MZZ-078",
    image: "🧀",
    category: "Dairy",
    stockLevel: 0,
    maxStock: 150,
    price: 7.25,
    unit: "kg",
    status: "outofstock",
  },
];

/**
 * useInventory – manage product inventory data, filtering, and pagination
 */
export const useInventory = () => {
  const [products] = useState(mockProducts);
  const [tabFilter, setTabFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    const organicPercentage = 82; // TODO: calculate from product data

    return {
      totalValue: totalValue.toFixed(2),
      lowStockCount,
      restockPending,
      totalItems,
      organicPercentage,
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
  };
};
