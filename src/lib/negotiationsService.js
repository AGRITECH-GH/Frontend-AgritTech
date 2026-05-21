import api from "./api.js";

export const makeOffer = (data) =>
  api.apiFetch("/api/negotiations", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getOffers = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value);
    }
  });

  const serialized = query.toString();
  const endpoint = serialized
    ? `/api/negotiations?${serialized}`
    : "/api/negotiations";

  return api.apiFetch(endpoint, { method: "GET" });
};

export const respondToOffer = (offerId, status, note) =>
  api.apiFetch(`/api/negotiations/${offerId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
