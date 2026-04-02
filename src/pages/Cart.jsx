import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Ticket,
  Gift,
  Truck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { transition } from "@/motionConfig";
import { useCart } from "@/hooks/useCart";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    validationResult,
    loading,
    error,
    addItem,
    removeItem,
    validateCart,
    clearCart,
  } = useCart();
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const items = cart?.items || [];

  const getListing = (item) => item?.listing || item || {};

  const getListingId = (item) => {
    const listing = getListing(item);
    return String(
      item?.listingId || listing?._id || listing?.id || item?._id || "",
    ).trim();
  };

  const getImage = (item) => {
    const listing = getListing(item);
    const firstImage = listing?.images?.[0];
    if (typeof firstImage === "string") return firstImage;
    if (firstImage && typeof firstImage === "object") {
      return firstImage.url || firstImage.secure_url || firstImage.src || "";
    }
    return listing?.image || listing?.imageUrl || "";
  };

  const getPrice = (item) => {
    const listing = getListing(item);
    const raw = Number(
      listing?.pricePerUnit ?? listing?.price ?? item?.price ?? 0,
    );
    return Number.isFinite(raw) ? raw : 0;
  };

  const formatCurrency = (amount) => `GH₵${amount.toFixed(2)}`;

  useEffect(() => {
    setSelectedItemIds((prev) => {
      const nextIds = items.map((item) => getListingId(item)).filter(Boolean);
      if (prev.length === 0) return nextIds;
      const keep = prev.filter((id) => nextIds.includes(id));
      return keep.length > 0 ? keep : nextIds;
    });
  }, [cart]);

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(getListingId(item))),
    [items, selectedItemIds],
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce((sum, item) => {
        const itemPrice = getPrice(item);
        const quantity = Number(item?.quantity || 1);
        return sum + itemPrice * quantity;
      }, 0),
    [selectedItems],
  );

  const tax = subtotal * 0.05;
  const fallbackTotal = subtotal + tax;
  const validatedTotal = Number(validationResult?.total);
  const total = Number.isFinite(validatedTotal)
    ? validatedTotal
    : fallbackTotal;
  const cartIsValid = Boolean(validationResult?.valid);

  const handleValidateCart = async () => {
    setIsValidating(true);
    setValidationError("");
    try {
      const result = await validateCart();
      if (!result?.valid) {
        setValidationError(
          result?.issues?.join(", ") || "Cart validation failed",
        );
      }
    } catch (err) {
      setValidationError(err?.message || "Failed to validate cart");
    } finally {
      setIsValidating(false);
    }
  };

  const handleQuantityChange = async (item, nextQuantity) => {
    const listingId = getListingId(item);
    if (!listingId) return;

    try {
      if (nextQuantity <= 0) {
        await removeItem(listingId);
        return;
      }
      await addItem(listingId, nextQuantity);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemoveItem = async (listingId) => {
    try {
      await removeItem(listingId);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      try {
        await clearCart();
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const allIds = items.map((item) => getListingId(item)).filter(Boolean);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedItemIds.includes(id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItemIds([]);
      return;
    }
    setSelectedItemIds(allIds);
  };

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Cart
                </h1>
                <p className="text-sm text-muted">
                  Review your items, validate, then checkout.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f6f8ef] p-2 text-xs sm:text-sm">
              <div className="rounded-xl bg-primary px-3 py-2 text-center font-semibold text-white">
                1. Cart
              </div>
              <div className="rounded-xl px-3 py-2 text-center font-medium text-muted">
                2. Address
              </div>
              <div className="rounded-xl px-3 py-2 text-center font-medium text-muted">
                3. Payment
              </div>
            </div>
          </div>
        </motion.section>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {validationError}
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <section>
            {loading ? (
              <div className="rounded-3xl border border-border/60 bg-white p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-200 border-t-green-500" />
                <p className="mt-4 text-gray-600">Loading cart...</p>
              </div>
            ) : items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border/60 bg-white p-8 text-center"
              >
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Your cart is empty
                </h3>
                <p className="mt-2 text-sm text-gray-500 mb-6">
                  Add items from the marketplace to get started
                </p>
                <Button
                  type="button"
                  onClick={() => navigate("/marketplace")}
                  className="h-11 px-6"
                >
                  Continue Shopping
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-border/60 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-4 border-b border-border/60 pb-3">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    {selectedItems.length}/{items.length} items selected
                  </label>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-xs font-semibold text-red-600 transition-colors hover:text-red-700"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => {
                    const listing = getListing(item);
                    const itemId = getListingId(item);
                    const itemPrice = getPrice(item);
                    const quantity = Number(item?.quantity || 1);
                    const itemTotal = itemPrice * quantity;
                    const image = getImage(item);
                    const checked = selectedItemIds.includes(itemId);

                    if (!itemId) return null;

                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={transition}
                        className="rounded-2xl border border-border/60 bg-[#fcfdf9] p-4"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleSelectOne(itemId)}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />

                          {image ? (
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
                              <img
                                src={image}
                                alt={listing?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#f0f4e5] text-primary sm:h-24 sm:w-24">
                              <ShoppingCart className="h-5 w-5" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">
                                  {listing?.name || listing?.title || "Product"}
                                </h3>
                                <p className="mt-1 text-xs text-muted">
                                  {listing?.category
                                    ? `${listing.category} • `
                                    : ""}
                                  <span className="inline-flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    Express delivery
                                  </span>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(itemId)}
                                className="text-muted transition-colors hover:text-red-600"
                                aria-label="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">
                                {formatCurrency(itemTotal)}
                              </p>
                              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(item, quantity - 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-[#f5f6f1] hover:text-foreground"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="min-w-5 text-center text-sm font-semibold text-foreground">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(item, quantity + 1)
                                  }
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-[#f5f6f1] hover:text-foreground"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </section>

          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="space-y-4"
          >
            <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">
                Price Details
              </h2>

              <div className="space-y-3 border-b border-border/60 pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Selected Items</span>
                  <span className="font-medium text-foreground">
                    {selectedItems.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax (5%)</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(tax)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-4">
                <span className="font-semibold text-foreground">
                  Total Amount
                </span>
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              {Array.isArray(validationResult?.issues) &&
                validationResult.issues.length > 0 && (
                  <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {validationResult.issues.join(", ")}
                  </div>
                )}

              {!cartIsValid ? (
                <Button
                  type="button"
                  onClick={handleValidateCart}
                  disabled={isValidating || selectedItems.length === 0}
                  className="w-full"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {isValidating ? "Validating Cart..." : "Validate Cart"}
                </Button>
              ) : (
                <>
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Cart validated successfully. You can proceed to checkout.
                  </div>
                  <Button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    Place Order
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              )}

              <Link
                to="/marketplace"
                className="mt-3 block text-center text-sm font-medium text-primary transition-colors hover:text-green-700"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
