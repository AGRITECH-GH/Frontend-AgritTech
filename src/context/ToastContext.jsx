import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react";
import { Link } from "react-router-dom";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = Date.now().toString();
      const newToast = { id, ...toast };
      setToasts((prev) => [...prev, newToast]);

      if (toast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 4000);
      }
    },
    [removeToast],
  );

  const success = useCallback(
    (message, options) => {
      addToast({ type: "success", message, ...options });
    },
    [addToast],
  );

  const error = useCallback(
    (message, options) => {
      addToast({ type: "error", message, ...options });
    },
    [addToast],
  );

  const value = {
    addToast,
    removeToast,
    success,
    error,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Global Toast Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 sm:bottom-6 sm:left-auto sm:right-6 sm:px-0 sm:pb-0 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onRemove={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    error: <XCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const styles = {
    success: "border-green-200 bg-white shadow-2xl",
    error: "border-red-200 bg-white shadow-2xl",
    warning: "border-amber-200 bg-white shadow-2xl",
    info: "border-blue-200 bg-white shadow-2xl",
  };

  const bgStyles = {
    success: "bg-green-100",
    error: "bg-red-100",
    warning: "bg-amber-100",
    info: "bg-blue-100",
  };

  return (
    <motion.div
      layout
      initial={{ y: 80, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 20, opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`flex items-center gap-4 rounded-xl border px-5 py-4 w-full sm:w-auto pointer-events-auto ${styles[toast.type || "info"]}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgStyles[toast.type || "info"]}`}
      >
        {icons[toast.type || "info"]}
      </div>
      <div className="flex-1 sm:flex-none">
        <p className="text-sm font-semibold text-gray-900">
          {toast.title ||
            (toast.type === "success"
              ? "Success"
              : toast.type === "error"
                ? "Error"
                : "Notification")}
        </p>
        <p className="text-xs text-gray-500">{toast.message}</p>
      </div>

      {toast.action && (
        <Link
          to={toast.action.href}
          className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
          onClick={onRemove}
        >
          {toast.action.icon}
          {toast.action.label}
        </Link>
      )}

      <button
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors ml-2"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
