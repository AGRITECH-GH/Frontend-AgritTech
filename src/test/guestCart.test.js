import { describe, it, expect, vi } from "vitest";
import {
  GUEST_CART_CHANGED_EVENT,
  getGuestCart,
  getGuestCartCount,
  addGuestCartItem,
  setGuestCartItemQuantity,
  removeGuestCartItem,
  clearGuestCart,
} from "@/lib/guestCart";

const STORAGE_KEY = "guestCartV1";

describe("guestCart", () => {
  it("starts empty", () => {
    expect(getGuestCart()).toEqual({ items: [] });
    expect(getGuestCartCount()).toBe(0);
  });

  it("adds items and merges quantities for the same listing", () => {
    addGuestCartItem("L1", 2, { title: "Maize" });
    addGuestCartItem("L1", 3);
    addGuestCartItem("L2");

    expect(getGuestCart().items).toEqual([
      { listingId: "L1", quantity: 5, listing: { title: "Maize" } },
      { listingId: "L2", quantity: 1, listing: null },
    ]);
    expect(getGuestCartCount()).toBe(2);
  });

  it.each([
    ["", 1],
    ["L1", 0],
    ["L1", -2],
    ["L1", "abc"],
  ])("rejects invalid add (%p, %p)", (id, qty) => {
    addGuestCartItem(id, qty);
    expect(getGuestCart().items).toEqual([]);
  });

  it("sets an exact quantity and removes the item at zero", () => {
    addGuestCartItem("L1", 2);
    setGuestCartItemQuantity("L1", 7);
    expect(getGuestCart().items[0].quantity).toBe(7);

    setGuestCartItemQuantity("L1", 0);
    expect(getGuestCart().items).toEqual([]);
  });

  it("removes a single item and clears the cart", () => {
    addGuestCartItem("L1");
    addGuestCartItem("L2");
    removeGuestCartItem("L1");
    expect(getGuestCart().items.map((i) => i.listingId)).toEqual(["L2"]);

    clearGuestCart();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("recovers from corrupt or malformed storage", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(getGuestCart()).toEqual({ items: [] });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: [{ listingId: "L1", quantity: 2 }, { quantity: 3 }, null, { listingId: "L2", quantity: -1 }] }),
    );
    expect(getGuestCart().items).toEqual([{ listingId: "L1", quantity: 2, listing: null }]);
  });

  it("notifies listeners whenever the cart changes", () => {
    const listener = vi.fn();
    window.addEventListener(GUEST_CART_CHANGED_EVENT, listener);

    addGuestCartItem("L1");
    removeGuestCartItem("L1");
    clearGuestCart();

    expect(listener).toHaveBeenCalledTimes(3);
    window.removeEventListener(GUEST_CART_CHANGED_EVENT, listener);
  });
});
