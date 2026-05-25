import {
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Package,
} from "lucide-react";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";

export const STATUS_META = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
    dot: "bg-yellow-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    dot: "bg-blue-400",
  },
  DISPATCHED: {
    label: "Dispatched",
    icon: Truck,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
    dot: "bg-purple-400",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
    dot: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
    dot: "bg-red-400",
  },
};

export const LIFECYCLE = ["PENDING", "CONFIRMED", "DISPATCHED", "DELIVERED"];

export const ALLOWED_TRANSITIONS = {
  FARMER: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
  AGENT: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
  BUYER: ["CANCELLED"], // only while PENDING
  ADMIN: ["CONFIRMED", "DISPATCHED", "DELIVERED", "CANCELLED"],
};

export const getStatusMeta = (status) =>
  STATUS_META[status] || {
    label: status,
    icon: Package,
    color: "text-muted",
    bg: "",
    dot: "bg-gray-300",
  };

export const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-GH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (amount) =>
  `GH₵${Number(amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const getEntityName = (entity, fallback = "") => {
  if (!entity) return fallback;
  if (typeof entity === "string") return entity;
  return (
    entity.fullName ||
    entity.name ||
    entity.businessName ||
    entity.title ||
    entity.email ||
    fallback
  );
};

export const getOrderItems = (order) => {
  const candidates = [
    order?.items,
    order?.orderItems,
    order?.lineItems,
    order?.products,
  ];
  const list = candidates.find(Array.isArray) || [];

  return list.map((item) => {
    const listing = item?.listing || item?.product || item?.productId || {};
    const unitPrice = Number(
      item?.unitPriceAtOrder ??
      item?.unitPrice ??
        item?.price ??
        listing?.pricePerUnit ??
        listing?.price ??
        0,
    );
    const quantity = Number(item?.quantityOrdered ?? item?.quantity ?? item?.qty ?? 1);
    const image =
      getPrimaryListingImageUrl(listing) ||
      getPrimaryListingImageUrl({ images: item?.images || [] }) ||
      "";

    return {
      id: String(item?._id || item?.id || listing?._id || listing?.id || ""),
      name:
        item?.productName ||
        listing?.title ||
        listing?.name ||
        item?.name ||
        "Product",
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
      totalPrice:
        Number(item?.totalPrice ?? item?.subtotal ?? unitPrice * quantity) || 0,
      image,
    };
  });
};

export const normalizeOrder = (order) => {
  console.log("RAW ORDER:", order);
  const items = getOrderItems(order);

  return {
    raw: order,
    id: String(order?._id || order?.id || order?.orderId || ""),
    status: String(
      order?.status || order?.orderStatus || "PENDING",
    ).toUpperCase(),
    createdAt:
      order?.createdAt ||
      order?.created_at ||
      order?.updatedAt ||
      order?.updated_at ||
      null,
    total:
      Number(
        order?.totalPrice ??
          order?.totalAmount ??
          order?.total ??
          order?.amount,
      ) || items.reduce((sum, item) => sum + item.totalPrice, 0),
    paymentMethod:
      order?.paymentMethod ||
      order?.payment?.method ||
      order?.paymentType ||
      "",
    paymentStatus:
      order?.paymentStatus ||
      order?.payment?.status ||
      order?.payment?.state ||
      "",
    deliveryAddress:
      order?.deliveryAddress ||
      order?.shippingAddress ||
      order?.address ||
      order?.delivery?.address ||
      "",
    notes: order?.notes || order?.customerNotes || order?.deliveryNotes || "",
    buyerName:
      getEntityName(order?.buyer) ||
      getEntityName(order?.customer) ||
      order?.buyerName ||
      order?.customerName ||
      "",
    sellerName:
      getEntityName(order?.seller) ||
      getEntityName(order?.farmer) ||
      getEntityName(order?.agent) ||
      order?.sellerName ||
      order?.farmerName ||
      order?.agentName ||
      getEntityName(order?.items?.[0]?.listing?.seller) ||
      "",
    items,
  };
};
