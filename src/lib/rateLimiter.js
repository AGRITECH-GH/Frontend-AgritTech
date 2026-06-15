// src/lib/rateLimiter.js
// OWASP API4:2023 — Unrestricted Resource Consumption
//
// Client-side, sliding-window rate limiter.  This is a defence-in-depth layer
// that prevents accidental request floods and slows brute-force attempts from
// the UI layer.  It is NOT a substitute for server-side rate limiting, which
// is the authoritative control.
//
// Each endpoint+method pair has its own independent bucket.  When a bucket is
// full the caller receives an { allowed: false, retryAfterMs } result and
// should surface a friendly message rather than sending the request.

/** @type {Map<string, number[]>} endpoint key → sorted array of request timestamps */
const _windows = new Map();

/**
 * Per-endpoint rate-limit configs.
 * Keys are matched by exact path then longest-prefix; "default" is the fallback.
 * Format: { maxRequests: number, windowMs: number }
 */
const CONFIGS = {
  // Auth — tight limits to impede brute-force from the browser
  "/api/auth/login":               { maxRequests: 5,  windowMs: 30_000 },
  "/api/auth/register":            { maxRequests: 3,  windowMs: 60_000 },
  "/api/auth/forgot-password":     { maxRequests: 3,  windowMs: 60_000 },
  "/api/auth/reset-password":      { maxRequests: 5,  windowMs: 60_000 },
  "/api/auth/resend-verification": { maxRequests: 3,  windowMs: 60_000 },
  "/api/auth/change-password":     { maxRequests: 5,  windowMs: 60_000 },
  "/api/auth/verify-email":        { maxRequests: 5,  windowMs: 60_000 },
  "/api/auth/request-email-change":{ maxRequests: 3,  windowMs: 60_000 },
  "/api/auth/delete-account":      { maxRequests: 3,  windowMs: 60_000 },

  // Payments — prevent accidental double-charges
  "/api/payments/initialize":      { maxRequests: 3,  windowMs: 30_000 },

  // Orders — prevent double-submit on checkout
  "/api/orders":                   { maxRequests: 5,  windowMs: 10_000 },

  // Default for everything else (generous; primary limiter is the server)
  default:                         { maxRequests: 30, windowMs: 10_000 },
};

/**
 * Resolve the rate-limit config for a given endpoint path.
 * Strips the query string then tries exact match, longest-prefix, then default.
 *
 * @param {string} endpoint
 * @returns {{ maxRequests: number, windowMs: number }}
 */
const _getConfig = (endpoint) => {
  const path = endpoint.split("?")[0];
  if (CONFIGS[path]) return CONFIGS[path];

  let best = null;
  let bestLen = 0;
  for (const key of Object.keys(CONFIGS)) {
    if (key === "default") continue;
    if (path.startsWith(key) && key.length > bestLen) {
      best = CONFIGS[key];
      bestLen = key.length;
    }
  }
  return best ?? CONFIGS.default;
};

/**
 * Check whether a request is permitted under the sliding-window policy.
 * Records the attempt if allowed.
 *
 * @param {string} endpoint - The API endpoint path (may include query string)
 * @param {string} [method="GET"] - HTTP method
 * @returns {{ allowed: boolean, retryAfterMs?: number }}
 */
export const checkRateLimit = (endpoint, method = "GET") => {
  const key = `${method.toUpperCase()}:${endpoint.split("?")[0]}`;
  const { maxRequests, windowMs } = _getConfig(endpoint);
  const now = Date.now();

  // Evict timestamps outside the current window
  const recent = (_windows.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    // Time until the oldest request falls outside the window
    const retryAfterMs = windowMs - (now - recent[0]);
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1_000) };
  }

  recent.push(now);
  _windows.set(key, recent);
  return { allowed: true };
};

/**
 * Parse a Retry-After header value (delta-seconds or HTTP-date) into
 * milliseconds.  Returns null when the header is absent or unparseable.
 *
 * @param {string|null|undefined} headerValue
 * @returns {number|null}
 */
export const parseRetryAfter = (headerValue) => {
  if (!headerValue) return null;

  // Delta-seconds form: "Retry-After: 30"
  const seconds = parseInt(headerValue, 10);
  if (Number.isFinite(seconds) && seconds > 0) return seconds * 1_000;

  // HTTP-date form: "Retry-After: Wed, 21 Oct 2025 07:28:00 GMT"
  const date = new Date(headerValue);
  const diff = date.getTime() - Date.now();
  return Number.isFinite(diff) && diff > 0 ? diff : null;
};

/**
 * Return a human-readable "please try again in N seconds" message.
 *
 * @param {number} ms
 * @returns {string}
 */
export const formatRetryMessage = (ms) => {
  if (!ms || ms <= 0) return "Please try again.";
  const seconds = Math.ceil(ms / 1_000);
  return seconds === 1
    ? "Too many requests. Please try again in 1 second."
    : `Too many requests. Please try again in ${seconds} seconds.`;
};
