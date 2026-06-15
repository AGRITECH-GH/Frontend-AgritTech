// src/lib/api.js
// OWASP API4:2023 — Unrestricted Resource Consumption
// OWASP API3:2023 — Broken Object Property Level Authorisation
//
// Central API client.  All network requests in the app go through `apiFetch`.
// Security responsibilities handled here:
//   1. Client-side rate limiting (defence-in-depth; server is authoritative)
//   2. Graceful 429 Too Many Requests handling with Retry-After propagation
//   3. Automatic token refresh on 401 with a single retry
//   4. Request timeout to prevent hanging connections
//   5. Bearer-token injection from the in-memory token store (never localStorage)

import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";
import {
  checkRateLimit,
  parseRetryAfter,
  formatRetryMessage,
} from "./rateLimiter";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT_MS = 20_000;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const _getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const _fetchWithTimeout = async (
  url,
  options = {},
  timeoutMs = DEFAULT_TIMEOUT_MS
) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

/**
 * Make an authenticated API request with rate limiting, timeout, and
 * automatic token-refresh on 401.
 *
 * Options (in addition to standard fetch options):
 *   timeoutMs        {number}  Per-request timeout override (default 20 s)
 *   _skipRateLimit   {boolean} Internal flag — skips rate check for the token
 *                              refresh sub-request so it never blocks itself
 *
 * Throws with:
 *   error.status        HTTP status code
 *   error.data          Parsed response body
 *   error.retryAfterMs  Milliseconds to wait (only on 429)
 */
const apiFetch = async (endpoint, options = {}) => {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, _skipRateLimit = false, ...requestOptions } = options;
  const method = (requestOptions.method || "GET").toUpperCase();

  // ── 1. Client-side rate limit check ───────────────────────────────────────
  if (!_skipRateLimit) {
    const { allowed, retryAfterMs } = checkRateLimit(endpoint, method);
    if (!allowed) {
      const err = new Error(formatRetryMessage(retryAfterMs));
      err.status = 429;
      err.retryAfterMs = retryAfterMs;
      throw err;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = requestOptions.body instanceof FormData;

  const response = await _fetchWithTimeout(
    url,
    {
      ...requestOptions,
      headers: {
        ..._getHeaders(isFormData),
        ...requestOptions.headers,
      },
      credentials: "include", // Required for httpOnly refresh-token cookie
    },
    timeoutMs
  );

  // ── 2. 429 Too Many Requests — surface Retry-After to the caller ──────────
  if (response.status === 429) {
    const retryAfterMs = parseRetryAfter(response.headers.get("Retry-After"));
    const body = await response.json().catch(() => ({}));
    const message =
      body.message || formatRetryMessage(retryAfterMs ?? 60_000);
    const err = new Error(message);
    err.status = 429;
    err.data = body;
    if (retryAfterMs) err.retryAfterMs = retryAfterMs;
    throw err;
  }

  // ── 3. 401 Unauthorised — try a silent token refresh then retry once ───────
  const isAuthEndpoint = endpoint.startsWith("/api/auth/");

  if (response.status === 401 && !isAuthEndpoint) {
    let refreshSucceeded = false;
    try {
      const refreshResponse = await _fetchWithTimeout(
        `${API_BASE_URL}/api/auth/refresh`,
        { method: "POST", credentials: "include" },
        timeoutMs
      );
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        refreshSucceeded = true;
      }
    } catch {
      // Network error during refresh — treat as session expired
    }

    if (!refreshSucceeded) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      throw new Error("Session expired. Please log in again.");
    }

    // Retry original request after successful refresh.
    // _skipRateLimit: true so the retry doesn't consume another rate-limit slot.
    return apiFetch(endpoint, { ...requestOptions, timeoutMs, _skipRateLimit: true });
  }

  // ── 4. Parse response body ─────────────────────────────────────────────────
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || "API request failed");
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export default {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  API_BASE_URL,
  apiFetch,
};
