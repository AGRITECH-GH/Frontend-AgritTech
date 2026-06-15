// src/lib/validation.js
// OWASP A03:2021 — Injection  /  A08:2021 — Software and Data Integrity Failures
//
// Centralised, schema-based input validation and sanitisation layer.
// All validation runs client-side before the request is sent; the server is
// still the authoritative validator — this is a defence-in-depth measure.
//
// Usage:
//   import { validateOrThrow, SCHEMAS } from "./validation";
//   const clean = validateOrThrow(rawData, SCHEMAS.login);

// ---------------------------------------------------------------------------
// Field-level validator
// ---------------------------------------------------------------------------

/**
 * Validate a single value against a rule set.
 * Returns an error string if invalid, or null if valid.
 *
 * @param {string} name - Human-readable field name for error messages
 * @param {*} value
 * @param {Object} rules
 * @returns {string|null}
 */
const _validateField = (name, value, rules) => {
  const {
    required,
    type,
    minLength,
    maxLength,
    min,
    max,
    pattern,
    enum: allowed,
  } = rules;

  const isEmpty =
    value === undefined || value === null || value === "" ||
    (typeof value === "string" && value.trim() === "");

  if (required && isEmpty) return `${name} is required.`;
  if (isEmpty) return null; // optional and absent — skip further checks

  if (type === "string") {
    if (typeof value !== "string") return `${name} must be a string.`;
    const trimmed = value.trim();
    if (minLength !== undefined && trimmed.length < minLength)
      return `${name} must be at least ${minLength} character${minLength === 1 ? "" : "s"}.`;
    if (maxLength !== undefined && trimmed.length > maxLength)
      return `${name} must not exceed ${maxLength} characters.`;
    if (pattern && !pattern.test(trimmed))
      return `${name} has an invalid format.`;
  }

  if (type === "email") {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return `${name} must be a valid email address.`;
    // RFC 5321 maximum total length
    if (trimmed.length > 254)
      return `${name} must not exceed 254 characters.`;
  }

  if (type === "number") {
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(num)) return `${name} must be a valid number.`;
    if (min !== undefined && num < min)
      return `${name} must be at least ${min}.`;
    if (max !== undefined && num > max)
      return `${name} must not exceed ${max}.`;
  }

  if (type === "boolean") {
    if (typeof value !== "boolean") return `${name} must be true or false.`;
  }

  if (allowed && !allowed.includes(value)) {
    return `${name} must be one of: ${allowed.join(", ")}.`;
  }

  return null;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validate `data` against a `schema` object.
 * Fields not declared in the schema are stripped (allowlist approach) unless
 * `stripUnknown: false` is passed — which is only useful when the schema is
 * a strict subset of a larger server-side model.
 *
 * @param {Object} data
 * @param {Object} schema - { fieldName: ruleObject }
 * @param {{ stripUnknown?: boolean }} [options]
 * @returns {{ errors: Object|null, sanitized: Object }}
 */
export const validate = (data = {}, schema, { stripUnknown = true } = {}) => {
  const errors = {};
  const sanitized = {};

  for (const [name, rules] of Object.entries(schema)) {
    const err = _validateField(name, data[name], rules);
    if (err) {
      errors[name] = err;
      continue;
    }
    const v = data[name];
    if (v !== undefined && v !== null && v !== "") {
      // Normalise: trim strings, keep other types as-is
      sanitized[name] =
        rules.type === "string" || rules.type === "email"
          ? String(v).trim()
          : v;
    }
  }

  // Preserve unknown fields when the caller explicitly opts in
  if (!stripUnknown) {
    for (const [k, v] of Object.entries(data)) {
      if (!(k in schema)) sanitized[k] = v;
    }
  }

  return {
    errors: Object.keys(errors).length > 0 ? errors : null,
    sanitized,
  };
};

/**
 * Validate `data` and return the sanitized payload on success, or throw an
 * Error whose message is the first validation failure.
 *
 * @param {Object} data
 * @param {Object} schema
 * @param {{ stripUnknown?: boolean }} [options]
 * @returns {Object} sanitized payload
 * @throws {Error}
 */
export const validateOrThrow = (data, schema, options) => {
  const { errors, sanitized } = validate(data, schema, options);
  if (errors) {
    // Surface the first error to the UI; server will validate the rest
    throw new Error(Object.values(errors)[0]);
  }
  return sanitized;
};

// ---------------------------------------------------------------------------
// Schemas — one per major request type
// Each schema acts as an explicit allowlist of accepted fields and their
// constraints (type, length, range, enum), so unexpected fields are silently
// stripped before the payload reaches the network.
// ---------------------------------------------------------------------------

