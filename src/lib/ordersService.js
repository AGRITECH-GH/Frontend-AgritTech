// Orders API Service
import api from "./api";

const ordersService = {
  /**
   * Place order (checkout)
   * @param {Object} orderData - { paymentMethod, deliveryAddress, notes? }
   * @returns {Promise} { message, order }
   */
  placeOrder: (orderData) =>
    api.apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

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

    return api.apiFetch(`/api/orders?${query.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Get order by ID
   * @param {string} id - Order ID
   * @returns {Promise} { order }
   */
  getOrderById: (id) =>
    api.apiFetch(`/api/orders/${id}`, {
      method: "GET",
    }),

  /**
   * Update order status
   * @param {string} id - Order ID
   * @param {Object} data - { status }
   * @returns {Promise}
   */
  updateOrderStatus: (id, data) =>
    api.apiFetch(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export default ordersService;
