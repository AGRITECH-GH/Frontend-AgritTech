import api from "./api.js";

export const getNotifications = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query.append(key, value);
    }
  });

  const serialized = query.toString();
  const endpoint = serialized
    ? `/api/notifications?${serialized}`
    : "/api/notifications";

  return api.apiFetch(endpoint, { method: "GET" });
};

export const markRead = (id) =>
  api.apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });

export const markAllRead = () =>
  api.apiFetch("/api/notifications/mark-all-read", { method: "PATCH" });

export const deleteNotification = (id) =>
  api.apiFetch(`/api/notifications/${id}`, { method: "DELETE" });
