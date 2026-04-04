// Payments API Service
import api from "./api";

const paymentsService = {
  /**
   * Initialize payment
   * @param {Object} data - { orderId }
   * @returns {Promise} { message, paymentUrl, reference, amount, currency }
   */
  initializePayment: (data) =>
    api.apiFetch("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Verify payment
   * @param {string} reference - Payment reference from Paystack
   * @returns {Promise} { message, status }
   */
  verifyPayment: (reference) =>
    api.apiFetch(`/api/payments/verify/${reference}`, {
      method: "GET",
    }),

  /**
   * Get payment status for an order
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  getPaymentStatus: (orderId) =>
    api.apiFetch(`/api/payments/order/${orderId}`, {
      method: "GET",
    }),
};

export default paymentsService;
