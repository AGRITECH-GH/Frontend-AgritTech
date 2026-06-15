// Listings API Service
// OWASP A03:2021 — Injection prevention via schema-based input validation.
import api from "./api";
import { validateOrThrow, SCHEMAS } from "./validation";

const extractListings = (response) => {
  if (Array.isArray(response)) return response;
  if (!response || typeof response !== "object") return [];

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
  createListing: (listingData) => {
    // isDraft is set to false implicitly by server when not provided
    const clean = validateOrThrow(listingData, SCHEMAS.createListing, {
      stripUnknown: true,
    });
    return api.apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  createDraft: (listingData) => {
    const clean = validateOrThrow(listingData, SCHEMAS.createListing, {
      stripUnknown: true,
    });
    return api.apiFetch("/api/listings", {
      method: "POST",
      body: JSON.stringify({ ...clean, isDraft: true }),
    });
  },

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
    const endpoint = serialized ? `/api/listings?${serialized}` : "/api/listings";

    return api
      .apiFetch(endpoint, { method: "GET" })
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
    api.apiFetch(`/api/listings/${encodeURIComponent(id)}`, { method: "GET" }),

  /**
   * Update listing
   * @param {string} id - Listing ID
   * @param {Object} updateData - { title?, pricePerUnit?, quantityAvailable?, status? }
   * @returns {Promise}
   */
  updateListing: (id, updateData) => {
    const clean = validateOrThrow(updateData, SCHEMAS.updateListing, {
      stripUnknown: true,
    });
    return api.apiFetch(`/api/listings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(clean),
    });
  },

  publishDraft: (id) =>
    api.apiFetch(`/api/listings/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify({ publish: true }),
    }),

  /**
   * Delete listing
   * @param {string} id - Listing ID
   * @returns {Promise} { message }
   */
  deleteListing: (id) =>
    api.apiFetch(`/api/listings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  /**
   * Upload images for listing
   * @param {string} id - Listing ID
   * @param {File[]} files - Array of image files (max 5, validated by validateImageFiles)
   * @returns {Promise} { message, images }
   */
  uploadListingImages: (id, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.apiFetch(`/api/listings/${encodeURIComponent(id)}/images`, {
      method: "POST",
      body: formData,
    });
  },

  bulkUploadCsv: (file) => {
    if (!(file instanceof File)) throw new Error("A valid CSV file is required.");
    // Only allow CSV content types to prevent arbitrary file uploads
    const ALLOWED_CSV_TYPES = [
      "text/csv",
      "application/csv",
      "application/vnd.ms-excel",
      "text/plain",
    ];
    if (!ALLOWED_CSV_TYPES.includes(file.type) && !file.name.endsWith(".csv")) {
      throw new Error("Only CSV files are accepted for bulk upload.");
    }
    const formData = new FormData();
    formData.append("file", file);
    return api.apiFetch("/api/listings/bulk-upload", {
      method: "POST",
      body: formData,
    });
  },
};

export default listingsService;
