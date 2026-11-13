import { describe, it, expect } from "vitest";
import { isValidEmail, cn, validateImageFiles } from "@/lib/utils";

const MB = 1024 * 1024;
const file = (type, size = 1 * MB) => ({ type, size });

describe("isValidEmail", () => {
  it.each(["ama@farm.gh", "  kofi@x.co  "])("accepts %p", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each(["", null, "ama@", "@x.com", "a b@x.com", "ama@farm"])("rejects %p", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("cn", () => {
  it("joins strings, arrays and truthy object keys", () => {
    expect(cn("a", ["b"], { c: true, d: false }, null, undefined)).toBe("a b c");
  });
});

describe("validateImageFiles", () => {
  it("accepts allowed images within limits", () => {
    expect(validateImageFiles([file("image/png"), file("image/webp")])).toEqual({
      isValid: true,
      error: "",
    });
  });

  it("enforces the file count including existing images", () => {
    const result = validateImageFiles([file("image/png"), file("image/png")], { existingCount: 4 });
    expect(result).toEqual({ isValid: false, error: "Maximum 5 images allowed." });
  });

  it("rejects disallowed types", () => {
    expect(validateImageFiles([file("image/gif")]).isValid).toBe(false);
  });

  it("rejects files over the size limit and accepts exactly the limit", () => {
    expect(validateImageFiles([file("image/jpeg", 5 * MB + 1)]).error).toBe(
      "Each image must be 5MB or smaller.",
    );
    expect(validateImageFiles([file("image/jpeg", 5 * MB)]).isValid).toBe(true);
  });
});
