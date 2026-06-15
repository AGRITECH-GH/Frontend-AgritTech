// Chat / Messaging API Service
// OWASP A03:2021 — Message content is validated for length and type before
// sending to prevent excessively large payloads.
import api from "./api.js";
import { validateOrThrow, SCHEMAS } from "./validation.js";

export const getConversations = () =>
  api.apiFetch("/api/conversations", { method: "GET" });

export const getOrCreateConversation = (otherUserId, listingId) => {
  // Validate only otherUserId; listingId may be intentionally null to indicate
  // a conversation with no associated listing (the backend uses this distinction).
  const clean = validateOrThrow({ otherUserId }, SCHEMAS.createConversation);
  return api.apiFetch("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ ...clean, listingId: listingId ?? null }),
  });
};

export const getMessages = (conversationId, page = 1, limit = 30) => {
  const safeConvId = encodeURIComponent(String(conversationId ?? "").trim());
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 30));
  return api.apiFetch(
    `/api/conversations/${safeConvId}/messages?page=${safePage}&limit=${safeLimit}`,
    { method: "GET" }
  );
};

export const sendMessage = (conversationId, content) => {
  const clean = validateOrThrow({ content }, SCHEMAS.sendMessage);
  return api.apiFetch(
    `/api/conversations/${encodeURIComponent(String(conversationId ?? "").trim())}/messages`,
    {
      method: "POST",
      body: JSON.stringify(clean),
    }
  );
};

export const getUnreadCount = () =>
  api
    .apiFetch("/api/conversations/unread-count", { method: "GET" })
    .then((r) => r.count);
