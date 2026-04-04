// API Configuration and Utilities
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get stored access token
const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

// Set access token
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};

// Get authorization headers
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

// Generic fetch wrapper with token refresh logic
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(isFormData),
      ...options.headers,
    },
    credentials: "include", // Include cookies for httpOnly refresh token
  });

  // If unauthorized, try to refresh token (skip for auth endpoints to avoid loops)
  const isAuthEndpoint = endpoint.startsWith("/api/auth/");
  if (response.status === 401 && !isAuthEndpoint) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setAccessToken(data.accessToken);

        // Retry original request with new token
        return apiFetch(endpoint, options);
      } else {
        // Refresh failed, clear token
        setAccessToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        // Use React Router navigation if available, otherwise fall back to hard redirect
        const event = new CustomEvent("auth:unauthorized");
        window.dispatchEvent(event);
        // Hard redirect as fallback
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      // Dispatch event for React to handle
      const event = new CustomEvent("auth:unauthorized");
      window.dispatchEvent(event);
      // Hard redirect as fallback
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
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
  API_BASE_URL,
  apiFetch,
};
