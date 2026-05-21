// Admin API Service
import api from "./api";

const adminService = {
  /**
   * Get dashboard statistics
   * @returns {Promise} { stats, usersByRole, recentOrders }
   */
  getDashboardStats: () =>
    api.apiFetch("/api/admin/stats", {
      method: "GET",
    }),

  /**
   * Get all users
   * @param {Object} params - { role?, isActive?, search?, page?, limit? }
   * @returns {Promise}
   */
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    });

    return api.apiFetch(`/api/admin/users?${query.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Get pending farmer KYC submissions
   * @param {Object} params - { search?, page?, limit? }
   * @returns {Promise}
   */
  getPendingKYCSubmissions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const serialized = query.toString();
    const endpoint = serialized
      ? `/api/admin/kyc/pending?${serialized}`
      : "/api/admin/kyc/pending";

    return api.apiFetch(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get approved or rejected farmer KYC submissions
   * @param {Object} params - { search?, status?, page?, limit? }
   * @returns {Promise}
   */
  getReviewedKYCSubmissions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const serialized = query.toString();
    const endpoint = serialized
      ? `/api/admin/kyc/reviewed?${serialized}`
      : "/api/admin/kyc/reviewed";

    return api.apiFetch(endpoint, {
      method: "GET",
    });
  },

  /**
   * Get a single farmer's KYC details
   * @param {string} userId
   * @returns {Promise}
   */
  getKYCStatus: (userId) =>
    api.apiFetch(`/api/admin/kyc/${userId}`, {
      method: "GET",
    }),

  /**
   * Approve a farmer's KYC submission
   * @param {string} userId
   * @returns {Promise}
   */
  approveKYC: (userId) =>
    api.apiFetch(`/api/admin/kyc/${userId}/approve`, {
      method: "PUT",
    }),

  /**
   * Reject a farmer's KYC submission
   * @param {string} userId
   * @param {string} reason
   * @returns {Promise}
   */
  rejectKYC: (userId, reason) =>
    api.apiFetch(`/api/admin/kyc/${userId}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    }),

  /**
   * Resend a KYC decision email for an approved or rejected submission
   * @param {string} userId
   * @returns {Promise}
   */
  resendKYCDecisionEmail: (userId) =>
    api.apiFetch(`/api/admin/kyc/${userId}/resend-email`, {
      method: "POST",
    }),

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updateData - { isActive?, role?, isVerified? }
   * @returns {Promise}
   */
  updateUser: (id, updateData) =>
    api.apiFetch(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete user
   * @param {string} id - User ID
   * @returns {Promise}
   */
  deleteUser: (id) =>
    api.apiFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    }),

  /**
   * Get all orders
   * @param {Object} params - { status?, page?, limit? }
   * @returns {Promise}
   */
  getAllOrders: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    });

    return api.apiFetch(`/api/admin/orders?${query.toString()}`, {
      method: "GET",
    });
  },

  /**
   * Create category
   * @param {Object} categoryData - { name, description?, iconUrl?, parentId? }
   * @returns {Promise}
   */
  createCategory: (categoryData) =>
    api.apiFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    }),

  /**
   * Get all categories (with admin access)
   * @returns {Promise}
   */
  getCategories: () =>
    api.apiFetch("/api/admin/categories", {
      method: "GET",
    }),

  /**
   * Update category
   * @param {string} id - Category ID
   * @param {Object} updateData - { name?, isActive? }
   * @returns {Promise}
   */
  updateCategory: (id, updateData) =>
    api.apiFetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),
};

export default adminService;
