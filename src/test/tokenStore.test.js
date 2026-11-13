import { describe, it, expect } from "vitest";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  decodeJwtPayload,
} from "@/lib/tokenStore";

const base64Url = (obj) =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const makeJwt = (payload) => `${base64Url({ alg: "HS256" })}.${base64Url(payload)}.sig`;

describe("tokenStore", () => {
  it("stores and clears a token", () => {
    setAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it.each([[""], [null], [undefined], [42]])("ignores invalid token %p", (value) => {
    setAccessToken(value);
    expect(getAccessToken()).toBeNull();
  });

  it("decodes a base64url JWT payload", () => {
    const payload = { id: "u1", role: "FARMER", isVerified: true, note: "??>>" };
    expect(decodeJwtPayload(makeJwt(payload))).toEqual(payload);
  });

  it.each([[null], [""], ["not-a-jwt"], ["a.%%%.c"], [123]])(
    "returns null for malformed token %p",
    (token) => {
      expect(decodeJwtPayload(token)).toBeNull();
    },
  );
});
