import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentsService } from "@/lib";

export default function PaymentReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    let active = true;

    const verifyAndRedirect = async () => {
      const reference =
        searchParams.get("reference") ||
        sessionStorage.getItem("pendingPaymentReference") ||
        "";
      const orderId = sessionStorage.getItem("pendingPaymentOrderId") || "";

      if (!reference) {
        if (!active) return;
        setStatus("error");
        setMessage("No payment reference was provided.");
        return;
      }

      try {
        const response = await paymentsService.verifyPayment(reference);
        if (!active) return;

        const verified =
          String(response?.status || "").toUpperCase() === "SUCCESS";
        setStatus(verified ? "success" : "error");
        setMessage(
          response?.message ||
            (verified
              ? "Payment verified successfully. Redirecting to your order..."
              : "Payment verification failed."),
        );

        sessionStorage.removeItem("pendingPaymentReference");
        sessionStorage.removeItem("pendingPaymentMethod");

        window.setTimeout(() => {
          navigate(orderId ? `/orders/${orderId}` : "/orders", {
            replace: true,
          });
        }, 1000);
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage(err?.message || "Failed to verify payment.");
      }
    };

    verifyAndRedirect();

    return () => {
      active = false;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-[#f5f6f1] text-foreground">
      <Navbar minimal />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full rounded-3xl border border-border/60 bg-white p-8 text-center shadow-sm">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
              status === "success"
                ? "bg-green-100 text-green-700"
                : status === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : status === "error" ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Payment Status
          </h1>
          <p className="mt-3 text-sm text-muted">{message}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
