import React, { createContext, useContext, useState, useEffect } from "react";
import { authService, api } from "@/lib";

const AuthContext = createContext(null);

const normalizeUser = (nextUser) => {
  if (!nextUser || typeof nextUser !== "object") return nextUser;

  const profilePhotoUrl =
    nextUser.profilePhotoUrl ||
    nextUser.avatarUrl ||
    nextUser.profileImage ||
    nextUser.photoUrl ||
    null;

  return {
    ...nextUser,
    profilePhotoUrl,
    avatarUrl: profilePhotoUrl,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = api.getAccessToken();

    if (storedUser && token) {
      try {
        setUser(normalizeUser(JSON.parse(storedUser)));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
        api.setAccessToken(null);
      }
    }
    setLoading(false);

    // Listen for unauthorized events from API
    const handleUnauthorized = () => {
      console.log("Unauthorized event received, clearing auth state");
      setUser(null);
      setError(null);
      api.setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = async (email, password, rememberMe = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({
        email,
        password,
        rememberMe,
      });

      api.setAccessToken(response.accessToken);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);

      api.setAccessToken(response.accessToken);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Try to notify backend of logout, but don't let API failure prevent logout
      try {
        await authService.logout();
      } catch (err) {
        console.error("Logout API error:", err);
        // Continue with client-side logout even if API fails
      }
    } finally {
      // Clear all auth data immediately - this is the important part
      console.log("Clearing auth state...");
      setUser(null);
      setError(null);
      api.setAccessToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      setLoading(false);
    }
  };

  const verifyEmail = async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyEmail(token);
      api.setAccessToken(response.accessToken);
      const normalizedUser = normalizeUser(response.user);
      setUser(normalizedUser);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    const updated = normalizeUser({ ...user, ...userData });
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    verifyEmail,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
