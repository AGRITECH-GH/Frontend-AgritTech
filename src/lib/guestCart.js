const GUEST_CART_STORAGE_KEY = "guestCartV1";
const GUEST_CART_CHANGED_EVENT = "guest-cart:changed";

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const normalizeItem = (item) => {
  if (!item || typeof item !== "object") return null;

  const listingId = String(item.listingId || item?.listing?.id || item?.listing?._id || "").trim();
  const quantity = Number(item.quantity);

  if (!listingId || !Number.isFinite(quantity) || quantity <= 0) {
    return null;
  }

  return {
    listingId,
    quantity,
    listing: item.listing && typeof item.listing === "object" ? item.listing : null,
  };
};

const normalizeCart = (cart) => {
  const items = Array.isArray(cart?.items)
    ? cart.items.map(normalizeItem).filter(Boolean)
    : [];

  return { items };
};

const emitGuestCartChanged = () => {
  window.dispatchEvent(new CustomEvent(GUEST_CART_CHANGED_EVENT));
};

const readGuestCart = () => {
  const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
  const parsed = safeParse(raw);
  return normalizeCart(parsed || { items: [] });
};

const writeGuestCart = (nextCart) => {
  const normalized = normalizeCart(nextCart);
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalized));
  emitGuestCartChanged();
  return normalized;
};

const getGuestCart = () => readGuestCart();

const getGuestCartItems = () => getGuestCart().items;

const getGuestCartCount = () => getGuestCartItems().length;

const setGuestCartItemQuantity = (listingId, quantity, listing = null) => {
  const id = String(listingId || "").trim();
  const qty = Number(quantity);

  if (!id || !Number.isFinite(qty)) return getGuestCart();

  const current = getGuestCart();
  const index = current.items.findIndex((item) => item.listingId === id);

  if (qty <= 0) {
    if (index >= 0) {
      current.items.splice(index, 1);
      return writeGuestCart(current);
    }
    return current;
  }

  if (index >= 0) {
    current.items[index] = {
      ...current.items[index],
      quantity: qty,
      listing: listing && typeof listing === "object" ? listing : current.items[index].listing,
    };
    return writeGuestCart(current);
  }

  current.items.push({
    listingId: id,
    quantity: qty,
    listing: listing && typeof listing === "object" ? listing : null,
  });

  return writeGuestCart(current);
};

const addGuestCartItem = (listingId, quantity = 1, listing = null) => {
  const id = String(listingId || "").trim();
  const qty = Number(quantity);
  if (!id || !Number.isFinite(qty) || qty <= 0) return getGuestCart();

  const current = getGuestCart();
  const existing = current.items.find((item) => item.listingId === id);

  if (existing) {
    return setGuestCartItemQuantity(
      id,
      Number(existing.quantity || 0) + qty,
      listing || existing.listing,
    );
  }

  current.items.push({
    listingId: id,
    quantity: qty,
    listing: listing && typeof listing === "object" ? listing : null,
  });

  return writeGuestCart(current);
};

const removeGuestCartItem = (listingId) => {
  const id = String(listingId || "").trim();
  if (!id) return getGuestCart();

  const current = getGuestCart();
  const nextItems = current.items.filter((item) => item.listingId !== id);
  return writeGuestCart({ items: nextItems });
};

const clearGuestCart = () => {
  localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  emitGuestCartChanged();
  return { items: [] };
};

export {
  GUEST_CART_CHANGED_EVENT,
  getGuestCart,
  getGuestCartItems,
  getGuestCartCount,
  setGuestCartItemQuantity,
  addGuestCartItem,
  removeGuestCartItem,
  clearGuestCart,
};
