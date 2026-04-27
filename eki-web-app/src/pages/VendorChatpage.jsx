import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Send, Paperclip, MoreVertical,
  File as FileIcon, X, Loader2, MessageCircle,
  Plus, Filter, CheckCheck, AlertCircle,
  Edit3, Trash2, Mic
} from 'lucide-react';
import api, { getVendorProfile, getImageUrl } from '../services/authService';
import Footer from '../components/Vendormanagement/VendorFooter';

const DEBUG_SENDER = false;

/* ── Resolve if a message was sent by the vendor ────────────────────────── */
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

const EMOJI_LIST = [
  '😀','😂','😍','🥰','😢','😡','👍','👎','🎉','❤️','🔥','⭐','🤝','🚀','✨','💯','🙏','👋','🤔','🥳'
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

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText,         setEditText]         = useState('');
  const [deleteConfirmId,  setDeleteConfirmId]  = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isRecording,   setIsRecording]   = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const recordingIntervalRef = useRef(null);

  const messagesEndRef   = useRef(null);
  const fileInputRef     = useRef(null);
  const inputRef         = useRef(null);
  const emojiBtnRef      = useRef(null);
  const selectedBuyerRef = useRef(null);
  const debugLoggedRef   = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  /* ── Fetch vendor profile ────────────────────────────────────────────── */
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

  /* ── Fetch conversations ─────────────────────────────────────────────── */
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

  /* ── Load messages ──────────────────────────────────────────────────── */
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

  /* ── Select conversation ─────────────────────────────────────────────── */
  const handleSelectConversation = useCallback(async (buyer) => {
    setSelectedBuyer(buyer);
    selectedBuyerRef.current = buyer;
    setMessages([]);
    setFetchError('');
    setSendError('');
    setInputValue('');
    setAttachmentFile(null);
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

  /* ── Send text only ────────────────────────────────────────────────── */
  const sendTextOnly = useCallback(async (textToSend) => {
    const text  = textToSend.trim();
    const buyer = selectedBuyerRef.current;
    if (!buyer || !text) return;
    setSendError('');
    setIsSending(true);
    const tempId     = `temp-text-${Date.now()}`;
    const optimistic = makeOptimisticMsg(tempId, text);
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(scrollToBottom, 50);
    try {
      const res = await api.post(`/chat/conversations/${buyer.id}/send/`, {
        message_type: 'text',
        message: text,
      });
      const rawData = res.data?.data ?? res.data;
      const realMsg = (rawData && typeof rawData === 'object')
        ? (normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false })
        : { ...optimistic, _optimistic: false };
      setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
      fetchConversations();
    } catch (err) {
      const backendMsg =
        err.response?.data?.message ??
        err.response?.data?.detail ??
        err.response?.data?.error ??
        (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to send.');
      setSendError(backendMsg);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [fetchConversations, scrollToBottom]);

  /* ── Send attachment (image, file, voice) ───────────────────────────── */
  const sendAttachment = useCallback(async (file) => {
    const buyer = selectedBuyerRef.current;
    if (!buyer || !file) return;
    setIsUploading(true);
    setSendError('');
    const tempId  = `temp-attach-${Date.now()}`;
    const msgType = file.type.startsWith('audio/') ? 'voice' :
                    file.type.startsWith('image/') ? 'image' : 'file';

    let optimistic;

    if (msgType === 'voice') {
      const localUrl = URL.createObjectURL(file);
      optimistic = makeOptimisticMsg(tempId, 'Voice message', 'voice', localUrl, 'voice_note');
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);

      try {
        // ★ Fake the MIME type to audio/mp4 so the server accepts it
        const audioFile = new File([file], file.name.replace(/\.webm$/, '.mp4'), {
          type: 'audio/mp4'
        });

        const form = new FormData();
        form.append('file', audioFile);
        form.append('file_type', 'voice');

        const uploadRes = await api.post('/chat/upload/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const relativeUrl = uploadRes.data.file_url;
        const absoluteUrl = getImageUrl(relativeUrl);

        const duration = Math.round(recordingTime);
        const res = await api.post('/chat/voice-note/', {
          conversation_id: buyer.id,
          voice_url: absoluteUrl,
          duration,
        });

        const rawData = res.data?.data ?? res.data;
        const realMsg = (rawData && typeof rawData === 'object')
          ? { ...(normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false }),
              type: 'voice',
              mediaUrl: absoluteUrl,
            }
          : { ...optimistic, _optimistic: false, type: 'voice', mediaUrl: localUrl };

        setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
        fetchConversations();
      } catch (err) {
        const backendMsg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          err.response?.data?.voice_url ??
          err.response?.data?.file ??
          (err.response?.data ? JSON.stringify(err.response.data) : 'Voice upload failed.');
        setSendError(backendMsg);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsUploading(false);
      }
    } else {
      optimistic = makeOptimisticMsg(tempId, file.name || 'Attachment', msgType, null, file.name);
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);

      try {
        const form = new FormData();
        form.append('file', file);
        form.append('file_type', msgType === 'image' ? 'image' : 'file');
        const uploadRes = await api.post('/chat/upload/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const absUrl = getImageUrl(uploadRes.data.file_url);
        const res = await api.post(`/chat/conversations/${buyer.id}/send/`, {
          message_type: msgType,
          media_url: absUrl,
          file_name: uploadRes.data.file_name || file.name,
          mime_type: uploadRes.data.mime_type || file.type,
        });

        const rawData = res.data?.data ?? res.data;
        const realMsg = (rawData && typeof rawData === 'object')
          ? (normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false })
          : { ...optimistic, _optimistic: false };

        setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
        fetchConversations();
      } catch (err) {
        const backendMsg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          err.response?.data?.error ??
          (err.response?.data ? JSON.stringify(err.response.data) : 'Failed to send.');
        setSendError(backendMsg);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsUploading(false);
      }
    }
  }, [fetchConversations, scrollToBottom, recordingTime]);

  /* ── Main send handler ──────────────────────────────────────────────── */
  const handleSendMessage = useCallback(async () => {
    const hasText = inputValue.trim().length > 0;
    const hasAttachment = !!attachmentFile;
    if (!hasText && !hasAttachment) return;
    if (isSending || isUploading) return;

    setSendError('');

    if (hasAttachment) {
      const file = attachmentFile;
      setAttachmentFile(null);
      await sendAttachment(file);
    }

    if (hasText) {
      const textToSend = inputValue;
      setInputValue('');
      await sendTextOnly(textToSend);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [inputValue, attachmentFile, isSending, isUploading, sendAttachment, sendTextOnly]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  /* ── Paperclip file change (immediate send) ─────────────────────────── */
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
    await sendAttachment(file);
    setAttachmentFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [sendAttachment]);

  /* ── Voice recording ────────────────────────────────────────────────── */
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const voiceFile = new Blob([audioBlob], { type: 'audio/webm' });
        voiceFile.name = `voice_note_${Date.now()}.webm`;
        setAttachmentFile(voiceFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access denied or not supported.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(recordingIntervalRef.current);
  }, []);

  /* ── Close emoji picker on outside click ───────────────────────────── */
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => {
      if (emojiBtnRef.current && !emojiBtnRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  /* ── Edit / Delete ────────────────────────────────────────────────── */
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
      alert('Failed to edit. Check backend endpoint.');
    }
  };

  const handleEditCancel = () => setEditingMessageId(null);

  const handleDeleteConfirm = (msgId) => setDeleteConfirmId(msgId);

  const handleDeleteExecute = async (msgId) => {
    try {
      await api.delete(`/chat/messages/${msgId}/delete/`);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setDeleteConfirmId(null);
    } catch (err) {
      alert('Failed to delete. Check backend endpoint.');
    }
  };

  const handleDeleteCancel = () => setDeleteConfirmId(null);

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
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch { return ''; }
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || '?';
  const orderRef    = selectedBuyer?.orderRef ? `ORDER #${selectedBuyer.orderRef}` : 'ACTIVE NOW';

  const extractAudioFromMessage = (msg) => {
    if (msg.type === 'voice' && msg.mediaUrl) return msg;
    const text = msg.text || '';
    const match = text.match(/<audio[^>]+src="([^"]+)"/);
    if (match) {
      return { ...msg, type: 'voice', mediaUrl: match[1] };
    }
    return msg;
  };

  return (
    <div
      style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
      className="flex h-[calc(100vh-2rem)] w-full rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-200 relative"
    >
      {/* LEFT SIDEBAR */}
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

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#fafafa]">
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
                <div className="flex justify-center my-4">
                  <span className="text-[11px] text-gray-400 font-medium bg-white px-3 py-0.5 rounded-full shadow-sm border border-gray-100">
                    {formatDateSep(group.date)}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.msgs.map((msg, idx) => {
                    const processedMsg = extractAudioFromMessage(msg);
                    const isVendor     = processedMsg.sender === 'vendor';
                    const isOptimistic = processedMsg._optimistic === true;
                    const isEditing    = editingMessageId === processedMsg.id;
                    const isDeletingConfirm = deleteConfirmId === processedMsg.id;

                    return (
                      <div
                        key={processedMsg.id ?? idx}
                        className={`flex items-end gap-2 ${isVendor ? 'justify-end' : 'justify-start'} relative group`}
                      >
                        {!isVendor && (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#EFB034] to-[#c8891f] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 overflow-hidden shadow-sm">
                            {selectedBuyer?.avatar
                              ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" />
                              : getInitials(selectedBuyer?.name)
                            }
                          </div>
                        )}

                        <div className={`max-w-[60%] flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                          {isVendor && !isOptimistic && (
                            <div className={`mb-1 flex items-center gap-1 transition-opacity duration-150 ${
                              isEditing || isDeletingConfirm ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <button onClick={(e) => { e.stopPropagation(); handleEditStart(processedMsg); }} className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit message"><Edit3 size={13} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(processedMsg.id); }} className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete message"><Trash2 size={13} /></button>
                            </div>
                          )}

                          {isDeletingConfirm && (
                            <div className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] text-gray-700 mb-1 shadow-sm flex items-center gap-2">
                              <span>Delete this message?</span>
                              <button onClick={() => handleDeleteExecute(processedMsg.id)} className="text-red-600 font-bold hover:underline">Delete</button>
                              <button onClick={handleDeleteCancel} className="text-gray-400 hover:text-gray-600">Cancel</button>
                            </div>
                          )}

                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }} className="px-3 py-1.5 bg-white border border-[#125852] rounded-xl text-[13.5px] outline-none focus:ring-1 focus:ring-[#125852] shadow-sm w-full min-w-[200px]" autoFocus />
                              <button onClick={handleEditSave} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save"><CheckCheck size={16} /></button>
                              <button onClick={handleEditCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Cancel"><X size={16} /></button>
                            </div>
                          ) : (
                            <div className={`px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm ${
                              isVendor
                                ? `bg-[#125852] text-white rounded-br-sm ${isOptimistic ? 'opacity-70' : ''}`
                                : 'bg-[#EFB034] text-white rounded-bl-sm border border-[#d4952c]/30'
                            }`}>
                              {processedMsg.type === 'voice' ? (
                                <audio controls src={processedMsg.mediaUrl} className="max-w-full h-8" />
                              ) : processedMsg.type === 'image' ? (
                                <img src={processedMsg.mediaUrl} alt="attachment" className="rounded-lg max-w-full h-auto" />
                              ) : processedMsg.type === 'file' ? (
                                <a href={processedMsg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 underline">
                                  <FileIcon size={14} />{safeStr(processedMsg.fileName || processedMsg.text)}
                                </a>
                              ) : (
                                <p className="break-words whitespace-pre-wrap">{safeStr(processedMsg.text)}</p>
                              )}
                            </div>
                          )}

                          <div className={`flex items-center gap-1 mt-1 ${isVendor ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-gray-400">{formatTime(processedMsg.timestamp)}</span>
                            {isVendor && !isOptimistic && <CheckCheck size={12} className="text-[#EFB034]" />}
                            {isVendor && isOptimistic  && <Loader2 size={10} className="animate-spin text-gray-400" />}
                          </div>
                        </div>

                        {isVendor && (
                          <div className="w-7 h-7 rounded-full bg-[#125852] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 mb-0.5 shadow-sm overflow-hidden">
                            {vendorProfile.picture
                              ? <img src={vendorProfile.picture} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
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
            <AlertCircle size={13} className="flex-shrink-0" />
            <span className="flex-1">{sendError}</span>
            <button onClick={() => setSendError('')} className="hover:text-red-800"><X size={12} /></button>
          </div>
        )}

        {attachmentFile && (
          <div className="px-6 py-2 bg-white border-t border-gray-100 flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5 text-[12px] text-gray-600 flex-1 min-w-0">
              {attachmentFile.type.startsWith('audio') ? <Mic size={13} /> :
               attachmentFile.type.startsWith('image') ? <FileIcon size={13} /> : <FileIcon size={13} />}
              <span className="truncate max-w-[200px]">{attachmentFile.name}</span>
              {attachmentFile.type.startsWith('audio') && (
                <audio controls src={URL.createObjectURL(attachmentFile)} className="ml-2 h-8" />
              )}
              <button onClick={() => setAttachmentFile(null)} className="text-red-400 hover:text-red-600 ml-auto flex-shrink-0"><X size={13} /></button>
            </div>
            {isUploading && <Loader2 size={13} className="animate-spin text-gray-400" />}
          </div>
        )}

        {selectedBuyer && (
          <div className="px-5 py-3.5 bg-white border-t border-gray-100">
            {showEmojiPicker && (
              <div className="relative mb-2">
                <div className="absolute bottom-full left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-7 gap-1 max-w-[280px]">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => { setInputValue((prev) => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                      className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded">{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-[#125852]/30 focus-within:bg-white transition-all">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSending} className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0" title="Attach file">
                <Paperclip size={18} />
              </button>

              <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isUploading || isSending}
                className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#125852] hover:bg-gray-100'
                }`} title={isRecording ? 'Stop recording' : 'Record voice'}>
                <Mic size={18} />
              </button>
              {isRecording && (
                <span className="text-xs text-red-500 font-mono">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
              )}

              <button type="button" ref={emojiBtnRef} onClick={() => setShowEmojiPicker((prev) => !prev)} className="p-1.5 text-gray-400 hover:text-[#125852] rounded-full hover:bg-gray-100 transition-colors flex-shrink-0" title="Add emoji">
                😀
              </button>

              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Reply to ${selectedBuyer.name}…`} className="flex-1 bg-transparent text-[13.5px] text-gray-700 placeholder-gray-400 outline-none" />

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="*/*" />

              <button type="button" onClick={handleSendMessage} disabled={(!inputValue.trim() && !attachmentFile) || isSending || isUploading}
                className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                  (inputValue.trim() || attachmentFile) && !isSending && !isUploading
                    ? 'bg-[#EFB034] text-white hover:bg-[#d4952c] shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {isSending || isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
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