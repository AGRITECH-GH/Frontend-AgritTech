// Orders API Service
// OWASP A03:2021 — Injection prevention via schema validation before sending.
import api from "./api";
import { validateOrThrow, SCHEMAS } from "./validation";

const ordersService = {
  /**
   * Place order (checkout)
   * @param {Object} orderData - { paymentMethod, deliveryAddress, notes? }
   * @returns {Promise} { message, order }
   */
  placeOrder: (orderData) => {
    const clean = validateOrThrow(orderData, SCHEMAS.placeOrder);
    return api.apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Get user's orders
   * @param {Object} params - { status?, page?, limit? }
   * @returns {Promise} { orders, pagination }
   */
  getMyOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    });
    return api.apiFetch(`/api/orders?${query.toString()}`, { method: "GET" });
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise} { order }
   */
  getOrderById: (id) =>
    api.apiFetch(`/api/orders/${encodeURIComponent(id)}`, { method: "GET" }),

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {Object} data - { status }
   * @returns {Promise}
   */
  updateOrderStatus: (id, data) => {
    // Status values are defined server-side per role; pass through but ensure
    // the key is always a non-empty string to avoid prototype pollution.
    if (typeof data?.status !== "string" || data.status.trim().length === 0) {
      throw new Error("A valid status value is required.");
    }
    return api.apiFetch(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: data.status.trim() }),
    });
  },
};

export default ordersService;
