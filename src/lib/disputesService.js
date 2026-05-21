import api from "./api";

export const createDispute = (data) =>
  api.apiFetch("/api/disputes", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getDisputes = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const endpoint = query.toString()
    ? `/api/disputes?${query.toString()}`
    : "/api/disputes";
  return api.apiFetch(endpoint, { method: "GET" });
};

export const getDisputeById = (id) =>
  api.apiFetch(`/api/disputes/${id}`, { method: "GET" });

export const getAdminDisputes = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });

  const endpoint = query.toString()
    ? `/api/admin/disputes?${query.toString()}`
    : "/api/admin/disputes";
  return api.apiFetch(endpoint, { method: "GET" });
};

export const mediateDispute = (id, data) =>
  api.apiFetch(`/api/admin/disputes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
