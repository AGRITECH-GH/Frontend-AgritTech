// Categories API Service
import api from "./api";

const categoriesService = {
  /**
   * Get all public categories
   * @returns {Promise} { categories }
   */
  getCategories: () =>
    api.apiFetch("/api/categories", {
      method: "GET",
    }),
};

export default categoriesService;
