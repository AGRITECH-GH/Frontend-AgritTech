// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import {
  authService,
  api,
  cartService,
  getGuestCart,
  clearGuestCart,
} from "@/lib";
import {
  setAccessToken,
  clearAccessToken,
} from "@/lib/tokenStore";

export const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Session hint
// ---------------------------------------------------------------------------
// The refresh token lives in an httpOnly cookie — JS can't inspect it.
// This flag lets us skip the /api/auth/refresh call entirely for guests
// who have never logged in, avoiding a guaranteed 401 on every page load.
const SESSION_HINT = "fb_has_session";
const markSession = () => localStorage.setItem(SESSION_HINT, "1");
const clearSession = () => localStorage.removeItem(SESSION_HINT);
const hasSession = () => !!localStorage.getItem(SESSION_HINT);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") return null;
  const photo =
    user.profilePhotoUrl ||
    user.avatarUrl ||
    user.profileImage ||
    user.photoUrl ||
    null;
  return { ...user, profilePhotoUrl: photo, avatarUrl: photo };
};

/**
 * After a buyer logs in, push any items they added as a guest into
 * their server-side cart. Each item is pushed independently — a single
 * unavailable listing will not abort the rest of the merge.
 */
const mergeGuestCartIntoAccount = async (role) => {
  if (role !== "BUYER") return;

  const guestItems = getGuestCart().items ?? [];
  if (guestItems.length === 0) return;

  const results = await Promise.allSettled(
    guestItems.map((item) => {
      const listingId = String(item?.listingId ?? "").trim();
      const quantity = Number(item?.quantity ?? 0);
      if (!listingId || !Number.isFinite(quantity) || quantity <= 0) {
        return Promise.resolve(); // skip malformed items
      }
      return cartService.addItemToCart({ listingId, quantity });
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.warn(
      `Guest cart merge: ${failed} of ${guestItems.length} items could not be added.`
    );
  }

  // Always clear the guest cart — even if some items failed, we don't want
  // them re-attempted on the next login.
  clearGuestCart();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // true while we're checking the httpOnly cookie on mount
  const [loading, setLoading] = useState(true);
  // Prevent the hydration effect from running twice in React StrictMode
  const hydrated = useRef(false);

  // ── Silent hydration on mount ──────────────────────────────────────────
  // The access token lives only in memory and is lost on page refresh.
  // We recover it by hitting /api/auth/refresh (uses the httpOnly cookie)
  // then fetching the full user profile from /api/auth/me.
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const hydrate = async () => {
      if (!hasSession()) {
        setLoading(false);
        return;
      }
      try {
        // Step 1: get a fresh access token via the cookie
        const { accessToken } = await authService.refreshToken();
        setAccessToken(accessToken);

        // Step 2: fetch the full user profile so every field is available
        const { user: freshUser } = await authService.getMe();
        setUser(normalizeUser(freshUser));
      } catch {
        // Cookie is missing or expired — clear the hint so we don't retry
        // on the next page load.
        clearAccessToken();
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrate();

    const handleUnauthorized = () => {
      clearAccessToken();
      setUser(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  // ── Auth actions ────────────────────────────────────────────────────────

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    setAccessToken(response.accessToken);
    markSession();
    const normalized = normalizeUser(response.user);
    setUser(normalized);
    await mergeGuestCartIntoAccount(normalized?.role);
    return response;
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    const response = await authService.login({ email, password, rememberMe });
    setAccessToken(response.accessToken);
    markSession();
    const normalized = normalizeUser(response.user);
    setUser(normalized);
    await mergeGuestCartIntoAccount(normalized?.role);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Server-side logout failed (network issue, already expired, etc.).
      // We still clear client state — the user is logged out from their
      // perspective regardless of whether the server acknowledged it.
    } finally {
      clearAccessToken();
      clearSession();
      setUser(null);
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const response = await authService.verifyEmail(token);
    setAccessToken(response.accessToken);
    markSession();
    const normalized = normalizeUser(response.user);
    setUser(normalized);
    return response;
  }, []);

  const completeGoogleAuth = useCallback(async (code) => {
    const response = await authService.exchangeGoogleCode(code);
    if (!response?.accessToken) {
      throw new Error("Google sign-in did not return an access token.");
    }
    setAccessToken(response.accessToken);
    markSession();
    const normalized = normalizeUser(response.user);
    setUser(normalized);
    await mergeGuestCartIntoAccount(normalized?.role);
    return response;
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => normalizeUser({ ...prev, ...userData }));
  }, []);

  // ── Context value ───────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        verifyEmail,
        completeGoogleAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
