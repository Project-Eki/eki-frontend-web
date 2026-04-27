import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Send, Paperclip, MoreVertical,
  Image, File, X, Loader2, MessageCircle,
  Smile, Plus, Filter, CheckCheck, AlertCircle
} from 'lucide-react';
import api from '../services/authService';
import Footer from '../components/Vendormanagement/VendorFooter';

// ─── Helper: resolve sender role from any shape the backend might return ─────
const resolveIsVendorMessage = (msg) => {
  const vendorEmail = (localStorage.getItem('vendor_email') || '').toLowerCase().trim();
  const vendorId    = (localStorage.getItem('vendor_id') || '').trim();
  const vendorRole  = (localStorage.getItem('vendor_role') || '').toLowerCase().trim();

  if (msg.is_vendor === true)  return true;
  if (msg.is_vendor === false) return false;
  if (msg.sender_role === 'vendor') return true;
  if (msg.sender_role === 'buyer')  return false;

  const rawSender = msg.sender;

  if (rawSender === 'vendor') return true;
  if (rawSender === 'buyer')  return false;

  if (rawSender && typeof rawSender === 'object') {
    if (rawSender.role === 'vendor') return true;
    if (rawSender.role === 'buyer')  return false;
    const senderEmail = (rawSender.email || '').toLowerCase().trim();
    if (vendorEmail && senderEmail === vendorEmail) return true;
    const senderId = String(rawSender.id || '').trim();
    if (vendorId && senderId === vendorId) return true;
    return false;
  }

  if (typeof rawSender === 'string') {
    const s = rawSender.toLowerCase().trim();
    if (vendorEmail && s === vendorEmail) return true;
    if (vendorId && s === vendorId) return true;
  }

  if (vendorRole === 'vendor') return false;
  return false;
};

// ─── FIX: Normalize a raw message — safely extracts text, never passes an object to JSX ─────
const normalizeMessage = (msg) => {
  // Guard: skip null/non-object entries
  if (!msg || typeof msg !== 'object') return null;

  // FIX: prefer message_display (human-readable field the backend returns),
  // then message, then text/content — always coerce to string
  const rawText =
    msg.message_display ??
    msg.message ??
    msg.text ??
    msg.content ??
    '';

  // Ensure text is ALWAYS a string — never an object — prevents React error #31
  const text = typeof rawText === 'string'
    ? rawText
    : rawText !== null && rawText !== undefined
      ? String(rawText)
      : '';

  return {
    id: msg.id,
    text,
    sender: resolveIsVendorMessage(msg) ? 'vendor' : 'buyer',
    timestamp: msg.created_at || msg.timestamp || msg.sent_at || null,
    type: msg.message_type || msg.type || 'text',
    mediaUrl: msg.media_url || msg.media || msg.file_url || null,
    fileName: msg.file_name || null,
    mimeType: msg.mime_type || null,
  };
};

