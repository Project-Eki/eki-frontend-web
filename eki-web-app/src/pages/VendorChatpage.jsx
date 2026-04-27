import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Send, Paperclip, MoreVertical,
  Image, File, X, Loader2, MessageCircle,
  Smile, Plus, Filter, CheckCheck, AlertCircle,
  Edit3, Trash2, Camera
} from 'lucide-react';
import api, { getVendorProfile } from '../services/authService';
import Footer from '../components/Vendormanagement/VendorFooter';

const DEBUG_SENDER = false; // Debug panel off

// ── Resolve if a message was sent by the vendor ──────────────────────────────
const resolveIsVendorMessage = (msg) => {
  const vendorEmail  = (localStorage.getItem('vendor_email')    || '').toLowerCase().trim();
  const vendorId     = (localStorage.getItem('vendor_id')       || '').trim();
  const vendorUserId = (localStorage.getItem('vendor_user_id')  || '').trim();

  if (msg.is_vendor  === true)  return true;
  if (msg.is_vendor  === false) return false;
  if (msg.is_seller  === true)  return true;
  if (msg.is_seller  === false) return false;
  if (msg.is_buyer   === true)  return false;
  if (msg.is_buyer   === false) return true;

  if (msg.direction === 'outgoing') return true;
  if (msg.direction === 'incoming') return false;

  const roleFields = [
    msg.sender_role, msg.sender_type, msg.user_type,
    msg.sent_by,     msg.role,        msg.type_of_sender,
  ];
  for (const f of roleFields) {
    if (!f || typeof f !== 'string') continue;
    const v = f.toLowerCase().trim();
    if (v === 'vendor' || v === 'seller' || v === 'shop') return true;
    if (v === 'buyer'  || v === 'customer' || v === 'user') return false;
  }

  const rawSender = msg.sender;
  if (typeof rawSender === 'string') {
    const s = rawSender.toLowerCase().trim();
    if (s === 'vendor' || s === 'seller') return true;
    if (s === 'buyer'  || s === 'customer') return false;
    if (vendorEmail  && s === vendorEmail)  return true;
    if (vendorId     && s === vendorId)     return true;
    if (vendorUserId && s === vendorUserId) return true;
  }

  if (rawSender && typeof rawSender === 'object') {
    const sr = (rawSender.role || rawSender.user_type || rawSender.type || '').toLowerCase();
    if (sr === 'vendor' || sr === 'seller') return true;
    if (sr === 'buyer'  || sr === 'customer') return false;

    const senderEmail = (rawSender.email || '').toLowerCase().trim();
    if (vendorEmail && senderEmail === vendorEmail) return true;

    const senderId = String(rawSender.id || rawSender.user_id || rawSender.pk || '').trim();
    if (vendorId     && senderId === vendorId)     return true;
    if (vendorUserId && senderId === vendorUserId) return true;

    if (rawSender.is_vendor === true || rawSender.is_staff === true) return true;
    if (rawSender.is_buyer  === true) return false;
    return false;
  }

  const topSenderId = String(msg.sender_id || msg.sender_user_id || msg.user_id || '').trim();
  if (vendorId     && topSenderId === vendorId)     return true;
  if (vendorUserId && topSenderId === vendorUserId) return true;

  const topSenderEmail = (msg.sender_email || msg.from_email || '').toLowerCase().trim();
  if (vendorEmail && topSenderEmail === vendorEmail) return true;

  return false;
};

const safeStr = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string')  return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
};

const normalizeMessage = (msg, forceSender = null) => {
  if (!msg || typeof msg !== 'object') return null;
  const rawText =
    msg.message_display ?? msg.message ?? msg.text ?? msg.content ?? '';
  const text     = safeStr(rawText);
  const isVendor = forceSender !== null
    ? forceSender === 'vendor'
    : resolveIsVendorMessage(msg);
  return {
    id:          msg.id,
    text,
    sender:      isVendor ? 'vendor' : 'buyer',
    timestamp:   msg.created_at || msg.timestamp || msg.sent_at || null,
    type:        msg.message_type || msg.type || 'text',
    mediaUrl:    msg.media_url || msg.media || msg.file_url || null,
    fileName:    msg.file_name || null,
    mimeType:    msg.mime_type || null,
    _optimistic: false,
  };
};

