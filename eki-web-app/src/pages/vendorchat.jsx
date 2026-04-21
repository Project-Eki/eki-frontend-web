// ─────────────────────────────────────────────────────────────────────────────
// VendorChat.jsx
// Layout:  Navbar (full-width top) → below it: Left panel + Right panel
//          as ONE seamless surface, separated only by background color.
//          No footer. Fully responsive (mobile ↔ desktop).
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import {
  Search, Paperclip, Smile, Send, MoreVertical,
  Phone, Video, ChevronLeft, CheckCheck, Check,
  Wifi, WifiOff, Loader2, MessageSquare,
} from "lucide-react";

import Navbar3 from "../components/adminDashboard/Navbar4";
import { VendorProvider } from "../context/vendorContext";
import useVendorChat from "../hooks/useVendorChat";
import logo from "../assets/logo.jpeg";

// ─── Font ────────────────────────────────────────────────────────────────────
const FONT = "'Poppins', sans-serif";

// ─── Avatar ──────────────────────────────────────────────────────────────────
const PALETTE = [
  "#125852", "#EFB034", "#8B5CF6", "#EC4899",
  "#0EA5E9", "#F97316", "#10B981", "#EF4444",
];

const nameToColor = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const toInitials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const Avatar = ({ name = "", avatarUrl = null, size = "md", online = false }) => {
  const [imgErr, setImgErr] = useState(false);
  const dim = size === "sm" ? "w-9 h-9 text-[10px]" : "w-11 h-11 text-sm";
  return (
    <div className={`relative shrink-0 ${dim}`}>
      <div
        className="w-full h-full rounded-full overflow-hidden flex items-center justify-center font-semibold text-white"
        style={{ background: nameToColor(name), fontFamily: FONT }}
      >
        {avatarUrl && !imgErr
          ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
          : <span>{toInitials(name) || "?"}</span>
        }
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

// ─── Status pill ─────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const cfg = {
    open:       { icon: <Wifi size={9} />,    label: "Connected",    cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    connecting: { icon: <Loader2 size={9} className="animate-spin" />, label: "Connecting…", cls: "text-amber-700 bg-amber-50 border-amber-200" },
    closed:     { icon: <WifiOff size={9} />, label: "Reconnecting…",cls: "text-orange-700 bg-orange-50 border-orange-200" },
    error:      { icon: <WifiOff size={9} />, label: "Error",        cls: "text-red-700 bg-red-50 border-red-200" },
  };
  const s = cfg[status] ?? cfg.connecting;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-semibold ${s.cls}`} style={{ fontFamily: FONT }}>
      {s.icon} {s.label}
    </span>
  );
};

// ─── Time / date helpers ──────────────────────────────────────────────────────
const fmtTime = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return isNaN(d) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const fmtDay = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d)) return "";
  const diff = Math.floor((Date.now() - d) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
};

const groupByDate = (msgs = []) => {
  const out = [];
  let lastDay = null;
  msgs.forEach((m) => {
    const day = fmtDay(m.timestamp);
    if (day && day !== lastDay) {
      out.push({ _sep: true, label: day, key: `sep-${m.id}` });
      lastDay = day;
    }
    out.push(m);
  });
  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const VendorChat = () => {
  const {
    conversations, messages, typing, wsStatus,
    sendMessage, markRead, sendTyping, requestHistory,
  } = useVendorChat();

  const [activeConvId,   setActiveConvId]   = useState(null);
  const [input,          setInput]          = useState("");
  const [filter,         setFilter]         = useState("all");
  const [search,         setSearch]         = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const typingTimer    = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvId]);

  const selectConversation = (conv) => {
    setActiveConvId(conv.id);
    setShowMobileChat(true);
    if (!messages[conv.id]) requestHistory(conv.id);
    const lastUnread = [...(messages[conv.id] ?? [])].reverse().find((m) => !m.is_read && !m.is_mine);
    if (lastUnread) markRead(conv.id, lastUnread.id);
  };

  const activeConv     = conversations.find((c) => c.id === activeConvId) ?? null;
  const activeMessages = groupByDate(messages[activeConvId] ?? []);
  const isTyping       = typing[activeConvId] ?? false;

  const filteredConvs = conversations
    .filter((c) => filter === "unread" ? (c.unread_count ?? 0) > 0 : true)
    .filter((c) =>
      !search ||
      (c.other_user_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.last_message    ?? "").toLowerCase().includes(search.toLowerCase())
    );

  const handleSend = () => {
    if (!input.trim() || !activeConvId) return;
    sendMessage(activeConvId, input.trim());
    setInput("");
    sendTyping(activeConvId, false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeConvId) return;
    sendTyping(activeConvId, true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(activeConvId, false), 2_000);
  };

  return (
    <VendorProvider>
      {/*
        ROOT: horizontal flex, full viewport height, no scroll.
        LEFT  — white, full height, flush to top of screen, no outer margin.
        RIGHT — bg-[#ecece7], flex column: navbar on top, chat card below.
        A thin gap between left & right is created by padding on the right column.
      */}
      <div className="flex h-screen overflow-hidden bg-[#ecece7]" style={{ fontFamily: FONT }}>

        {/* ══════════════ LEFT PANEL ══════════════ */}
        <div className={`
          ${showMobileChat ? "hidden" : "flex"} md:flex flex-col
          w-full md:w-[288px] lg:w-[308px] xl:w-[328px] shrink-0
          h-full bg-white border-r border-slate-200
        `}>

          {/* Logo — sits at the very top, level with the navbar */}
          <div className="flex items-center px-5 h-[64px] border-b border-slate-100 shrink-0">
            <img src={logo} alt="Eki" className="h-8 w-auto object-contain" />
          </div>

          {/* Search + filters */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{ fontFamily: FONT }}>
                Conversations
              </p>
              <StatusPill status={wsStatus} />
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-9 pr-3 py-2 bg-[#ecece7] rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#125852]/20 transition"
                style={{ fontFamily: FONT }}
              />
            </div>

            <div className="flex gap-2">
              {["all", "unread"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-[#125852] text-white shadow-sm"
                      : "bg-[#ecece7] text-slate-500 hover:bg-slate-200"
                  }`}
                  style={{ fontFamily: FONT }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list — scrollable */}
          <div className="flex-1 overflow-y-auto">
            {wsStatus !== "open" && conversations.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin text-[#125852]" />
                <p className="text-xs font-medium" style={{ fontFamily: FONT }}>Connecting…</p>
              </div>
            )}

            {wsStatus === "open" && filteredConvs.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#ecece7] flex items-center justify-center">
                  <MessageSquare size={20} className="text-slate-400" />
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1" style={{ fontFamily: FONT }}>No conversations yet</p>
                <p className="text-[10px] text-slate-400" style={{ fontFamily: FONT }}>Customer messages will appear here</p>
              </div>
            )}

            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors ${
                  activeConvId === conv.id ? "bg-[#ecece7]" : "hover:bg-slate-50"
                }`}
              >
                <Avatar name={conv.other_user_name} avatarUrl={conv.other_user_avatar} size="sm" online={conv.is_online} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span
                      className={`text-xs truncate ${(conv.unread_count ?? 0) > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}
                      style={{ fontFamily: FONT }}
                    >
                      {conv.other_user_name ?? "Customer"}
                    </span>
                    <span className="text-[9px] text-slate-400 ml-2 shrink-0" style={{ fontFamily: FONT }}>
                      {fmtTime(conv.last_message_time)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-[10px] truncate ${(conv.unread_count ?? 0) > 0 ? "text-slate-600 font-medium" : "text-slate-400"}`}
                      style={{ fontFamily: FONT }}
                    >
                      {conv.last_message ?? "No messages yet"}
                    </p>
                    {(conv.unread_count ?? 0) > 0 && (
                      <span
                        className="ml-2 shrink-0 min-w-[18px] h-[18px] bg-[#125852] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1"
                        style={{ fontFamily: FONT }}
                      >
                        {conv.unread_count > 99 ? "99+" : conv.unread_count}
                      </span>
                    )}
                  </div>
                  {conv.order_ref && (
                    <span
                      className="mt-1 inline-block text-[9px] font-semibold text-[#125852] bg-emerald-50 px-2 py-0.5 rounded-full"
                      style={{ fontFamily: FONT }}
                    >
                      {conv.order_ref}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════
            Navbar sits at the top of THIS column only.
            Chat card fills the rest with padding so it
            floats and doesn't touch the left panel.
        ══════════════════════════════════════════ */}
        <div className={`
          ${!showMobileChat ? "hidden" : "flex"} md:flex
          flex-col flex-1 min-w-0 h-full
        `}>

          {/* Navbar — only spans the right column */}
          <Navbar3 />

          {/* Chat card — padded so it floats, pushed down with pt */}
          <div className="flex-1 min-h-0 px-4 pt-3 pb-5">
            <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col bg-[#ecece7]">

              {/* ── No active conversation ── */}
              {!activeConv && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/70 border border-white shadow-sm flex items-center justify-center">
                    <MessageSquare size={26} className="text-slate-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-600" style={{ fontFamily: FONT }}>Welcome to Eki Chat</p>
                    <p className="text-xs text-slate-400 mt-1" style={{ fontFamily: FONT }}>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}

              {/* ── Active conversation ── */}
              {activeConv && (
                <>
                  {/* Chat top bar */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-white/70 backdrop-blur-sm border-b border-white/80">
                  <div className="flex items-center gap-3">
                    {/* Mobile back */}
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-1.5 rounded-xl hover:bg-white text-slate-500 transition-colors"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <Avatar
                      name={activeConv.other_user_name}
                      avatarUrl={activeConv.other_user_avatar}
                      size="sm"
                      online={activeConv.is_online}
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-tight" style={{ fontFamily: FONT }}>
                        {activeConv.other_user_name ?? "Customer"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5" style={{ fontFamily: FONT }}>
                        {activeConv.is_online
                          ? <span className="text-emerald-600 font-semibold">● Online</span>
                          : "Offline"
                        }
                        {activeConv.order_ref && <span className="text-slate-400"> · {activeConv.order_ref}</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button className="p-2 rounded-xl hover:bg-white text-slate-500 transition-colors" title="Call">
                      <Phone size={16} />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white text-slate-500 transition-colors" title="Video">
                      <Video size={16} />
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white text-slate-500 transition-colors" title="More">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
                  {!messages[activeConvId] && (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                      <Loader2 size={20} className="animate-spin text-[#125852]" />
                      <p className="text-xs" style={{ fontFamily: FONT }}>Loading messages…</p>
                    </div>
                  )}

                  {messages[activeConvId]?.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                      <p className="text-xs font-semibold" style={{ fontFamily: FONT }}>No messages yet</p>
                      <p className="text-[10px]" style={{ fontFamily: FONT }}>Send the first message below</p>
                    </div>
                  )}

                  {activeMessages.map((item) => {
                    // Date separator
                    if (item._sep) {
                      return (
                        <div key={item.key} className="flex items-center justify-center my-4">
                          <span
                            className="text-[10px] text-slate-500 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm font-medium"
                            style={{ fontFamily: FONT }}
                          >
                            {item.label}
                          </span>
                        </div>
                      );
                    }

                    const isMine = item.is_mine ?? false;
                    return (
                      <div key={item.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                        {!isMine && (
                          <Avatar
                            name={item.sender_name ?? activeConv.other_user_name}
                            avatarUrl={item.sender_avatar ?? activeConv.other_user_avatar}
                            size="sm"
                          />
                        )}

                        <div className={`max-w-[72%] md:max-w-[60%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                          isMine
                            ? "bg-[#125852] text-white rounded-br-sm"
                            : "bg-white text-slate-800 rounded-bl-sm"
                        }`}>
                          {item.attachment_url && (
                            <a href={item.attachment_url} target="_blank" rel="noreferrer" className="block mb-2">
                              <img src={item.attachment_url} alt="attachment" className="rounded-xl max-h-48 object-cover w-full" />
                            </a>
                          )}

                          <p className="text-xs leading-relaxed break-words" style={{ fontFamily: FONT }}>
                            {item.text}
                          </p>

                          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                            <span
                              className={`text-[9px] ${isMine ? "text-white/60" : "text-slate-400"}`}
                              style={{ fontFamily: FONT }}
                            >
                              {fmtTime(item.timestamp)}
                            </span>
                            {isMine && (
                              item.is_read
                                ? <CheckCheck size={11} className="text-white/80" />
                                : <Check size={11} className="text-white/50" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-end gap-2 justify-start">
                      <Avatar name={activeConv.other_user_name} avatarUrl={activeConv.other_user_avatar} size="sm" />
                      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex gap-1 items-center">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input bar */}
                <div className="px-4 py-3 bg-white/70 backdrop-blur-sm border-t border-white/80">
                  <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-1.5 shadow-sm border border-slate-100">
                    <button
                      className="p-1.5 text-slate-400 hover:text-[#125852] rounded-xl transition-colors"
                      title="Attach file"
                    >
                      <Paperclip size={17} />
                    </button>
                    <button
                      className="p-1.5 text-slate-400 hover:text-[#EFB034] rounded-xl transition-colors"
                      title="Emoji"
                    >
                      <Smile size={17} />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      className="flex-1 py-1.5 text-xs bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
                      style={{ fontFamily: FONT }}
                    />

                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || wsStatus !== "open"}
                      className="p-2 text-white bg-[#125852] rounded-xl hover:bg-[#0d3e3a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      title="Send"
                    >
                      <Send size={15} />
                    </button>
                  </div>

                  {wsStatus !== "open" && (
                    <p className="text-[9px] text-center text-red-500 mt-2 font-medium" style={{ fontFamily: FONT }}>
                      Reconnecting — messages will send once connected
                    </p>
                  )}
                </div>
              </>
            )}

            </div>{/* end chat card */}
          </div>{/* end px/pt wrapper */}
        </div>{/* end right column */}
      </div>{/* end root */}
    </VendorProvider>
  );
};

export default VendorChat;