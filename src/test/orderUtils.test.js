import { describe, it, expect } from "vitest";
import {
  getStatusMeta,
  getEntityName,
  getOrderItems,
  normalizeOrder,
  formatCurrency,
  formatDate,
} from "@/lib/orderUtils";

describe("orderUtils", () => {
  it("returns status meta and falls back for unknown statuses", () => {
    expect(getStatusMeta("DELIVERED").label).toBe("Delivered");
    expect(getStatusMeta("ON_HOLD")).toMatchObject({ label: "ON_HOLD", dot: "bg-gray-300" });
  });

  it("formats currency in cedis with two decimals", () => {
    expect(formatCurrency(1234.5)).toMatch(/^GH₵1,234\.50$/);
    expect(formatCurrency(null)).toBe("GH₵0.00");
  });

  it("shows a dash for a missing date", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2026-01-15T10:00:00Z")).toMatch(/2026/);
  });

  it("picks the best available display name", () => {
    expect(getEntityName({ fullName: "Ama", email: "a@x.com" })).toBe("Ama");
    expect(getEntityName({ email: "a@x.com" })).toBe("a@x.com");
    expect(getEntityName("Kofi")).toBe("Kofi");
    expect(getEntityName(null, "Unknown")).toBe("Unknown");
  });

  it("normalises line items from any supported backend shape", () => {
    const items = getOrderItems({
      orderItems: [
        {
          _id: "i1",
          quantityOrdered: 3,
          unitPriceAtOrder: 10,
          listing: { title: "Yam", images: [{ url: "b.jpg", sortOrder: 2 }, { url: "a.jpg", isPrimary: true }] },
        },
        { id: "i2", quantity: "x", price: "abc" },
      ],
    });

    expect(items[0]).toEqual({
      id: "i1",
      name: "Yam",
      quantity: 3,
      unitPrice: 10,
      totalPrice: 30,
      image: "a.jpg",
    });
    expect(items[1]).toMatchObject({ id: "i2", name: "Product", quantity: 1, unitPrice: 0, totalPrice: 0 });
  });

  it("normalises an order and derives the total from items when missing", () => {
    const order = normalizeOrder({
      _id: "o1",
      orderStatus: "confirmed",
      created_at: "2026-01-01",
      payment: { method: "MOMO", status: "PAID" },
      buyer: { fullName: "Ama" },
      items: [
        { quantity: 2, unitPrice: 5, listing: { title: "Rice", seller: { name: "Kofi Farms" } } },
        { quantity: 1, unitPrice: 4 },
      ],
    });

    expect(order).toMatchObject({
      id: "o1",
      status: "CONFIRMED",
      createdAt: "2026-01-01",
      total: 14,
      paymentMethod: "MOMO",
      paymentStatus: "PAID",
      buyerName: "Ama",
      sellerName: "Kofi Farms",
    });
  });

  it("prefers the explicit total and defaults the status to PENDING", () => {
    const order = normalizeOrder({ id: 7, totalAmount: 99, items: [{ quantity: 1, unitPrice: 5 }] });
    expect(order).toMatchObject({ id: "7", status: "PENDING", total: 99 });
  });

  it("handles a missing order without throwing", () => {
    expect(normalizeOrder(undefined)).toMatchObject({ id: "", status: "PENDING", total: 0, items: [] });
  });
});