const makeOptimisticMsg = (id, text, type = 'text', mediaUrl = null, fileName = null) => ({
  id,
  text:        safeStr(text),
  sender:      'vendor',
  timestamp:   new Date().toISOString(),
  type,
  mediaUrl,
  fileName,
  mimeType:    null,
  _optimistic: true,
});

// ─── Emoji data ──────────────────────────────────────────────────────────────
const EMOJI_LIST = [
  '😀','😃','😄','😁','😅','😂','🤣','😊','😇','🙂','😉','😌','😍','🥰','😘','😗','😋','😛','😜','🤪','😝','🤑',
  '🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮','😯','😲','😳','🥺','😢','😭','😱','😖',
  '😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖',
  '😺','😸','😹','😻','😼','😽','🙀','😿','😾','🙈','🙉','🙊','💋','💌','💘','💝','💖','💗','💓','💞','💕','💟',
  '❤️','🔥','⭐','🌟','✨','💥','💯','💢','💨','💦','💤','🕳️','🎉','🎊','🎈','🎂','🎁','🏆','🏅','🎖️','🏵️',
  '👍','👎','👏','🙌','🤝','🤜','🤛','✊','👊','💪','🤞','✌️','🤟','🤘','👌','🤌','🤏','👈','👉','👆','👇','☝️',
  '✋','🤚','🖐️','🖖','👋','🤙','💅','🤳','💃','🕺','👯','👫','👬','👭','🧑‍🤝‍🧑','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧',
  '👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦','👨‍👨‍👧‍👧','👩‍👦','👩‍👧','👩‍👧‍👦','👩‍👦‍👦','👩‍👧‍👧',
  '👨‍👦','👨‍👧','👨‍👧‍👦','👨‍👦‍👦','👨‍👧‍👧','🪢','🧶','🧵','🪡','🧥','🥼','🦺','👚','👕','👖','🩲','🩳','👔','👗','👙',
  '👘','🥻','🩱','🩴','👠','👡','👢','👞','👟','🥿','🧢','👒','🎩','🎓','👑','⛑️','🪖','💄','💍','💎'
];

