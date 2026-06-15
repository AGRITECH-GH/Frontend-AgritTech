// Authentication API Service
// OWASP A03:2021 — Injection prevention via schema validation on every
// user-supplied payload before it is serialised and sent to the network.
import api from "./api";
import { validateOrThrow, SCHEMAS } from "./validation";

const GOOGLE_OAUTH_URL =
  import.meta.env.VITE_GOOGLE_OAUTH_URL ||
  `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/auth/google`;

// Allowed OAuth roles — validated before the redirect URL is constructed
const OAUTH_ROLES = ["BUYER", "FARMER", "AGENT"];

const authService = {
  /**
   * Register a new user account
   * @param {Object|FormData} userData - { fullName, email, password, role, assignedRegion?, commissionRate?, bio? } or FormData (for KYC uploads)
   * @returns {Promise} { message, accessToken, user }
   */
  register: (userData) => {
    // FormData payloads (farmer KYC with file attachments) bypass JSON
    // validation here — the server validates all fields authoritatively.
    if (userData instanceof FormData) {
      return api.apiFetch("/api/auth/register", {
        method: "POST",
        body: userData,
      });
    }
    const clean = validateOrThrow(userData, SCHEMAS.register);
    return api.apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password, rememberMe? }
   * @returns {Promise} { message, accessToken, user }
   */
  login: (credentials) => {
    const clean = validateOrThrow(credentials, SCHEMAS.login);
    return api.apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Start Google OAuth sign-in/sign-up flow
   * @param {string} [role] - Optional role ('BUYER', 'FARMER', 'AGENT')
   */
  signInWithGoogle: (role) => {
    // Only append a role parameter when the value is from the known-good list;
    // never forward arbitrary strings from query parameters into the OAuth URL.
    const safeRole = role && OAUTH_ROLES.includes(role) ? role : null;
    const url = safeRole
      ? `${GOOGLE_OAUTH_URL}?role=${encodeURIComponent(safeRole)}`
      : GOOGLE_OAUTH_URL;
    window.location.assign(url);
  },

  /**
   * Exchange Google OAuth code for an access token
   * @param {string} code - OAuth authorisation code
   * @returns {Promise} { accessToken }
   */
  exchangeGoogleCode: (code) => {
    if (typeof code !== "string" || code.trim().length === 0) {
      throw new Error("Invalid OAuth authorisation code.");
    }
    return api.apiFetch("/api/auth/google/exchange", {
      method: "POST",
      body: JSON.stringify({ code: code.trim() }),
    });
  },

  /**
   * Get role setup completion status for authenticated user
   * @returns {Promise} { role, roleSetupComplete, missingFields }
   */
  getRoleSetupStatus: () => api.apiFetch("/api/auth/role-setup-status"),

  /**
   * Complete role-specific onboarding fields
   * @param {Object|FormData} payload
   * @returns {Promise} { message, roleSetupComplete, missingFields, user }
   */
  completeRoleSetup: (payload) =>
    api.apiFetch("/api/auth/complete-role-setup", {
      method: "POST",
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    }),

  /**
   * Refresh access token using httpOnly cookie
   * @returns {Promise} { accessToken }
   */
  refreshToken: () =>
    api.apiFetch("/api/auth/refresh", { method: "POST" }),

  /**
   * Logout user
   * @returns {Promise} { message }
   */
  logout: () =>
    api.apiFetch("/api/auth/logout", { method: "POST" }),

  /**
   * Verify email with token
   * @param {string} token - Verification token from email
   * @returns {Promise} { message, accessToken, user }
   */
  verifyEmail: (token) => {
    if (typeof token !== "string" || token.trim().length === 0) {
      throw new Error("Verification token is required.");
    }
    return api.apiFetch("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token: token.trim() }),
    });
  },

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise} { message }
   */
  resendVerificationEmail: (email) => {
    const clean = validateOrThrow({ email }, SCHEMAS.forgotPassword);
    return api.apiFetch("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} { message }
   */
  forgotPassword: (email) => {
    const clean = validateOrThrow({ email }, SCHEMAS.forgotPassword);
    return api.apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Reset password with token
   * @param {Object} data - { token, password }
   * @returns {Promise} { message }
   */
  resetPassword: (data) => {
    const clean = validateOrThrow(data, SCHEMAS.resetPassword);
    return api.apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Change password for authenticated user
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise} { message }
   */
  changePassword: (data) => {
    const clean = validateOrThrow(data, SCHEMAS.changePassword);
    return api.apiFetch("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Edit profile fields for logged-in user
   * @param {Object} data - { fullName?, phoneNumber?, region?, bio? }
   * @returns {Promise} { message, user }
   */
  editProfile: (data) => {
    const clean = validateOrThrow(data, SCHEMAS.editProfile);
    return api.apiFetch("/api/auth/edit-profile", {
      method: "PUT",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Upload profile photo for authenticated user
   * @param {File} file
   * @returns {Promise} { message, user }
   */
  uploadProfilePhoto: (file) => {
    if (!(file instanceof File)) {
      throw new Error("A valid image file is required.");
    }
    const formData = new FormData();
    formData.append("photo", file);
    return api.apiFetch("/api/auth/profile-photo", {
      method: "POST",
      body: formData,
    });
  },

  /**
   * Delete profile photo for authenticated user
   * @returns {Promise} { message, user }
   */
  deleteProfilePhoto: () =>
    api.apiFetch("/api/auth/profile-photo", { method: "DELETE" }),

  /**
   * Request email change verification
   * @param {Object} data - { newEmail, password }
   * @returns {Promise} { message }
   */
  requestEmailChange: (data) => {
    const clean = validateOrThrow(data, SCHEMAS.requestEmailChange);
    return api.apiFetch("/api/auth/request-email-change", {
      method: "POST",
      body: JSON.stringify(clean),
    });
  },

  /**
   * Confirm email change with token from email link
   * @param {Object} data - { token, newEmail }
   * @returns {Promise} { message }
   */
  confirmEmailChange: (data) => {
    if (
      typeof data?.token !== "string" ||
      data.token.trim().length === 0 ||
      typeof data?.newEmail !== "string"
    ) {
      throw new Error("Valid token and new email are required.");
    }
    return api.apiFetch("/api/auth/confirm-email-change", {
      method: "POST",
      body: JSON.stringify({
        token: data.token.trim(),
        newEmail: data.newEmail.trim(),
      }),
    });
  },

  /**
   * Delete currently authenticated account
   * @param {Object} data - { password }
   * @returns {Promise} { message }
   */
  deleteAccount: (data) => {
    if (
      typeof data?.password !== "string" ||
      data.password.length === 0
    ) {
      throw new Error("Password is required to delete your account.");
    }
    return api.apiFetch("/api/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify({ password: data.password }),
    });
  },

  /**
   * Fetch the full profile of the currently authenticated user
   * @returns {Promise} { user }
   */
  getMe: () => api.apiFetch("/api/auth/me", { method: "GET" }),

  /**
   * Resubmit KYC documents for farmers
   * @param {FormData} payload - FormData containing nationalId, farmRegistration, and businessCertificate
   * @returns {Promise} { message, user }
   */
  resubmitKYC: (payload) => {
    if (!(payload instanceof FormData)) {
      throw new Error("KYC submission must include uploaded documents.");
    }
    return api.apiFetch("/api/auth/resubmit-kyc", {
      method: "POST",
      body: payload,
    });
  },
};

export default authService;
