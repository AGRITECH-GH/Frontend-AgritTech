// src/lib/tokenStore.js
let _accessToken = null;

export const getAccessToken = () => _accessToken;

export const setAccessToken = (token) => {
  _accessToken = typeof token === "string" && token.length > 0 ? token : null;
};

export const clearAccessToken = () => {
  _accessToken = null;
};

/**
 * Decode the payload of a JWT without verifying the signature.
 * Verification happens on the server — this is only used client-side
 * to read non-sensitive claims (id, role, isVerified) from a token
 * we just received from our own server.
 */
export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      Math.ceil(normalized.length / 4) * 4,
      "="
    );
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
};
