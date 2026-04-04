// Barter API Service
import api from "./api";
import { validateImageFiles } from "./utils";

const ALLOWED_BARTER_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
];

const sanitizeCreateBarterPayload = (barterData = {}) => {
  const targetListingId = barterData.targetListingId?.trim();
  const offeredListingId = barterData.offeredListingId?.trim();
  const offeredDescription = barterData.offeredDescription?.trim();
  const message = barterData.message?.trim();
  const offeredQuantity = Number(barterData.offeredQuantity);

  if (!targetListingId) {
    throw new Error("Target listing is required.");
  }

  if (offeredListingId) {
    if (!Number.isFinite(offeredQuantity) || offeredQuantity <= 0) {
      throw new Error("Offered quantity must be greater than 0.");
    }

    return {
      targetListingId,
      offeredListingId,
      offeredQuantity,
      ...(message ? { message } : {}),
    };
  }

  if (!offeredDescription) {
    throw new Error(
      "Offered description is required when no offered listing is selected.",
    );
  }

  if (!Number.isFinite(offeredQuantity) || offeredQuantity <= 0) {
    throw new Error("Offered quantity must be greater than 0.");
  }

  return {
    targetListingId,
    offeredDescription,
    offeredQuantity,
    ...(message ? { message } : {}),
  };
};

const buildBarterQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    const normalizedValue =
      key === "status" && typeof value === "string"
        ? value.toUpperCase()
        : value;

    query.append(key, normalizedValue);
  });

  const serialized = query.toString();
  return serialized ? `/api/barter?${serialized}` : "/api/barter";
};

const barterService = {
  /**
   * Create barter request
   * @param {Object} barterData - { targetListingId, offeredDescription?, offeredQuantity?, message?, offeredListingId? }
   * @returns {Promise} { message, barter }
   */
  createBarterRequest: (barterData) =>
    api.apiFetch("/api/barter", {
      method: "POST",
      body: JSON.stringify(sanitizeCreateBarterPayload(barterData)),
    }),

  /**
   * Upload images for a barter request (requester only)
   * @param {string} barterId
   * @param {File[]} files - client-validated: max 3, JPG/JPEG/PNG/WEBP, 5MB each
   * @returns {Promise} { message, images }
   */
  uploadBarterImages: (barterId, files = []) => {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      throw new Error("No files selected.");
    }

    const { isValid, error } = validateImageFiles(selectedFiles, {
      maxFiles: 3,
      maxFilesError: "Maximum 3 images allowed.",
    });

    if (!isValid) {
      throw new Error(error);
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("images", file));

    return api.apiFetch(`/api/barter/${barterId}/images`, {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Get barter requests
   * @param {Object} params - { status?, ...other query params }
   * @returns {Promise}
   */
  getBarterRequests: (params = {}) =>
    api.apiFetch(buildBarterQuery(params), {
      method: "GET",
    }),

  /**
   * Update barter status
   * @param {string} id - Barter request ID
   * @param {Object} data - { status }
   * @returns {Promise}
   */
  updateBarterStatus: (id, data) => {
    const rawStatus =
      typeof data === "string"
        ? data
        : typeof data?.status === "string"
          ? data.status
          : "";
    const status = rawStatus.toUpperCase();

    if (!ALLOWED_BARTER_STATUSES.includes(status)) {
      throw new Error("Invalid barter status.");
    }

    return api.apiFetch(`/api/barter/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },
};

export default barterService;
