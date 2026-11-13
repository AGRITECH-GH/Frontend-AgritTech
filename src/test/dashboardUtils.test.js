import { describe, it, expect, vi } from "vitest";
import {
  toNumber,
  csvEscape,
  getIdentifier,
  getWeekStart,
  buildChartDataFromListings,
  DEFAULT_CHART_DATA,
  isOwnedByUser,
} from "@/lib/dashboardUtils";

describe("dashboardUtils", () => {
  it("coerces non-finite numbers to zero", () => {
    expect(toNumber("12.5")).toBe(12.5);
    expect(toNumber("abc")).toBe(0);
    expect(toNumber(Infinity)).toBe(0);
  });

  it("escapes CSV values, including embedded quotes", () => {
    expect(csvEscape('He said "hi"')).toBe('"He said ""hi"""');
    expect(csvEscape(null)).toBe('""');
  });

  it("reads identifiers from the common id fields", () => {
    expect(getIdentifier({ _id: "x" })).toBe("x");
    expect(getIdentifier({})).toBeNull();
  });

  it("starts the week on Monday, including when today is Sunday", () => {
    // 2026-11-15 is a Sunday; local-time constructor avoids TZ drift.
    const start = getWeekStart(new Date(2026, 10, 15, 18, 30));
    expect([start.getFullYear(), start.getMonth(), start.getDate(), start.getHours()]).toEqual([
      2026, 10, 9, 0,
    ]);
  });

  it("buckets listings into this week and last week by weekday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 13, 12)); // Friday

    const chart = buildChartDataFromListings([
      { createdAt: new Date(2026, 10, 9, 8) }, // this Monday
      { created_at: new Date(2026, 10, 13, 9) }, // this Friday
      { updatedAt: new Date(2026, 10, 4, 9) }, // last Wednesday
      { createdAt: new Date(2026, 9, 1) }, // older: ignored
      { createdAt: "not a date" }, // invalid: ignored
    ]);

    expect(chart.find((d) => d.day === "Mon")).toEqual({ day: "Mon", current: 1, previous: 0 });
    expect(chart.find((d) => d.day === "Fri")).toEqual({ day: "Fri", current: 1, previous: 0 });
    expect(chart.find((d) => d.day === "Wed")).toEqual({ day: "Wed", current: 0, previous: 1 });
    expect(chart.reduce((sum, d) => sum + d.current + d.previous, 0)).toBe(3);
  });

  it("returns the default chart for no listings", () => {
    expect(buildChartDataFromListings([])).toBe(DEFAULT_CHART_DATA);
  });

  it("detects ownership through any owner field", () => {
    expect(isOwnedByUser({ owner: { id: "u1" } }, "u1")).toBe(true);
    expect(isOwnedByUser({ sellerId: "u2" }, "u1")).toBe(false);
    expect(isOwnedByUser({ ownerId: "u1" }, null)).toBe(false);
  });
});
