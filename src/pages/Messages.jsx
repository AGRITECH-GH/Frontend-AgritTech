import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import * as chatService from "@/lib/chatService";

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Conversation list item ──────────────────────────────────────────────────
const ConversationItem = ({ conv, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-green-50/60 transition-colors ${
      isActive ? "bg-green-50 border-l-2 border-l-green-600" : ""
    }`}
  >
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 overflow-hidden">
        {conv.otherUser?.profilePhotoUrl ? (
          <img
            src={conv.otherUser.profilePhotoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          (conv.otherUser?.fullName?.[0]?.toUpperCase() ?? "?")
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground truncate">
            {conv.otherUser?.fullName}
          </span>
          {conv.lastMessage && (
            <span className="text-xs text-muted shrink-0 ml-2">
              {timeAgo(conv.lastMessage.sentAt)}
            </span>
          )}
        </div>
        {conv.listing && (
          <p className="text-xs text-green-700 truncate font-medium">
            {conv.listing.title}
          </p>
        )}
        <p className="text-xs text-muted truncate mt-0.5">
          {conv.lastMessage?.content ?? "No messages yet"}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs text-white font-bold">
          {conv.unreadCount}
        </span>
      )}
    </div>
  </button>
);

// ─── Message bubble ──────────────────────────────────────────────────────────
const MessageBubble = ({ msg, isMine }) => (
  <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2`}>
    <div
      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
        isMine
          ? "bg-green-600 text-white rounded-br-sm"
          : "bg-white border border-border text-foreground rounded-bl-sm"
      }`}
    >
      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
      <p className={`mt-1 text-xs ${isMine ? "text-green-100" : "text-muted"}`}>
        {timeAgo(msg.sentAt)}
      </p>
    </div>
  </div>
);

// ─── Main component ──────────────────────────────────────────────────────────
export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [convsError, setConvsError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [activeConv, setActiveConv] = useState(null);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Load conversation list
  useEffect(() => {
    setConvsLoading(true);
    chatService
      .getConversations()
      .then((data) => {
        setConversations(data);
        setConvsError(null);
      })
      .catch(() => setConvsError("Failed to load conversations"))
      .finally(() => setConvsLoading(false));
  }, []);

  // Load messages when conversationId changes
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setActiveConv(null);
      return;
    }
    setMsgsLoading(true);
    chatService
      .getMessages(conversationId)
      .then(({ messages: msgs }) => {
        setMessages(msgs);
        setActiveConv(
          conversations.find((c) => c.id === conversationId) ?? null,
        );
      })
      .catch(() => {})
      .finally(() => setMsgsLoading(false));
  }, [conversationId, conversations]);

  // Poll for new messages every 5s while a conversation is open
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(async () => {
      try {
        const { messages: msgs } = await chatService.getMessages(conversationId);
        setMessages(msgs);
      } catch {
        // silently skip failed polls
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [conversationId]);

  // Poll conversation list every 10s to keep unread counts fresh
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await chatService.getConversations();
        setConversations(data);
      } catch {
        // silently skip failed polls
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConversation = (conv) => {
    navigate(`/messages/${conv.id}`);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversationId || sending) return;
    setSending(true);
    try {
      const msg = await chatService.sendMessage(conversationId, text.trim());
      setMessages((prev) => [...prev, msg]);
      setText("");
      setSendError("");
      textareaRef.current?.focus();
      // Update last message preview in conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? { ...c, lastMessage: msg, unreadCount: 0 }
            : c,
        ),
      );
    } catch {
      setSendError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const isMine = (msg) =>
    msg.senderId === user?.id || msg.sender?.id === user?.id;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/marketplace");
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-surface">
      {/* ── Sidebar: conversation list ── */}
      <aside className={`w-full md:w-80 shrink-0 flex-col border-r border-border bg-white overflow-hidden ${conversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-lg p-1 hover:bg-muted/10"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-foreground/70" />
          </button>
          <MessageSquare className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-foreground">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted" />
            </div>
          ) : convsError ? (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <p className="text-sm text-muted">{convsError}</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center">
              <MessageSquare className="h-8 w-8 text-muted/40" />
              <p className="text-sm text-muted">No conversations yet</p>
              <p className="text-xs text-muted/70">
                Start a conversation from any listing page.
              </p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={conv.id === conversationId}
                onClick={() => openConversation(conv)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main: message thread ── */}
      <main className={`flex-1 flex-col overflow-hidden ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
        {!conversationId ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted/30" />
              <p className="mt-3 text-sm text-muted">
                Select a conversation to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 shrink-0">
              <button
                type="button"
                onClick={handleBack}
                className="md:hidden rounded-lg p-1 hover:bg-muted/10"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              {activeConv && (
                <>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-800 overflow-hidden">
                    {activeConv.otherUser?.profilePhotoUrl ? (
                      <img
                        src={activeConv.otherUser.profilePhotoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (activeConv.otherUser?.fullName?.[0]?.toUpperCase() ??
                      "?")
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {activeConv.otherUser?.fullName}
                    </p>
                    {activeConv.listing && (
                      <Link
                        to={`/marketplace/${activeConv.listing.id}`}
                        className="text-xs text-green-700 hover:underline"
                      >
                        {activeConv.listing.title}
                      </Link>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {msgsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted" />
                </div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-muted py-8">
                  No messages yet — say hello!
                </p>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} isMine={isMine(msg)} />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 border-t border-border bg-white px-4 py-3 shrink-0"
            >
              <div className="flex flex-1 flex-col">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message… (Enter to send)"
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-green-500 max-h-32"
                  style={{
                    overflowY: text.split("\n").length > 3 ? "auto" : "hidden",
                  }}
                />
                {sendError && (
                  <p className="px-1 pt-1 text-xs text-red-500">{sendError}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white transition-opacity hover:bg-green-700 disabled:opacity-50"
                aria-label="Send message"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
