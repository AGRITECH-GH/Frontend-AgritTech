import api from "./api.js";

export const getConversations = () =>
  api.apiFetch("/api/conversations", { method: "GET" });

export const getOrCreateConversation = (otherUserId, listingId) =>
  api.apiFetch("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ otherUserId, listingId: listingId ?? null }),
  });

export const getMessages = (conversationId, page = 1, limit = 30) =>
  api.apiFetch(
    `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
  );

export const sendMessage = (conversationId, content) =>
  api.apiFetch(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

export const getUnreadCount = () =>
  api
    .apiFetch("/api/conversations/unread-count", { method: "GET" })
    .then((r) => r.count);
