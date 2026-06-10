import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
  MessageSquare,
  DollarSign,
  Package,
  Star,
  Info,
} from "lucide-react";
import * as notificationsService from "@/lib/notificationsService";
import { logger } from "@/lib/logger";

const TYPE_ICONS = {
  MESSAGE: { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
  NEGOTIATION: { icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  ORDER: { icon: Package, color: "text-green-600", bg: "bg-green-50" },
  REVIEW: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50" },
  BARTER: { icon: Info, color: "text-purple-600", bg: "bg-purple-50" },
  SYSTEM: { icon: Info, color: "text-muted", bg: "bg-muted/10" },
};

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const NotifItem = ({ notif, onRead, onDelete }) => {
  const meta = TYPE_ICONS[notif.type] ?? TYPE_ICONS.SYSTEM;
  const Icon = meta.icon;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/5 transition-colors ${
        !notif.isRead ? "bg-green-50/40" : ""
      }`}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.bg}`}
      >
        <Icon className={`h-4 w-4 ${meta.color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${!notif.isRead ? "font-semibold text-foreground" : "text-foreground/80"}`}
        >
          {notif.title}
        </p>
        <p className="text-xs text-muted truncate">{notif.message}</p>
        <p className="text-xs text-muted/70 mt-0.5">
          {timeAgo(notif.createdAt)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 ml-1">
        {!notif.isRead && (
          <button
            type="button"
            onClick={() => onRead(notif.id)}
            title="Mark read"
            className="rounded p-1 hover:bg-green-100 text-green-600"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(notif.id)}
          title="Delete"
          className="rounded p-1 hover:bg-red-50 text-muted hover:text-red-500"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationsService.getNotifications({ limit: 15 });
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      logger.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Open/close + initial load
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Poll unread badge every 60s
  useEffect(() => {
    const tick = () =>
      notificationsService
        .getNotifications({ unreadOnly: true, limit: 1 })
        .then((d) => setUnreadCount(d.unreadCount ?? 0))
        .catch((err) => logger.error("Failed to poll notifications:", err));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleRead = async (id) => {
    await notificationsService.markRead(id).catch((err) => logger.error("Failed to mark read:", err));
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleDelete = async (id) => {
    await notificationsService.deleteNotification(id).catch((err) => logger.error("Failed to delete notification:", err));
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    await notificationsService.markAllRead().catch((err) => logger.error("Failed to mark all read:", err));
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted/10 transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5 text-foreground/70" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-white shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-green-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={n}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/messages");
              }}
              className="text-xs font-medium text-green-700 hover:underline"
            >
              Go to Messages →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
