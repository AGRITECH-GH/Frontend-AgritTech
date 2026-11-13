// src/lib/api.js
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";
// API Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT_MS = 20000;

// One refresh at a time: concurrent 401s share the same in-flight request so
// a rotating refresh token is not spent twice (which would log the user out).
let refreshPromise = null;

const getHeaders = (isFormData = false) => {
  const headers = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
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

const refreshAccessToken = (timeoutMs) => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshResponse = await fetchWithTimeout(
          `${API_BASE_URL}/api/auth/refresh`,
          { method: "POST", credentials: "include" },
          timeoutMs,
        );
        if (!refreshResponse.ok) return false;
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);
        return true;
      } catch {
        // Network error during refresh — treat as session expired.
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

const apiFetch = async (endpoint, options = {}) => {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    _retried = false,
    ...requestOptions
  } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = requestOptions.body instanceof FormData;

  const response = await fetchWithTimeout(
    url,
    {
      ...requestOptions,
      headers: {
        ...getHeaders(isFormData),
        ...requestOptions.headers,
      },
      credentials: "include", // Include cookies for httpOnly refresh token
    },
    timeoutMs,
  );

  const isAuthEndpoint = endpoint.startsWith("/api/auth/");

  // Retry at most once: if the request is still 401 after a successful
  // refresh, fall through and surface the error instead of looping.
  if (response.status === 401 && !isAuthEndpoint && !_retried) {
    const refreshSucceeded = await refreshAccessToken(timeoutMs);

    if (!refreshSucceeded) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      throw new Error("Session expired. Please log in again.");
    }

    return apiFetch(endpoint, { ...requestOptions, timeoutMs, _retried: true });
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || "API request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export default {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  API_BASE_URL,
  apiFetch,
};