export const SCHEMAS = {
  // ── Authentication ──────────────────────────────────────────────────────

  login: {
    email:      { required: true,  type: "email" },
    // Length cap prevents memory-exhaustion via enormous password strings
    password:   { required: true,  type: "string", minLength: 1, maxLength: 128 },
    rememberMe: { required: false, type: "boolean" },
  },

  register: {
    fullName:       { required: true,  type: "string", minLength: 2, maxLength: 100 },
    email:          { required: true,  type: "email" },
    password:       { required: true,  type: "string", minLength: 8, maxLength: 128 },
    role:           { required: true,  type: "string",
                      enum: ["BUYER", "FARMER", "AGENT"] },
    // Agent-only optional fields
    assignedRegion: { required: false, type: "string", maxLength: 100 },
    commissionRate: { required: false, type: "number", min: 0, max: 100 },
    bio:            { required: false, type: "string", maxLength: 1000 },
  },

  forgotPassword: {
    email: { required: true, type: "email" },
  },

  resetPassword: {
    token:    { required: true, type: "string", minLength: 1, maxLength: 512 },
    password: { required: true, type: "string", minLength: 8, maxLength: 128 },
  },

  changePassword: {
    currentPassword: { required: true, type: "string", minLength: 1, maxLength: 128 },
    newPassword:     { required: true, type: "string", minLength: 8, maxLength: 128 },
  },

  editProfile: {
    fullName:    { required: false, type: "string", minLength: 2,  maxLength: 100 },
    phoneNumber: {
      required: false,
      type: "string",
      maxLength: 20,
      // Allow digits, spaces, hyphens, parentheses, and leading +
      pattern: /^[+\d\s\-()]{1,20}$/,
    },
    region:      { required: false, type: "string", maxLength: 100 },
    bio:         { required: false, type: "string", maxLength: 1000 },
  },

  requestEmailChange: {
    newEmail: { required: true, type: "email" },
    password: { required: true, type: "string", minLength: 1, maxLength: 128 },
  },

  // ── Listings ────────────────────────────────────────────────────────────

  createListing: {
    title:             { required: true,  type: "string", minLength: 3,  maxLength: 200 },
    description:       { required: false, type: "string",                maxLength: 5000 },
    pricePerUnit:      { required: true,  type: "number", min: 0 },
    quantity:          { required: true,  type: "number", min: 0 },
    quantityAvailable: { required: false, type: "number", min: 0 },
    unit:              { required: true,  type: "string",                maxLength: 50 },
    location:          { required: true,  type: "string", minLength: 2,  maxLength: 200 },
    listingType:       { required: true,  type: "string",
                         enum: ["SELL", "BARTER", "BOTH"] },
    categoryId:        { required: true,  type: "string",                maxLength: 100 },
    // Optional fields kept in schema so they pass through sanitisation
    harvestDate:       { required: false, type: "string",                maxLength: 50 },
    isDraft:           { required: false, type: "boolean" },
    publish:           { required: false, type: "boolean" },
  },

  updateListing: {
    title:             { required: false, type: "string", minLength: 3,  maxLength: 200 },
    description:       { required: false, type: "string",                maxLength: 5000 },
    pricePerUnit:      { required: false, type: "number", min: 0 },
    quantityAvailable: { required: false, type: "number", min: 0 },
    status:            { required: false, type: "string",
                         enum: ["ACTIVE", "INACTIVE", "SOLD_OUT"] },
    publish:           { required: false, type: "boolean" },
    isDraft:           { required: false, type: "boolean" },
  },

  // ── Orders ──────────────────────────────────────────────────────────────

  placeOrder: {
    paymentMethod:   { required: true,  type: "string",
                        enum: ["CASH_ON_DELIVERY", "PAY_ONLINE"] },
    deliveryAddress: { required: true,  type: "string", minLength: 5, maxLength: 500 },
    notes:           { required: false, type: "string",               maxLength: 1000 },
  },

  // ── Payments ────────────────────────────────────────────────────────────

  initializePayment: {
    orderId: { required: true, type: "string", minLength: 1, maxLength: 100 },
  },

  // ── Messaging ───────────────────────────────────────────────────────────

  sendMessage: {
    content: { required: true, type: "string", minLength: 1, maxLength: 2000 },
  },

  createConversation: {
    otherUserId: { required: true,  type: "string", maxLength: 100 },
    listingId:   { required: false, type: "string", maxLength: 100 },
  },

  // ── Reviews ─────────────────────────────────────────────────────────────

  createReview: {
    orderId:  { required: true,  type: "string", maxLength: 100 },
    rating:   { required: true,  type: "number", min: 1, max: 5 },
    comment:  { required: false, type: "string", maxLength: 2000 },
  },
};
