import { useState } from "react";
import { MailWarning, X, RefreshCw } from "lucide-react";
import { authService } from "@/lib";
import { useAuth } from "@/context/AuthContext";

export default function VerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  const isVerified = Boolean(
    user?.isVerified ??
    user?.isEmailVerified ??
    user?.emailVerified ??
    user?.verified,
  );

  if (!user || isVerified || dismissed) return null;

  const handleResend = async () => {
    if (resending || !user.email) return;
    setResending(true);
    setResendStatus("");
    try {
      await authService.resendVerificationEmail(user.email);
      setResendStatus("sent");
    } catch {
      setResendStatus("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 min-w-0">
          <MailWarning className="h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800 truncate">
            {resendStatus === "sent" ? (
              "Verification email sent — check your inbox."
            ) : resendStatus === "error" ? (
              "Could not send email. Please try again."
            ) : (
              <>
                Your email is not verified. Listing creation and order placement
                are blocked.{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:text-amber-900 disabled:opacity-60"
                >
                  {resending && <RefreshCw className="h-3 w-3 animate-spin" />}
                  Resend verification email
                </button>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="shrink-0 rounded-full p-1 text-amber-600 transition-colors hover:bg-amber-100 hover:text-amber-800"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
