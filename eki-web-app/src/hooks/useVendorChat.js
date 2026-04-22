// ─────────────────────────────────────────────────────────────────────────────
// useVendorChat.js  —  FRONTEND WebSocket hook
// Place in:  src/hooks/useVendorChat.js
//
// Connects to Django Channels via WebSocket.
// All real-time chat state lives here — conversations, messages, typing, status.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";

// ── WebSocket URL ─────────────────────────────────────────────────────────────
// Set VITE_WS_HOST=api.yourapp.com in your .env for production.
// In dev it defaults to localhost (same host as the page).
const buildWsUrl = () => {
  const token    = localStorage.getItem("access_token") || "";
  const host     = import.meta.env.VITE_WS_HOST || window.location.host;
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${host}/ws/chat/?token=${token}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
const useVendorChat = () => {
  const [conversations, setConversations] = useState([]);
  const [messages,      setMessages]      = useState({});   // { conv_id: Message[] }
  const [typing,        setTyping]        = useState({});   // { conv_id: bool }
  const [wsStatus,      setWsStatus]      = useState("connecting"); // connecting | open | closed | error

  const wsRef          = useRef(null);
  const reconnectTimer = useRef(null);
  const reconnectDelay = useRef(1000); // ms, doubles on each failed attempt (max 30s)

  // ── Low-level send (only fires if socket is open) ─────────────────────────
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  // ── Connect / reconnect ───────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;
    setWsStatus("connecting");

    ws.onopen = () => {
      setWsStatus("open");
      reconnectDelay.current = 1000; // reset backoff on successful connect
    };

    // ── Handle every incoming message from Django Channels ──────────────────
    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data);

        switch (msg.type) {

          // Full list of conversations — sent by backend on first connect
          case "conversation_list":
            setConversations(msg.conversations ?? []);
            break;

          // One conversation changed (unread count, last message preview, etc.)
          case "conversation_update":
            setConversations((prev) =>
              prev.map((c) =>
                c.id === msg.conversation.id ? { ...c, ...msg.conversation } : c
              )
            );
            break;

          // History for a specific conversation — sent after load_history request
          case "chat_history":
            setMessages((prev) => ({
              ...prev,
              [msg.conversation_id]: msg.messages ?? [],
            }));
            break;

          // A new message arriving in real time
          case "chat_message": {
            const { conversation_id, message } = msg;
            setMessages((prev) => ({
              ...prev,
              [conversation_id]: [...(prev[conversation_id] ?? []), message],
            }));
            // Update the sidebar preview row
            setConversations((prev) =>
              prev.map((c) =>
                c.id === conversation_id
                  ? {
                      ...c,
                      last_message:      message.text,
                      last_message_time: message.timestamp,
                      unread_count:      message.is_mine
                        ? (c.unread_count ?? 0)
                        : (c.unread_count ?? 0) + 1,
                    }
                  : c
              )
            );
            break;
          }

          // Backend confirms a message was read
          case "message_read": {
            const { conversation_id, message_id } = msg;
            setMessages((prev) => ({
              ...prev,
              [conversation_id]: (prev[conversation_id] ?? []).map((m) =>
                m.id === message_id ? { ...m, is_read: true } : m
              ),
            }));
            break;
          }

          // Customer is typing (or stopped)
          case "typing":
            setTyping((prev) => ({
              ...prev,
              [msg.conversation_id]: msg.is_typing,
            }));
            break;

          // Customer came online / went offline
          case "online_status":
            setConversations((prev) =>
              prev.map((c) =>
                c.other_user_id === msg.user_id
                  ? { ...c, is_online: msg.is_online }
                  : c
              )
            );
            break;

          default:
            break;
        }
      } catch (e) {
        console.error("[useVendorChat] WS parse error:", e);
      }
    };

    ws.onerror = () => setWsStatus("error");

    // Reconnect with exponential backoff when connection drops
    ws.onclose = () => {
      setWsStatus("closed");
      const delay = Math.min(reconnectDelay.current, 30_000);
      reconnectDelay.current = delay * 2;
      reconnectTimer.current = setTimeout(connect, delay);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // ── Actions the UI calls ──────────────────────────────────────────────────

  /** Ask backend to send message history for a conversation */
  const requestHistory = useCallback(
    (conversationId) => send({ type: "load_history", conversation_id: conversationId }),
    [send]
  );

  /** Send a new chat message */
  const sendMessage = useCallback(
    (conversationId, text) =>
      send({ type: "send_message", conversation_id: conversationId, text }),
    [send]
  );

  /** Tell backend this message has been read */
  const markRead = useCallback(
    (conversationId, messageId) =>
      send({ type: "mark_read", conversation_id: conversationId, message_id: messageId }),
    [send]
  );

  /** Broadcast typing indicator (call with false to stop) */
  const sendTyping = useCallback(
    (conversationId, isTyping) =>
      send({ type: "typing", conversation_id: conversationId, is_typing: isTyping }),
    [send]
  );

  return {
    conversations,  // Conversation[]  — drives the left panel list
    messages,       // { [conv_id]: Message[] }  — drives the chat window
    typing,         // { [conv_id]: bool }  — drives the typing indicator
    wsStatus,       // "connecting" | "open" | "closed" | "error"
    sendMessage,
    markRead,
    sendTyping,
    requestHistory,
  };
};

export default useVendorChat;

// ─────────────────────────────────────────────────────────────────────────────
// DATA SHAPES  (for your teammate's reference — backend must match these)
// ─────────────────────────────────────────────────────────────────────────────
//
// Conversation:
// {
//   id:                 string | number,
//   other_user_id:      string | number,
//   other_user_name:    string,
//   other_user_avatar:  string | null,   // URL
//   last_message:       string | null,
//   last_message_time:  ISO8601 string | null,
//   unread_count:       number,
//   is_online:          bool,
//   order_ref:          string | null,   // e.g. "#EKI-8829"
// }
//
// Message:
// {
//   id:              string | number,
//   sender_id:       string | number,
//   sender_name:     string,
//   sender_avatar:   string | null,
//   text:            string,
//   timestamp:       ISO8601 string,
//   is_read:         bool,
//   is_mine:         bool,              // true if sent by the vendor
//   attachment_url:  string | null,
// }