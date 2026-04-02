// Authentication API Service
import api from "./api";

const authService = {
  /**
   * Register a new user account
   * @param {Object} userData - { fullName, email, password, role, assignedRegion?, commissionRate?, bio? }
   * @returns {Promise} { message, accessToken, user }
   */
  register: (userData) =>
    api.apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  /**
   * Login user
   * @param {Object} credentials - { email, password, rememberMe? }
   * @returns {Promise} { message, accessToken, user }
   */
  login: (credentials) =>
    api.apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  /**
   * Start Google OAuth sign-in/sign-up flow
   */
  signInWithGoogle: () => {
    window.location.assign(`${api.API_BASE_URL}/api/auth/google`);
  },

  /**
   * Refresh access token using httpOnly cookie
   * @returns {Promise} { accessToken }
   */
  refreshToken: () =>
    api.apiFetch("/api/auth/refresh", {
      method: "POST",
    }),

  /**
   * Logout user
   * @returns {Promise} { message }
   */
  logout: () =>
    api.apiFetch("/api/auth/logout", {
      method: "POST",
    }),

  /**
   * Verify email with token
   * @param {string} token - Verification token from email
   * @returns {Promise} { message, accessToken, user }
   */
  verifyEmail: (token) =>
    api.apiFetch("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Promise} { message }
   */
  resendVerificationEmail: (email) =>
    api.apiFetch("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} { message }
   */
  forgotPassword: (email) =>
    api.apiFetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  /**
   * Reset password with token
   * @param {Object} data - { token, password }
   * @returns {Promise} { message }
   */
  resetPassword: (data) =>
    api.apiFetch("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Change password for authenticated user
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise} { message }
   */
  changePassword: (data) =>
    api.apiFetch("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Edit profile fields for logged in user
   * @param {Object} data - { fullName?, phoneNumber?, region?, bio? }
   * @returns {Promise} { message, user }
   */
  editProfile: (data) =>
    api.apiFetch("/api/auth/edit-profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /**
   * Request email change verification
   * @param {Object} data - { newEmail, password }
   * @returns {Promise} { message }
   */
  requestEmailChange: (data) =>
    api.apiFetch("/api/auth/request-email-change", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /**
   * Delete currently authenticated account
   * @param {Object} data - { password }
   * @returns {Promise} { message }
   */
  deleteAccount: (data) =>
    api.apiFetch("/api/auth/delete-account", {
      method: "DELETE",
      body: JSON.stringify(data),
    }),
};

export default authService;
