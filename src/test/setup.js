import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { clearAccessToken } from "@/lib/tokenStore";

// Keep every test isolated: no leaked fetch stubs, timers, storage or tokens.
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
  sessionStorage.clear();
  clearAccessToken();
});
