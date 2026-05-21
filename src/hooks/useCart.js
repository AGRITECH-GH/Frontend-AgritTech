import { useCallback, useEffect, useState } from "react";
import {
  cartService,
  getGuestCart,
  setGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
} from "@/lib";
import { useAuth } from "@/context/AuthContext";

const getItemPrice = (item) => {
  const listing = item?.listing || item || {};
  const raw = Number(listing?.pricePerUnit ?? listing?.price ?? item?.price ?? 0);
  return Number.isFinite(raw) ? raw : 0;
};

const buildGuestValidation = (items = []) => {
  const subtotal = items.reduce((sum, item) => {
    return sum + getItemPrice(item) * Number(item?.quantity || 1);
  }, 0);

  const total = subtotal + subtotal * 0.05;

  return {
    valid: true,
    issues: [],
    total,
  };
};

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch cart
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");

    if (!isAuthenticated) {
      const guestCart = getGuestCart();
      setCart(guestCart);
      setValidationResult(buildGuestValidation(guestCart.items || []));
      setLoading(false);
      return;
    }

    try {
      const response = await cartService.getCart();
      setCart(response?.cart || response?.data || {});
    } catch (err) {
      setError(err?.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Add item to cart
  const addItem = useCallback(
    async (listingId, quantity) => {
      setError("");
      try {
        if (!isAuthenticated) {
          const nextCart = setGuestCartItemQuantity(listingId, quantity);
          setCart(nextCart);
          setValidationResult(buildGuestValidation(nextCart.items || []));
          return nextCart;
        }

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
    [fetchCart, isAuthenticated],
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (listingId) => {
      setError("");
      try {
        if (!isAuthenticated) {
          const nextCart = removeGuestCartItem(listingId);
          setCart(nextCart);
          setValidationResult(buildGuestValidation(nextCart.items || []));
          return;
        }

        await cartService.removeItemFromCart(listingId);
        await fetchCart();
      } catch (err) {
        const errorMsg = err?.message || "Failed to remove item from cart";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchCart, isAuthenticated],
  );

  // Validate cart
  const validateCart = useCallback(async () => {
    setError("");

    if (!isAuthenticated) {
      const guestCart = getGuestCart();
      const result = buildGuestValidation(guestCart.items || []);
      setValidationResult(result);
      return result;
    }

    try {
      const response = await cartService.validateCart();
      setValidationResult(response);
      return response;
    } catch (err) {
      const errorMsg = err?.message || "Failed to validate cart";
      setError(errorMsg);
      throw err;
    }
  }, [isAuthenticated]);

  // Clear cart
  const clearCart = useCallback(async () => {
    setError("");
    try {
      if (!isAuthenticated) {
        const next = clearGuestCart();
        setCart(next);
        setValidationResult(buildGuestValidation([]));
        return;
      }

      await cartService.clearCart();
      setCart({ items: [] });
      setValidationResult(null);
    } catch (err) {
      const errorMsg = err?.message || "Failed to clear cart";
      setError(errorMsg);
      throw err;
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    fetchCart();
  }, [fetchCart, isAuthenticated]);

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
