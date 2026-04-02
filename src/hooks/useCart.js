import { useCallback, useEffect, useState } from "react";
import { cartService } from "@/lib";

export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await cartService.getCart();
      setCart(response?.cart || response?.data || {});
    } catch (err) {
      setError(err?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  }, []);

  // Add item to cart
  const addItem = useCallback(
    async (listingId, quantity) => {
      setError("");
      try {
        const response = await cartService.addItemToCart({
          listingId,
          quantity,
        });
        await fetchCart();
        return response;
      } catch (err) {
        const errorMsg = err?.message || "Failed to add item to cart";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchCart],
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (listingId) => {
      setError("");
      try {
        await cartService.removeItemFromCart(listingId);
        await fetchCart();
      } catch (err) {
        const errorMsg = err?.message || "Failed to remove item from cart";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchCart],
  );

  // Validate cart
  const validateCart = useCallback(async () => {
    setError("");
    try {
      const response = await cartService.validateCart();
      setValidationResult(response);
      return response;
    } catch (err) {
      const errorMsg = err?.message || "Failed to validate cart";
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Clear cart
  const clearCart = useCallback(async () => {
    setError("");
    try {
      await cartService.clearCart();
      setCart({ items: [] });
      setValidationResult(null);
    } catch (err) {
      const errorMsg = err?.message || "Failed to clear cart";
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    validationResult,
    loading,
    error,
    fetchCart,
    addItem,
    removeItem,
    validateCart,
    clearCart,
  };
};
