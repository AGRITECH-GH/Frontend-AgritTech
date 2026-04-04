// Cart API Service
import api from "./api";

const cartService = {
  /**
   * Get user's cart
   * @returns {Promise} { cart }
   */
  getCart: () =>
    api.apiFetch("/api/cart", {
      method: "GET",
    }),

  /**
   * Add item to cart
   * @param {Object} data - { listingId, quantity }
   * @returns {Promise}
   */
  addItemToCart: (data) =>
    api.apiFetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Remove item from cart
   * @param {string} listingId - Listing ID to remove
   * @returns {Promise}
   */
  removeItemFromCart: (listingId) =>
    api.apiFetch(`/api/cart/items/${listingId}`, {
      method: "DELETE",
    }),

  /**
   * Clear entire cart
   * @returns {Promise}
   */
  clearCart: () =>
    api.apiFetch("/api/cart", {
      method: "DELETE",
    }),

  /**
   * Validate cart before checkout
   * @returns {Promise} { valid, issues?, total }
   */
  validateCart: () =>
    api.apiFetch("/api/cart/validate", {
      method: "GET",
    }),
};

export default cartService;