const VendorChatPage = () => {
  const [buyers,         setBuyers]         = useState([]);
  const [selectedBuyer,  setSelectedBuyer]  = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [sendError,      setSendError]      = useState('');
  const [fetchError,     setFetchError]     = useState('');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isUploading,    setIsUploading]    = useState(false);
  const [isSending,      setIsSending]      = useState(false);
  const [activeTab,      setActiveTab]      = useState('all');
  const [inputValue,     setInputValue]     = useState('');
  const [vendorProfile,  setVendorProfile]  = useState({ name: '', picture: null, initial: 'V' });
  const [debugInfo,      setDebugInfo]      = useState(null);

  // Edit / Delete states
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText,         setEditText]         = useState('');
  const [deleteConfirmId,  setDeleteConfirmId]  = useState(null);

  // Emoji picker state
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Refs
  const messagesEndRef   = useRef(null);
  const fileInputRef     = useRef(null);
  const imageInputRef    = useRef(null); // dedicated image input
  const inputRef         = useRef(null);
  const selectedBuyerRef = useRef(null);
  const debugLoggedRef   = useRef(false);
  const emojiPanelRef    = useRef(null);   // to handle outside click

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // ── Fetch vendor profile ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res      = await getVendorProfile();
        const fullName = [res.first_name, res.last_name].filter(Boolean).join(' ').trim();
        const initial  = (res.first_name || res.last_name || 'V').charAt(0).toUpperCase();
        const picture  = res.profile_picture || null;
        setVendorProfile({ name: fullName, picture, initial });
        if (res.first_name) localStorage.setItem('vendor_first_name', res.first_name);
        if (picture)        localStorage.setItem('vendor_profile_picture', picture);
        if (res.id)         localStorage.setItem('vendor_user_id', String(res.id));
        if (res.user_id)    localStorage.setItem('vendor_user_id', String(res.user_id));
        if (res.email)      localStorage.setItem('vendor_email', res.email);
      } catch {
        const firstName = localStorage.getItem('vendor_first_name') || 'V';
        const picture   = localStorage.getItem('vendor_profile_picture') || null;
        setVendorProfile({ name: firstName, picture, initial: firstName.charAt(0).toUpperCase() });
      }
    };
    load();
  }, []);

  // ── Fetch conversations ─────────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res  = await api.get('/chat/conversations/');
      const list = Array.isArray(res.data) ? res.data : (res.data?.results ?? []);
      setBuyers(list.map((conv) => ({
        id:          conv.id,
        name:
          conv.buyer_name ??
          conv.buyer?.name ??
          conv.buyer?.full_name ??
          ([conv.buyer?.first_name, conv.buyer?.last_name].filter(Boolean).join(' ') || 'Buyer'),
        avatar:      conv.buyer_avatar ?? conv.buyer?.profile_picture ?? null,
        lastSeen:    conv.last_message_at
          ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        lastMessage: conv.last_message || conv.last_message_text || '',
        unread:      conv.unread_count ?? conv._unread_count ?? 0,
        orderRef:    conv.order?.order_number ?? conv.order_reference ?? '',
      })));
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  // ── Load messages ─────────────────────────────────────────────────────────
  const loadMessages = useCallback(async (conversationId) => {
    const toNorm = (raw) => {
      if (DEBUG_SENDER && raw.length > 0 && !debugLoggedRef.current) {
        debugLoggedRef.current = true;
        const s = raw[0];
        const info = {
          raw_keys:          Object.keys(s).join(', '),
          sender:            s.sender,
          sender_role:       s.sender_role,
          sender_type:       s.sender_type,
          is_vendor:         s.is_vendor,
          is_buyer:          s.is_buyer,
          is_seller:         s.is_seller,
          direction:         s.direction,
          sent_by:           s.sent_by,
          user_type:         s.user_type,
          sender_id:         s.sender_id,
          sender_email:      s.sender_email,
          '— localStorage —': '———',
          vendor_email_ls:   localStorage.getItem('vendor_email'),
          vendor_id_ls:      localStorage.getItem('vendor_id'),
          vendor_user_id_ls: localStorage.getItem('vendor_user_id'),
          '— RESULT —':      '———',
          resolved_as:       resolveIsVendorMessage(s) ? '✅ VENDOR (right side)' : '❌ BUYER (left side)',
        };
        console.table(info);
        setDebugInfo(info);
      }
      return raw.slice().reverse().map((m) => normalizeMessage(m)).filter(Boolean);
    };

    try {
      const res = await api.get(`/chat/conversations/${conversationId}/`, { params: { limit: 50, offset: 0 } });
      const raw = Array.isArray(res.data.messages) ? res.data.messages : Array.isArray(res.data) ? res.data : [];
      if (raw.length) return toNorm(raw);
    } catch { console.warn('[chat] strategy 1 failed'); }

    try {
      const res = await api.get(`/chat/conversations/${conversationId}/messages/`, { params: { limit: 50, offset: 0 } });
      const d   = res.data;
      const raw = Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : Array.isArray(d?.messages) ? d.messages : [];
      if (raw.length) return toNorm(raw);
    } catch { console.warn('[chat] strategy 2 failed'); }

    try {
      const res = await api.get('/chat/messages/', { params: { conversation: conversationId, limit: 50, offset: 0 } });
      const d   = res.data;
      const raw = Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : Array.isArray(d?.messages) ? d.messages : [];
      return toNorm(raw);
    } catch { console.warn('[chat] all strategies failed'); }

    return null;
  }, []);

  // ── Select conversation ─────────────────────────────────────────────────────
  const handleSelectConversation = useCallback(async (buyer) => {
    setSelectedBuyer(buyer);
    selectedBuyerRef.current = buyer;
    setMessages([]);
    setFetchError('');
    setSendError('');
    setInputValue('');
    setDebugInfo(null);
    debugLoggedRef.current = false;
    setEditingMessageId(null);
    setDeleteConfirmId(null);
    setLoading(true);
    const result = await loadMessages(buyer.id);
    if (result === null) {
      setFetchError('Message history could not be loaded. You can still send messages below.');
    } else {
      setMessages(result);
    }
    setLoading(false);
    setTimeout(scrollToBottom, 100);
  }, [loadMessages, scrollToBottom]);

  // ── Send text ───────────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async () => {
    const text  = inputValue.trim();
    const buyer = selectedBuyerRef.current;
    if (!buyer || !text || isSending) return;
    setSendError('');
    setIsSending(true);
    const tempId     = `temp-${Date.now()}`;
    const optimistic = makeOptimisticMsg(tempId, text);
    setMessages((prev) => [...prev, optimistic]);
    setInputValue('');
    setTimeout(scrollToBottom, 50);
    try {
      const res     = await api.post(`/chat/conversations/${buyer.id}/send/`, { message_type: 'text', message: text });
      const rawData = res.data?.data ?? res.data;
      const realMsg = (rawData && typeof rawData === 'object')
        ? (normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false })
        : { ...optimistic, _optimistic: false };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
      fetchConversations();
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setSendError('Message failed to send. Please try again.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [inputValue, isSending, fetchConversations, scrollToBottom]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  // ── File upload (used by both paperclip and camera buttons) ─────────────
  const handleFileChange = useCallback(async (e) => {
    const file  = e.target.files?.[0];
    const buyer = selectedBuyerRef.current;
    if (!file || !buyer) return;
    setAttachmentFile(file);
    setIsUploading(true);
    setSendError('');
    const tempId  = `temp-attach-${Date.now()}`;
    const msgType = file.type.startsWith('image/') ? 'image' : 'file';
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('file_type', msgType);
      const uploadRes = await api.post('/chat/upload/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { file_url, file_name, file_size, mime_type } = uploadRes.data;
      const optimistic = makeOptimisticMsg(tempId, file_name || file.name, msgType, file_url, file_name || file.name);
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);
      const res     = await api.post(`/chat/conversations/${buyer.id}/send/`, { message_type: msgType, media_url: file_url, file_name, file_size, mime_type });
      const rawData = res.data?.data ?? res.data;
      const realMsg = (rawData && typeof rawData === 'object')
        ? (normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false })
        : { ...optimistic, _optimistic: false };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
      fetchConversations();
    } catch {
      setSendError('File upload failed. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setAttachmentFile(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }, [fetchConversations, scrollToBottom]);

  // ── Edit message ─────────────────────────────────────────────────────────
  const handleEditStart = (msg) => {
    setEditingMessageId(msg.id);
    setEditText(msg.text);
  };

  const handleEditSave = async () => {
    const id = editingMessageId;
    if (!id || !editText.trim()) return;

    try {
      await api.patch(`/chat/messages/${id}/edit/`, { message: editText.trim() });
      setMessages((prev) => prev.map((m) => {
        if (m.id === id) return { ...m, text: editText.trim() };
        return m;
      }));
      setEditingMessageId(null);
    } catch (err) {
      alert('Failed to edit message. Check backend endpoint.');
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
  };

  // ── Delete message ──────────────────────────────────────────────────────
  const handleDeleteConfirm = (msgId) => {
    setDeleteConfirmId(msgId);
  };

  const handleDeleteExecute = async (msgId) => {
    try {
      await api.delete(`/chat/messages/${msgId}/delete/`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete message. Check backend endpoint.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  // ── Emoji picker handlers ────────────────────────────────────────────────
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onEmojiSelect = (emoji) => {
    setInputValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPanelRef.current && !emojiPanelRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const filteredBuyers = buyers.filter((b) => {
    const matchSearch = !searchTerm.trim()
      || b.name.toLowerCase().includes(searchTerm.toLowerCase())
      || b.orderRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTab = activeTab === 'all' || (activeTab === 'unread' && b.unread > 0);
    return matchSearch && matchTab;
  });

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = msg.timestamp ? new Date(msg.timestamp).toDateString() : 'Unknown';
    if (!acc[key]) acc[key] = { date: msg.timestamp, msgs: [] };
    acc[key].msgs.push(msg);
    return acc;
  }, {});

  const formatTime = (ts) => {
    if (!ts) return '';
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const formatDateSep = (ts) => {
    if (!ts) return '';
    try {
      const d = new Date(ts), today = new Date(), yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (d.toDateString() === today.toDateString())     return 'Today';
      if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    } catch { return ''; }
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';
  const orderRef    = selectedBuyer?.orderRef ? `ORDER #${selectedBuyer.orderRef}` : 'ACTIVE NOW';

  return (
    <div
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      className="flex h-[calc(100vh-2rem)] w-full rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200"
    >
      {/* ═══════════════════════ LEFT SIDEBAR ═══════════════════════ */}
      <div className="w-72 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#125852] flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageCircle size={14} className="text-white" />
            </div>
            <span className="font-bold text-gray-800 text-[15px]">Eki Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"><Plus size={16} /></button>
            <button className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"><Filter size={14} /></button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Find messages or orders..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 placeholder-gray-400 outline-none focus:border-[#125852]/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex gap-2 px-4 pb-3">
          {['all', 'unread'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-[13px] font-semibold transition-all capitalize ${
                activeTab === tab ? 'bg-[#125852] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}>{tab}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredBuyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageCircle size={32} className="mb-2 opacity-30" />
              <p className="text-[13px]">No conversations</p>
            </div>
          ) : filteredBuyers.map((buyer) => (
            <div key={buyer.id} onClick={() => handleSelectConversation(buyer)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 ${
                selectedBuyer?.id === buyer.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'
              }`}>
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white font-bold text-base shadow-sm overflow-hidden">
                  {buyer.avatar ? <img src={buyer.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(buyer.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-semibold truncate ${buyer.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{buyer.name}</span>
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
          ))}
        </div>
      </div>

      {/* ═══════════════════════ MAIN CHAT ═══════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">

        {/* ── Chat header (buyer info only) ── */}
        {selectedBuyer ? (
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-sm">
                {selectedBuyer.avatar ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(selectedBuyer.name)}
              </div>
              <div>
                <p className="text-[14px] font-bold text-gray-900 leading-tight">{selectedBuyer.name}</p>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide leading-tight">{orderRef}</p>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={16} className="text-gray-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-gray-100">
            <p className="text-[13px] text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}

        {fetchError && (
          <div className="flex items-center gap-2 px-5 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-[12px]">
            <AlertCircle size={13} className="flex-shrink-0" /><span>{fetchError}</span>
          </div>
        )}

        {/* ── DEBUG PANEL (hidden) ── */}
        {DEBUG_SENDER && debugInfo && (
          <div className="mx-4 mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-xl text-[10px] font-mono text-yellow-900 overflow-x-auto flex-shrink-0">
            {/* ... debug ... */}
          </div>
        )}

        {/* ── Message area ── */}
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
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-[11px] text-gray-400 font-medium px-2 flex-shrink-0">{formatDateSep(group.date)}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-2">
                  {group.msgs.map((msg, idx) => {
                    const isVendor     = msg.sender === 'vendor';
                    const isOptimistic = msg._optimistic === true;
                    const isEditing    = editingMessageId === msg.id;
                    const isDeletingConfirm = deleteConfirmId === msg.id;

                    return (
                      <div
                        key={msg.id ?? idx}
                        className={`flex items-end gap-2 ${isVendor ? 'justify-end' : 'justify-start'} relative group`}
                      >
                        {/* Buyer avatar — LEFT only */}
                        {!isVendor && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 overflow-hidden shadow-sm">
                            {selectedBuyer?.avatar
                              ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" />
                              : getInitials(selectedBuyer?.name)
                            }
                          </div>
                        )}

                        {/* Bubble & edit/delete overlay */}
                        <div className={`max-w-[60%] flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                          {/* Hover edit/delete menu (vendor messages only) */}
                          {isVendor && !isOptimistic && (
                            <div className={`mb-1 flex items-center gap-1 transition-opacity duration-150 ${
                              isEditing || isDeletingConfirm ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleEditStart(msg); }}
                                className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Edit message"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(msg.id); }}
                                className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Delete message"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}

                          {/* Delete confirmation bar */}
                          {isDeletingConfirm && (
                            <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 mb-1 shadow-sm flex items-center gap-2">
                              <span>Delete this message?</span>
                              <button onClick={() => handleDeleteExecute(msg.id)} className="text-red-600 font-bold hover:underline">Delete</button>
                              <button onClick={handleDeleteCancel} className="text-gray-400 hover:text-gray-600">Cancel</button>
                            </div>
                          )}

                          {/* Message content */}
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                                className="px-3 py-1.5 bg-white border border-[#125852] rounded-xl text-[13.5px] outline-none focus:ring-1 focus:ring-[#125852] shadow-sm w-full min-w-[200px]"
                                autoFocus
                              />
                              <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save"><CheckCheck size={16} /></button>
                              <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancel"><X size={16} /></button>
                            </div>
                          ) : (
                            <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                              isVendor
                                ? `bg-[#125852] text-white rounded-br-sm ${isOptimistic ? 'opacity-70' : ''}`
                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                            }`}>
                              {msg.type === 'image' ? (
                                <img src={msg.mediaUrl} alt="attachment" className="rounded-lg max-w-full h-auto" />
                              ) : msg.type === 'file' ? (
                                <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                                  <File size={14} />{safeStr(msg.fileName || msg.text)}
                                </a>
                              ) : (
                                <p className="break-words whitespace-pre-wrap">{safeStr(msg.text)}</p>
                              )}
                            </div>
                          )}

                          <div className={`flex items-center gap-1 mt-1 ${isVendor ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                            {isVendor && !isOptimistic && <CheckCheck size={12} className="text-[#EFB034]" />}
                            {isVendor && isOptimistic  && <Loader2 size={10} className="animate-spin text-gray-400" />}
                          </div>
                        </div>

                        {/* Vendor avatar — RIGHT only */}
                        {isVendor && (
                          <div className="w-7 h-7 rounded-full bg-[#125852] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 shadow-sm overflow-hidden">
                            {vendorProfile.picture
                              ? <img src={vendorProfile.picture} alt="" className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }} />
                              : vendorProfile.initial
                            }
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

        {sendError && (
          <div className="flex items-center gap-2 px-5 py-2 bg-red-50 border-t border-red-100 text-red-600 text-[12px]">
            <AlertCircle size={13} className="flex-shrink-0" /><span>{sendError}</span>
            <button onClick={() => setSendError('')} className="ml-auto hover:text-red-800"><X size={12} /></button>
          </div>
        )}

        {attachmentFile && (
          <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-[12px] text-gray-600">
              {attachmentFile.type.startsWith('image/') ? <Image size={13} /> : <File size={13} />}
              <span className="truncate max-w-[200px]">{attachmentFile.name}</span>
              <button onClick={() => setAttachmentFile(null)} className="text-red-400 hover:text-red-600 ml-1"><X size={13} /></button>
            </div>
            {isUploading && <Loader2 size={13} className="animate-spin text-gray-400" />}
          </div>
        )}

        {/* ── Emoji Picker ── */}
        {selectedBuyer && showEmojiPicker && (
          <div
            ref={emojiPanelRef}
            className="absolute bottom-[80px] left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 w-[380px] max-w-[95vw] grid grid-cols-10 gap-1.5 overflow-y-auto max-h-[240px] z-50"
            style={{ bottom: '85px', left: '50%', transform: 'translateX(-50%)' }}
          >
            {EMOJI_LIST.map((emoji, index) => (
              <button
                key={index}
                onClick={() => onEmojiSelect(emoji)}
                className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-lg text-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* ── Message input area ── */}
        {selectedBuyer && (
          <div className="px-5 py-3.5 bg-white border-t border-gray-100 relative">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#125852]/30 focus-within:bg-white transition-all">
              {/* Emoji button */}
              <button
                type="button"
                onClick={toggleEmojiPicker}
                className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Smile size={18} />
              </button>

              {/* Image upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading}
                className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Camera size={18} />
              </button>

              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <Paperclip size={18} />
              </button>

              <input ref={inputRef} type="text" value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Reply to ${selectedBuyer.name}…`}
                className="flex-1 bg-transparent text-[13.5px] text-gray-700 placeholder-gray-400 outline-none"
              />

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="*/*"
              />
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />

              <button type="button" onClick={handleSendMessage} disabled={!inputValue.trim() || isSending}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                  inputValue.trim() && !isSending
                    ? 'bg-[#EFB034] text-white hover:bg-[#d4952c] shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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