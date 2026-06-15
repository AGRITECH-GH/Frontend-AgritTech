// Payments API Service
// OWASP A03:2021 — Injection prevention via input validation.
// Payment references from external sources (Paystack callbacks) are
// treated as untrusted and validated before use in URL paths.
import api from "./api";
import { validateOrThrow, SCHEMAS } from "./validation";

// Allowlist for Paystack payment reference characters.
// References are alphanumeric plus hyphens/underscores (Paystack format).
const SAFE_REFERENCE_RE = /^[\w-]{1,100}$/;

const paymentsService = {
  /**
   * Initialize payment
   * @param {Object} data - { orderId }
   * @returns {Promise} { message, paymentUrl, reference, amount, currency }
   */
  initializePayment: (data) => {
    const clean = validateOrThrow(data, SCHEMAS.initializePayment);
    return api.apiFetch("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Verify payment
   * @param {string} reference - Payment reference from Paystack
   * @returns {Promise} { message, status }
   */
  verifyPayment: (reference) => {
    // Reference arrives from a URL query parameter after Paystack redirect —
    // validate it before embedding in the URL path to prevent path traversal.
    if (
      typeof reference !== "string" ||
      !SAFE_REFERENCE_RE.test(reference)
    ) {
      throw new Error("Invalid payment reference.");
    }
    return api.apiFetch(`/api/payments/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
    });
  },

  /**
   * Get payment status for an order
   * @param {string} orderId - Order ID
   * @returns {Promise}
   */
  getPaymentStatus: (orderId) => {
    if (typeof orderId !== "string" || orderId.trim().length === 0) {
      throw new Error("A valid order ID is required.");
    }
    return api.apiFetch(
      `/api/payments/order/${encodeURIComponent(orderId.trim())}`,
      { method: "GET" }
    );
  },
};

export default paymentsService;
