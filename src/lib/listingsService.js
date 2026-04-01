// Listings API Service
import api from "./api";

const extractListings = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const candidates = [
    response.listings,
    response.items,
    response.data?.listings,
    response.data?.items,
    response.data,
  ];

  return candidates.find(Array.isArray) || [];
};

const listingsService = {
  /**
   * Create a new listing
   * @param {Object} listingData - { title, description, pricePerUnit, quantity, quantityAvailable, unit, location, listingType, categoryId }
   * @returns {Promise} { message, listing }
   */
  createListing: (listingData) =>
    api.apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify(listingData),
    }),

  /**
   * Get all listings with filters and pagination
   * @param {Object} params - { search?, category?, listingType?, location?, minPrice?, maxPrice?, page?, limit? }
   * @returns {Promise} { listings, pagination }
   */
  getListings: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, value);
      }
    });

    const serialized = query.toString();
    const endpoint = serialized
      ? `/api/listings?${serialized}`
      : "/api/listings";

    return api
      .apiFetch(endpoint, {
        method: "GET",
      })
      .then((response) => ({
        ...response,
        listings: extractListings(response),
      }));
  },

  /**
   * Get single listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise} { listing }
   */
  getListingById: (id) =>
    api.apiFetch(`/api/listings/${id}`, {
      method: "GET",
    }),

  /**
   * Update listing
   * @param {string} id - Listing ID
   * @param {Object} updateData - { title?, pricePerUnit?, quantityAvailable?, status? }
   * @returns {Promise}
   */
  updateListing: (id, updateData) =>
    api.apiFetch(`/api/listings/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  /**
   * Delete listing
   * @param {string} id - Listing ID
   * @returns {Promise} { message }
   */
  deleteListing: (id) =>
    api.apiFetch(`/api/listings/${id}`, {
      method: "DELETE",
    }),

  /**
   * Upload images for listing
   * @param {string} id - Listing ID
   * @param {File[]} files - Array of image files (max 5)
   * @returns {Promise} { message, images }
   */
  uploadListingImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    return api.apiFetch(`/api/listings/${id}/images`, {
      method: "POST",
      body: formData,
    });
  },
};

export default listingsService;
