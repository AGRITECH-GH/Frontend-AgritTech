import { describe, it, expect, vi } from "vitest";
import api from "@/lib/api";
import { getAccessToken, setAccessToken } from "@/lib/tokenStore";

const API = import.meta.env.VITE_API_URL;

const jsonResponse = (status, body = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

const isRefresh = (url) => url.endsWith("/api/auth/refresh");
const callsTo = (fetchMock, predicate) =>
  fetchMock.mock.calls.filter(([url]) => predicate(url)).length;

describe("apiFetch", () => {
  it("prefixes the base URL and sends the bearer token", async () => {
    setAccessToken("abc");
    const fetchMock = vi.fn(async () => jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.apiFetch("/api/listings")).resolves.toEqual({ ok: true });

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API}/api/listings`);
    expect(options.headers.Authorization).toBe("Bearer abc");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.credentials).toBe("include");
  });

  it("omits Content-Type for FormData so the browser sets the boundary", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    await api.apiFetch("/api/upload", { method: "POST", body: new FormData() });

    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
  });

  it("throws an error carrying status and server message on failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(422, { message: "Bad quantity" })));

    await expect(api.apiFetch("/api/orders")).rejects.toMatchObject({
      message: "Bad quantity",
      status: 422,
    });
  });

  it("refreshes the token once on 401 and replays the request", async () => {
    let first = true;
    const fetchMock = vi.fn(async (url) => {
      if (isRefresh(url)) return jsonResponse(200, { accessToken: "fresh" });
      if (first) {
        first = false;
        return jsonResponse(401);
      }
      return jsonResponse(200, { data: 1 });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.apiFetch("/api/me")).resolves.toEqual({ data: 1 });
    expect(getAccessToken()).toBe("fresh");
    expect(fetchMock.mock.calls.at(-1)[1].headers.Authorization).toBe("Bearer fresh");
  });

  it("gives up after one retry when the request is still 401", async () => {
    // Cap the calls so a regression fails this test instead of looping forever.
    const MAX_CALLS = 10;
    const fetchMock = vi.fn(async (url) => {
      if (fetchMock.mock.calls.length > MAX_CALLS) throw new Error("refresh loop detected");
      return isRefresh(url)
        ? jsonResponse(200, { accessToken: "t" })
        : jsonResponse(401, { message: "Forbidden" });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.apiFetch("/api/admin")).rejects.toMatchObject({ status: 401 });
    expect(callsTo(fetchMock, isRefresh)).toBe(1);
    expect(callsTo(fetchMock, (u) => u.endsWith("/api/admin"))).toBe(2);
  });

  it("shares one refresh between concurrent 401s", async () => {
    const replayed = new Set();
    const fetchMock = vi.fn(async (url) => {
      if (isRefresh(url)) {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return jsonResponse(200, { accessToken: "t" });
      }
      if (replayed.has(url)) return jsonResponse(200, { url });
      replayed.add(url);
      return jsonResponse(401);
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await Promise.all(["/a", "/b", "/c"].map((p) => api.apiFetch(p)));

    expect(results.map((r) => r.url)).toEqual([`${API}/a`, `${API}/b`, `${API}/c`]);
    expect(callsTo(fetchMock, isRefresh)).toBe(1);
  });

  it("clears the session and signals logout when refresh fails", async () => {
    setAccessToken("stale");
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(401)));
    const onUnauthorized = vi.fn();
    window.addEventListener("auth:unauthorized", onUnauthorized);

    await expect(api.apiFetch("/api/me")).rejects.toThrow("Session expired");

    expect(getAccessToken()).toBeNull();
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener("auth:unauthorized", onUnauthorized);
  });

  it("does not try to refresh on auth endpoints", async () => {
    const fetchMock = vi.fn(async () => jsonResponse(401, { message: "Invalid credentials" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.apiFetch("/api/auth/login", { method: "POST" })).rejects.toMatchObject({
      status: 401,
      message: "Invalid credentials",
    });
    expect(callsTo(fetchMock, isRefresh)).toBe(0);
  });

  it("turns an aborted request into a readable timeout error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener("abort", () =>
            reject(Object.assign(new Error("aborted"), { name: "AbortError" })),
          ),
        ),
      ),
    );

    await expect(api.apiFetch("/api/slow", { timeoutMs: 10 })).rejects.toThrow(
      "Request timed out",
    );
  });
});
