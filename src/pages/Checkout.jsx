import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { paymentsService } from "@/lib";
import { transition } from "@/motionConfig";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { getPrimaryListingImageUrl } from "@/lib/listingImages";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash on Delivery", icon: "💵" },
  { value: "MOMO", label: "Mobile Money (MOMO)", icon: "📱" },
  { value: "CREDIT", label: "Credit Card", icon: "💳" },
  { value: "BARTER", label: "Barter Exchange", icon: "🔄" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart } = useCart();
  const { placeOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const items = cart?.items ?? [];

  const getPrice = (item) => {
    const listing = item?.listing || item || {};
    const raw = Number(
      listing?.pricePerUnit ?? listing?.price ?? item?.price ?? 0,
    );
    return Number.isFinite(raw) ? raw : 0;
  };

  const getImage = (item) => {
    const listing = item?.listing || item || {};
    return getPrimaryListingImageUrl(listing);
  };

  const subtotal = items.reduce((sum, item) => {
    return sum + getPrice(item) * Number(item?.quantity || 1);
  }, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const formatCurrency = (amount) => `GH₵${Number(amount).toFixed(2)}`;
  const requiresOnlinePayment = ["MOMO", "CREDIT"].includes(paymentMethod);
  const isEmailVerified = Boolean(
    user?.isEmailVerified ||
    user?.emailVerified ||
    user?.verified ||
    user?.isVerified,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryAddress.trim()) {
      setErrorMsg("Delivery address is required.");
      return;
    }
    if (requiresOnlinePayment && !isEmailVerified) {
      setErrorMsg("Verify your email before paying online.");
      return;
    }
    setErrorMsg("");
    setIsPlacing(true);
    try {
      const response = await placeOrder({
        paymentMethod,
        deliveryAddress: deliveryAddress.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });
      const orderId = response?.order?._id || response?.order?.id || "";

      if (requiresOnlinePayment && orderId) {
        const payment = await paymentsService.initializePayment({ orderId });
        const paymentReference = payment?.reference || "";

        if (!payment?.paymentUrl) {
          throw new Error("Payment initialization failed.");
        }

        sessionStorage.setItem("pendingPaymentOrderId", orderId);
        sessionStorage.setItem("pendingPaymentReference", paymentReference);
        sessionStorage.setItem("pendingPaymentMethod", paymentMethod);

        window.location.assign(payment.paymentUrl);
        return;
      }

      navigate(orderId ? `/orders/${orderId}` : "/orders");
    } catch (err) {
      setErrorMsg(err?.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {/* Step indicator */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
          className="mb-6 rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-700">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Checkout
                </h1>
                <p className="text-sm text-muted">
                  Confirm delivery details and payment method.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#f6f8ef] p-2 text-xs sm:text-sm">
              <div className="rounded-xl px-3 py-2 text-center font-medium text-muted">
                1. Cart
              </div>
              <div className="rounded-xl bg-primary px-3 py-2 text-center font-semibold text-white">
                2. Address
              </div>
              <div className="rounded-xl px-3 py-2 text-center font-medium text-muted">
                3. Payment
              </div>
            </div>
          </div>
        </motion.section>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {errorMsg}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
            {/* Left: delivery + payment */}
            <div className="space-y-5">
              {/* Delivery address */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition}
                className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Delivery Address
                </h2>

                <label className="block text-sm text-muted">
                  Full address
                  <textarea
                    rows={3}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. 12 Nkrumah Ave, Accra, Ghana"
                    required
                    className="mt-1 w-full rounded-xl border border-border bg-[#f8faf4] px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
                  />
                </label>

                <label className="mt-3 block text-sm text-muted">
                  Notes (optional)
                  <div className="relative mt-1">
                    <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Please call before delivery"
                      className="w-full rounded-xl border border-border bg-[#f8faf4] py-2.5 pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary"
                    />
                  </div>
                </label>
              </motion.div>

              {/* Payment method */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.05 }}
                className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 px-3 py-4 text-center transition-colors ${
                        paymentMethod === method.value
                          ? "border-primary bg-green-50 text-primary"
                          : "border-border bg-[#f8faf4] text-muted hover:border-primary/50"
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-xs font-semibold leading-tight">
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
                {requiresOnlinePayment && !isEmailVerified && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Online payments require a verified email address.
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: order summary */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay: 0.08 }}
              className="space-y-4"
            >
              {/* Items preview */}
              <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-base font-semibold text-foreground">
                  Order Items ({items.length})
                </h2>
                {items.length === 0 ? (
                  <p className="text-sm text-muted">Your cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, idx) => {
                      const listing = item?.listing || item || {};
                      const image = getImage(item);
                      const quantity = Number(item?.quantity || 1);
                      const price = getPrice(item);
                      return (
                        <div
                          key={listing?._id || listing?.id || idx}
                          className="flex items-center gap-3"
                        >
                          {image ? (
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <img
                                src={image}
                                alt={listing?.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#f0f4e5] text-primary">
                              <ShoppingBag className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {listing?.name || listing?.title || "Product"}
                            </p>
                            <p className="text-xs text-muted">
                              Qty: {quantity} × {formatCurrency(price)}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(price * quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price summary */}
              <div className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-foreground">
                  Price Details
                </h2>
                <div className="space-y-3 border-b border-border/60 pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Tax (5%)</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>
                <div className="flex justify-between py-4">
                  <span className="font-semibold text-foreground">
                    Total Amount
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isPlacing || items.length === 0}
                  className="w-full"
                >
                  {isPlacing ? "Placing Order…" : "Place Order"}
                  {!isPlacing && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <Link
                  to="/cart"
                  className="mt-3 block text-center text-sm font-medium text-primary transition-colors hover:text-green-700"
                >
                  ← Back to Cart
                </Link>
              </div>
            </motion.aside>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
