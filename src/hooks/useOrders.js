import { useCallback, useEffect, useState } from "react";
import { ordersService } from "@/lib";

const getEntityName = (entity, fallback = "") => {
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

const getOrderItems = (order) => {
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
      item?.unitPrice ??
        item?.price ??
        listing?.pricePerUnit ??
        listing?.price ??
        0,
    );
    const quantity = Number(item?.quantity ?? item?.qty ?? 1);
    const firstImage = listing?.images?.[0] || item?.images?.[0];
    const image =
      typeof firstImage === "string"
        ? firstImage
        : firstImage?.url ||
          firstImage?.secure_url ||
          firstImage?.src ||
          listing?.imageUrl ||
          listing?.image ||
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

const normalizeOrder = (order) => {
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
      "",
    items,
  };
};

export const useOrders = (params = {}) => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async (overrideParams = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await ordersService.getMyOrders({
        ...params,
        ...overrideParams,
      });
      const list = response?.orders ?? response?.data?.orders ?? [];
      const pg = response?.pagination ?? response?.data?.pagination ?? {};
      setOrders(Array.isArray(list) ? list.map(normalizeOrder) : []);
      setPagination({
        page: Number(pg.page) || 1,
        totalPages: Number(pg.totalPages) || 1,
        total: Number(pg.total) || list.length,
      });
    } catch (err) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const placeOrder = useCallback(async (orderData) => {
    const response = await ordersService.placeOrder(orderData);
    return response;
  }, []);

  const updateStatus = useCallback(
    async (id, status) => {
      const response = await ordersService.updateOrderStatus(id, { status });
      await fetchOrders();
      return response;
    },
    [fetchOrders],
  );

  const getOrderById = useCallback(async (id) => {
    const response = await ordersService.getOrderById(id);
    return {
      ...response,
      order: normalizeOrder(response?.order || response?.data?.order || {}),
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    placeOrder,
    updateStatus,
    getOrderById,
  };
};
