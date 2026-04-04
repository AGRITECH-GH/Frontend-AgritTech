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
