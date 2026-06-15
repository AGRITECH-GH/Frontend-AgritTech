// Reviews API Service
// OWASP A03:2021 — Schema validation prevents oversized or malformed review
// payloads from reaching the network layer.
import api from "./api";
import { validateOrThrow, SCHEMAS } from "./validation";

export const createReview = (data) => {
  const clean = validateOrThrow(data, SCHEMAS.createReview);
  return api.apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(clean),
  });
};

export const getReviews = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const endpoint = query.toString()
    ? `/api/reviews?${query.toString()}`
    : "/api/reviews";
  return api.apiFetch(endpoint, { method: "GET" });
};

export const getReviewForOrder = (orderId) => {
  if (typeof orderId !== "string" || orderId.trim().length === 0) {
    throw new Error("A valid order ID is required.");
  }
  return api.apiFetch(
    `/api/reviews/order/${encodeURIComponent(orderId.trim())}`,
    { method: "GET" }
  );
};
