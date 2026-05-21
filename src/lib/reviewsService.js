import api from "./api";

export const createReview = (data) =>
  api.apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });

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

export const getReviewForOrder = (orderId) =>
  api.apiFetch(`/api/reviews/order/${orderId}`, { method: "GET" });