const VendorChatPage = () => {
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const selectedBuyerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Fetch conversation list ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      const mapped = list.map((conv) => ({
        id: conv.id,
        name:
          conv.buyer_name ??
          conv.buyer?.name ??
          conv.buyer?.full_name ??
          ([conv.buyer?.first_name, conv.buyer?.last_name].filter(Boolean).join(' ') || 'Buyer'),
        avatar: conv.buyer_avatar ?? conv.buyer?.profile_picture ?? null,
        lastSeen: conv.last_message_at
          ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        lastMessage: conv.last_message || conv.last_message_text || '',
        unread: conv.unread_count ?? conv._unread_count ?? 0,
        orderRef: conv.order?.order_number ?? conv.order_reference ?? '',
      }));
      setBuyers(mapped);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  // ── Fetch messages for a conversation ──────────────────────────────────────
  const loadMessages = useCallback(async (conversationId) => {

    // Strategy 1: standard detail endpoint GET /chat/conversations/{id}/
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/`, {
        params: { limit: 50, offset: 0 },
      });
      const data = res.data;
      const raw = Array.isArray(data.messages)
        ? data.messages
        : Array.isArray(data)
          ? data
          : [];
      console.log(`[chat] strategy 1 OK — ${raw.length} messages`);
      // FIX: filter(Boolean) removes any null entries from normalizeMessage
      return raw.slice().reverse().map(normalizeMessage).filter(Boolean);
    } catch (err1) {
      console.warn(`[chat] strategy 1 failed (${err1.response?.status}), trying strategy 2…`);
    }

    // Strategy 2: messages sub-route GET /chat/conversations/{id}/messages/
    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages/`, {
        params: { limit: 50, offset: 0 },
      });
      const data = res.data;
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.messages)
            ? data.messages
            : [];
      console.log(`[chat] strategy 2 OK — ${raw.length} messages`);
      // FIX: filter(Boolean) removes any null entries from normalizeMessage
      return raw.slice().reverse().map(normalizeMessage).filter(Boolean);
    } catch (err2) {
      console.warn(`[chat] strategy 2 failed (${err2.response?.status}), trying strategy 3…`);
    }

    // Strategy 3: paginated messages endpoint GET /chat/messages/?conversation={id}
    try {
      const res = await api.get('/chat/messages/', {
        params: { conversation: conversationId, limit: 50, offset: 0 },
      });
      const data = res.data;
      const raw = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.messages)
            ? data.messages
            : [];
      console.log(`[chat] strategy 3 OK — ${raw.length} messages`);
      // FIX: filter(Boolean) removes any null entries from normalizeMessage
      return raw.slice().reverse().map(normalizeMessage).filter(Boolean);
    } catch (err3) {
      console.warn(`[chat] all strategies failed (last: ${err3.response?.status}).`);
    }

    return null;
  }, []);

  // ── Select a conversation and load its messages ─────────────────────────────
  const handleSelectConversation = useCallback(async (buyer) => {
    setSelectedBuyer(buyer);
    selectedBuyerRef.current = buyer;
    setMessages([]);
    setFetchError('');
    setSendError('');
    setLoading(true);
    setInputValue('');

    const result = await loadMessages(buyer.id);

    if (result === null) {
      setFetchError(
        'Message history could not be loaded (server error). You can still send messages below.'
      );
      setMessages([]);
    } else {
      setMessages(result);
    }

    setLoading(false);
    setTimeout(scrollToBottom, 100);
  }, [loadMessages]);

  // ── Send a text message ─────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    const text = inputValue.trim();
    const buyer = selectedBuyerRef.current;
    if (!buyer || !text || isSending) return;

    setSendError('');
    setIsSending(true);

    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      text,
      sender: 'vendor',
      timestamp: new Date().toISOString(),
      type: 'text',
      mediaUrl: null,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue('');
    setTimeout(scrollToBottom, 50);

    try {
      const res = await api.post(`/chat/conversations/${buyer.id}/send/`, {
        message_type: 'text',
        message: text,
      });

      // FIX: normalizeMessage safely converts the API response; fallback to optimistic on bad shape
      const rawData = res.data?.data ?? res.data;
      const realMsg = rawData && typeof rawData === 'object'
        ? (normalizeMessage(rawData) ?? optimisticMsg)
        : optimisticMsg;

      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? { ...realMsg } : m))
      );

      fetchConversations();
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setSendError('Message failed to send. Please try again.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isSending, fetchConversations]);

  // ── Upload + send a file/image attachment ──────────────────────────────────
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    const buyer = selectedBuyerRef.current;
    if (!file || !buyer) return;

    setAttachmentFile(file);
    setIsUploading(true);
    setSendError('');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('file_type', file.type.startsWith('image/') ? 'image' : 'file');

      const uploadRes = await api.post('/chat/upload/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { file_url, file_name, file_size, mime_type } = uploadRes.data;
      const msgType = file.type.startsWith('image/') ? 'image' : 'file';

      const optimisticAttachment = {
        id: `temp-attach-${Date.now()}`,
        text: file_name || file.name,
        sender: 'vendor',
        timestamp: new Date().toISOString(),
        type: msgType,
        mediaUrl: file_url,
      };
      setMessages((prev) => [...prev, optimisticAttachment]);
      setTimeout(scrollToBottom, 50);

      const res = await api.post(`/chat/conversations/${buyer.id}/send/`, {
        message_type: msgType,
        media_url: file_url,
        file_name,
        file_size,
        mime_type,
      });

      // FIX: same safe normalizeMessage call here
      const rawData = res.data?.data ?? res.data;
      const realMsg = rawData && typeof rawData === 'object'
        ? (normalizeMessage(rawData) ?? optimisticAttachment)
        : optimisticAttachment;

      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticAttachment.id ? realMsg : m))
      );

      fetchConversations();
    } catch (err) {
      console.error('Failed to upload attachment:', err);
      setSendError('File upload failed. Please try again.');
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-attach-')));
    } finally {
      setAttachmentFile(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [fetchConversations]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const filteredBuyers = buyers.filter((b) => {
    const matchesSearch =
      !searchTerm.trim() ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.orderRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' && b.unread > 0);
    return matchesSearch && matchesTab;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (_) { return ''; }
  };

  const formatDateSeparator = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    } catch (_) { return ''; }
  };

  const groupedMessages = messages.reduce((groups, msg) => {
    const dateKey = msg.timestamp ? new Date(msg.timestamp).toDateString() : 'Unknown';
    if (!groups[dateKey]) groups[dateKey] = { date: msg.timestamp, msgs: [] };
    groups[dateKey].msgs.push(msg);
    return groups;
  }, {});

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';
  const selectedBuyerOrderRef = selectedBuyer?.orderRef
    ? `ORDER #${selectedBuyer.orderRef}`
    : 'ACTIVE NOW';

  // ── FIX: Safe text renderer — never lets an object reach JSX ────────────────
  const safeText = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    // If somehow an object slips through, show nothing rather than crash
    return '';
  };

  return (
    <div
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      className="flex h-[calc(100vh-2rem)] w-full rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200"
    >
      {/* ── LEFT SIDEBAR ── */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#125852] flex items-center justify-center">
              <MessageCircle size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-[15px]">Eki Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <Plus size={16} />
            </button>
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
              <Filter size={14} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Find messages or orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:border-[#125852]/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {['all', 'unread'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#125852] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredBuyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageCircle size={32} className="mb-2 opacity-30" />
              <p className="text-[13px]">No conversations</p>
            </div>
          ) : (
            filteredBuyers.map((buyer) => (
              <div
                key={buyer.id}
                onClick={() => handleSelectConversation(buyer)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 ${
                  selectedBuyer?.id === buyer.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden">
                    {buyer.avatar
                      ? <img src={buyer.avatar} alt="" className="w-full h-full object-cover" />
                      : getInitials(buyer.name)
                    }
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-[13px] font-semibold truncate ${buyer.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {buyer.name}
                    </span>
                    <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">{buyer.lastSeen}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-[12px] truncate ${buyer.unread > 0 ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                      {buyer.lastMessage || 'No messages yet'}
                    </p>
                    {buyer.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] bg-[#EFB034] rounded-full text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {buyer.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">

        {/* Chat Header */}
        {selectedBuyer ? (
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
                {selectedBuyer.avatar
                  ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" />
                  : getInitials(selectedBuyer.name)
                }
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">{selectedBuyer.name}</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">
                  {selectedBuyerOrderRef}
                </p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center px-6 py-3.5 bg-white border-b border-gray-100">
            <p className="text-[13px] text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}

        {/* Fetch error banner */}
        {fetchError && (
          <div className="flex items-center gap-2 px-5 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-[12px]">
            <AlertCircle size={13} className="flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-1">
          {loading ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`h-10 rounded-2xl ${i % 2 === 0 ? 'bg-[#125852]/20 w-2/5' : 'bg-gray-200 w-1/3'}`} />
                </div>
              ))}
            </div>
          ) : !selectedBuyer ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <MessageCircle size={56} className="mb-3 opacity-30" />
              <p className="text-[14px] font-medium">Select a conversation</p>
            </div>
          ) : messages.length === 0 && !fetchError ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={40} className="mb-2 opacity-30" />
              <p className="text-[13px]">No messages yet. Say hello!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, group]) => (
              <div key={dateKey}>
                {/* Date Separator */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 font-medium px-2 flex-shrink-0">
                    {formatDateSeparator(group.date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-2">
                  {group.msgs.map((msg, idx) => {
                    const isVendor = msg.sender === 'vendor';
                    const isTemp = String(msg.id).startsWith('temp-');

                    return (
                      <div
                        key={msg.id ?? idx}
                        className={`flex ${isVendor ? 'justify-end' : 'justify-start'} items-end gap-2`}
                      >
                        {/* Buyer avatar */}
                        {!isVendor && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 overflow-hidden shadow-sm">
                            {selectedBuyer?.avatar
                              ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" />
                              : getInitials(selectedBuyer?.name)
                            }
                          </div>
                        )}

                        <div className={`max-w-[60%] flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                            isVendor
                              ? `bg-[#125852] text-white rounded-br-sm ${isTemp ? 'opacity-70' : ''}`
                              : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                          }`}>
                            {msg.type === 'image' ? (
                              <img src={msg.mediaUrl} alt="attachment" className="rounded-lg max-w-full h-auto" />
                            ) : msg.type === 'file' ? (
                              <a
                                href={msg.mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 underline"
                              >
                                <File size={14} /> {safeText(msg.fileName || msg.text)}
                              </a>
                            ) : (
                              // FIX: safeText() guarantees a string — never an object — reaches JSX
                              <p className="break-words">{safeText(msg.text)}</p>
                            )}
                          </div>

                          <div className={`flex items-center gap-1 mt-1 ${isVendor ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                            {isVendor && !isTemp && <CheckCheck size={12} className="text-[#EFB034]" />}
                            {isVendor && isTemp && <Loader2 size={10} className="animate-spin text-gray-400" />}
                          </div>
                        </div>

                        {/* Vendor avatar */}
                        {isVendor && (
                          <div className="w-7 h-7 rounded-full bg-[#125852] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 shadow-sm">
                            {localStorage.getItem('vendor_first_name')?.charAt(0)?.toUpperCase() || 'V'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send error */}
        {sendError && (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-50 border-t border-red-100 text-red-600 text-[12px]">
            <AlertCircle size={13} className="flex-shrink-0" />
            <span>{sendError}</span>
            <button
              onClick={() => setSendError('')}
              className="ml-auto hover:text-red-800"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Attachment Preview */}
        {attachmentFile && (
          <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-[12px] text-gray-600">
              {attachmentFile.type.startsWith('image/') ? <Image size={13} /> : <File size={13} />}
              <span className="truncate max-w-[200px]">{attachmentFile.name}</span>
              <button onClick={() => setAttachmentFile(null)} className="text-red-400 hover:text-red-600 ml-1">
                <X size={13} />
              </button>
            </div>
            {isUploading && <Loader2 size={13} className="animate-spin text-gray-400" />}
          </div>
        )}

        {/* Input Bar */}
        {selectedBuyer && (
          <div className="px-5 py-3.5 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#125852]/30 focus-within:bg-white transition-all">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                disabled={isUploading}
              >
                <Paperclip size={18} />
              </button>

              <button className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                <Smile size={18} />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Reply to ${selectedBuyer.name}…`}
                className="flex-1 bg-transparent text-[13.5px] text-gray-700 placeholder-gray-400 outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              <button
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && !isUploading) || isSending}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                  inputValue.trim() && !isSending
                    ? 'bg-[#EFB034] text-white hover:bg-[#d4952c] shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSending
                  ? <Loader2 size={16} className="animate-spin" />
                  : <Send size={16} />
                }
              </button>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default VendorChatPage;