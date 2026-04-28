import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search, Send, Paperclip, MoreVertical,
  File as FileIcon, X, Loader2, MessageCircle,
  Plus, Filter, CheckCheck, AlertCircle,
  Edit3, Trash2, Mic, Video, MapPin, Camera,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { getVendorProfile, getImageUrl } from '../services/authService';
import Footer from '../components/Vendormanagement/VendorFooter';
import ekiLogo from '../assets/logo.jpeg';   // ✅ Fixed: logo.jpeg exists

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
  const navigate = useNavigate();

  const [buyers,         setBuyers]         = useState([]);
  const [selectedBuyer,  setSelectedBuyer]  = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [sendError,      setSendError]      = useState('');
  const [fetchError,     setFetchError]     = useState('');
  const [searchTerm,     setSearchTerm]     = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [isUploading,    setIsUploading]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSending,      setIsSending]      = useState(false);
  const [activeTab,      setActiveTab]      = useState('all');
  const [inputValue,     setInputValue]     = useState('');
  const [vendorProfile,  setVendorProfile]  = useState({ name: '', picture: null, initial: 'V' });
  const [debugInfo,      setDebugInfo]      = useState(null);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText,         setEditText]         = useState('');
  const [deleteConfirmId,  setDeleteConfirmId]  = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploadMenu,  setShowUploadMenu]  = useState(false);

  const [isRecording,   setIsRecording]   = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const recordingIntervalRef = useRef(null);

  const messagesEndRef    = useRef(null);
  const imageInputRef    = useRef(null);
  const videoInputRef    = useRef(null);
  const documentInputRef = useRef(null);
  const inputRef         = useRef(null);
  const emojiBtnRef      = useRef(null);
  const uploadBtnRef     = useRef(null);
  const uploadMenuRef    = useRef(null);
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

  /* ── Send attachment (image, video, file, voice) ─────────────────────── */
  const sendAttachment = useCallback(async (file, msgTypeParam = null) => {
    const buyer = selectedBuyerRef.current;
    if (!buyer || !file) return;
    setIsUploading(true);
    setSendError('');
    const tempId  = `temp-attach-${Date.now()}`;
    const msgType = msgTypeParam || (file.type.startsWith('audio/') ? 'voice' :
                    file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('image/') ? 'image' : 'file');

    let optimistic;

    if (msgType === 'voice') {
      const localUrl = URL.createObjectURL(file);
      optimistic = makeOptimisticMsg(tempId, 'Voice message', 'voice', localUrl, 'voice_note');
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);

      try {
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

    } else if (msgType === 'video') {
      /* ── FIX: Video upload ─────────────────────────────────────────────
         Videos must be uploaded via /chat/upload/ first (with file_type='video'),
         then the returned absolute URL is sent via the conversations send endpoint.
         Previously this path was falling through to the generic branch which was
         already correct, but the file_type was being set to 'file' instead of
         'video', causing the backend to reject or mishandle the upload.
      ────────────────────────────────────────────────────────────────────── */
      const localUrl = URL.createObjectURL(file);
      optimistic = makeOptimisticMsg(tempId, file.name || 'Video', 'video', localUrl, file.name);
      setMessages((prev) => [...prev, optimistic]);
      setTimeout(scrollToBottom, 50);

      try {
        const form = new FormData();
        form.append('file', file);
        form.append('file_type', 'video');

        setUploadProgress(0);
        const uploadRes = await api.post('/chat/upload/', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000, // 2 min — overrides the default 15s which caused the cancel
          onUploadProgress: (e) => {
            const pct = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
            setUploadProgress(pct);
          },
        });
        setUploadProgress(0);

        const absUrl = getImageUrl(uploadRes.data.file_url);

        const res = await api.post(`/chat/conversations/${buyer.id}/send/`, {
          message_type: 'video',
          media_url: absUrl,
          file_name: uploadRes.data.file_name || file.name,
          mime_type: uploadRes.data.mime_type || file.type,
        });

        const rawData = res.data?.data ?? res.data;
        const realMsg = (rawData && typeof rawData === 'object')
          ? (normalizeMessage(rawData, 'vendor') ?? { ...optimistic, _optimistic: false, mediaUrl: absUrl })
          : { ...optimistic, _optimistic: false, mediaUrl: absUrl };

        setMessages((prev) => prev.map((m) => (m.id === tempId ? realMsg : m)));
        fetchConversations();
      } catch (err) {
        const backendMsg =
          err.response?.data?.message ??
          err.response?.data?.detail ??
          err.response?.data?.error ??
          (err.response?.data ? JSON.stringify(err.response.data) : 'Video upload failed.');
        setSendError(backendMsg);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsUploading(false);
      }

    } else {
      // image or file
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

  /* ── Send location ──────────────────────────────────────────────────── */
  const sendLocation = useCallback(async () => {
    const buyer = selectedBuyerRef.current;
    if (!buyer) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await finalizeLocationSend(buyer.id, latitude, longitude, 'My location');
        },
        async () => {
          const coords = prompt('Enter location as "latitude,longitude" (e.g. 0.3476,32.5825)');
          if (coords) {
            const [lat, lon] = coords.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lon)) {
              await finalizeLocationSend(buyer.id, lat, lon, 'Shared location');
            } else {
              alert('Invalid coordinates');
            }
          }
        }
      );
    } else {
      const coords = prompt('Enter location as "latitude,longitude" (e.g. 0.3476,32.5825)');
      if (coords) {
        const [lat, lon] = coords.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lon)) {
          await finalizeLocationSend(buyer.id, lat, lon, 'Shared location');
        } else {
          alert('Invalid coordinates');
        }
      }
    }
  }, []);

  const finalizeLocationSend = async (convId, lat, lon, name) => {
    setIsUploading(true);
    try {
      await api.post('/chat/share-location/', {
        conversation_id: convId,
        latitude: lat,
        longitude: lon,
        location_name: name,
        location_address: '',
      });
      fetchConversations();
    } catch (err) {
      setSendError('Failed to share location.');
    } finally {
      setIsUploading(false);
    }
  };

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

    if (imageInputRef.current) imageInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';
  }, [inputValue, attachmentFile, isSending, isUploading, sendAttachment, sendTextOnly]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  }, [handleSendMessage]);

  /* ── File change handlers for each type ─────────────────────────────── */
  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadMenu(false);
    setAttachmentFile(file);
    await sendAttachment(file);
    setAttachmentFile(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [sendAttachment]);

  const handleVideoChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadMenu(false);
    // Explicitly pass 'video' as the message type to ensure correct handling
    await sendAttachment(file, 'video');
    setAttachmentFile(null);
    if (videoInputRef.current) videoInputRef.current.value = '';
  }, [sendAttachment]);

  const handleDocumentChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowUploadMenu(false);
    setAttachmentFile(file);
    await sendAttachment(file);
    setAttachmentFile(null);
    if (documentInputRef.current) documentInputRef.current.value = '';
  }, [sendAttachment]);

  const handleLocationFromMenu = useCallback(() => {
    setShowUploadMenu(false);
    sendLocation();
  }, [sendLocation]);

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

  /* ── Close popovers on outside click ────────────────────────── */
  useEffect(() => {
    if (!showEmojiPicker && !showUploadMenu) return;
    const handler = (e) => {
      if (
        showEmojiPicker &&
        emojiBtnRef.current &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
      if (
        showUploadMenu &&
        uploadBtnRef.current &&
        !uploadBtnRef.current.contains(e.target) &&
        uploadMenuRef.current &&
        !uploadMenuRef.current.contains(e.target)
      ) {
        setShowUploadMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker, showUploadMenu]);

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
      <div className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-gray-100">

        {/* ── Header with Eki logo ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            {/* Eki Logo */}
            <img
              src={ekiLogo}
              alt="Eki"
              className="w-7 h-7 rounded-full object-cover shadow-sm border border-[#075E54]/20"
            />
            <span className="font-semibold text-gray-800 text-sm">Eki Chat</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
              <Plus size={14} />
            </button>
            <button className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
              <Filter size={12} />
            </button>
          </div>
        </div>

        <div className="px-3 pb-3">
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search conversations" value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 pr-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-[#075E54]/40 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex gap-1 px-3 pb-2">
          {['all', 'unread'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                activeTab === tab ? 'bg-[#075E54] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'
              }`}>{tab}</button>
          ))}
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {filteredBuyers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageCircle size={28} className="mb-2 opacity-30" />
              <p className="text-xs">No conversations</p>
            </div>
          ) : filteredBuyers.map((buyer) => (
            <div key={buyer.id} onClick={() => handleSelectConversation(buyer)}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors border-b border-gray-50 ${
                selectedBuyer?.id === buyer.id ? 'bg-[#075E54]/10' : 'hover:bg-gray-50'
              }`}>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#075E54] flex items-center justify-center text-white font-medium text-xs shadow-sm overflow-hidden">
                  {buyer.avatar ? <img src={buyer.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(buyer.name)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold truncate ${buyer.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{buyer.name}</span>
                  <span className="text-[10px] text-gray-400 ml-1 flex-shrink-0">{buyer.lastSeen}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className={`text-[11px] truncate ${buyer.unread > 0 ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                    {buyer.lastMessage || 'No messages yet'}
                  </p>
                  {buyer.unread > 0 && (
                    <span className="ml-1 flex-shrink-0 min-w-[16px] h-[16px] bg-[#075E54] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1">
                      {buyer.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Back to Dashboard button at bottom of sidebar ── */}
        <div className="px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => navigate('/vendordashboard')}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-[#075E54]/10 hover:text-[#075E54] transition-all group"
          >
            <ArrowLeft size={14} className="text-gray-400 group-hover:text-[#075E54] transition-colors" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#efeae2]">

        {selectedBuyer ? (
          <div className="flex items-center justify-between px-4 py-2 bg-[#075E54] text-white shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-xs overflow-hidden shadow-sm">
                {selectedBuyer.avatar ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(selectedBuyer.name)}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{selectedBuyer.name}</p>
                <p className="text-[10px] text-white/70 uppercase tracking-wide leading-tight">{orderRef}</p>
              </div>
            </div>
            <button className="p-1 hover:bg-white/10 rounded-full"><MoreVertical size={14} /></button>
          </div>
        ) : (
          <div className="flex items-center px-4 py-2 bg-[#075E54] text-white text-xs">Select a conversation</div>
        )}

        {fetchError && (
          <div className="flex items-center gap-2 px-4 py-1 bg-amber-50 text-amber-700 text-xs">
            <AlertCircle size={12} /><span>{fetchError}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {loading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <div className={`h-8 rounded-xl ${i % 2 === 0 ? 'bg-[#075E54]/30 w-2/5' : 'bg-white/80 w-1/3'}`} />
                </div>
              ))}
            </div>
          ) : !selectedBuyer ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={48} className="mb-2 opacity-20" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : messages.length === 0 && !fetchError ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={36} className="mb-2 opacity-20" />
              <p className="text-xs">No messages yet. Say hello!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([dateKey, group]) => (
              <div key={dateKey}>
                <div className="flex justify-center my-3">
                  <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded-md shadow-sm">
                    {formatDateSep(group.date)}
                  </span>
                </div>

                <div className="space-y-1">
                  {group.msgs.map((msg, idx) => {
                    const processedMsg = extractAudioFromMessage(msg);
                    const isVendor     = processedMsg.sender === 'vendor';
                    const isOptimistic = processedMsg._optimistic === true;
                    const isEditing    = editingMessageId === processedMsg.id;
                    const isDeletingConfirm = deleteConfirmId === processedMsg.id;

                    return (
                      <div
                        key={processedMsg.id ?? idx}
                        className={`flex items-end gap-1.5 ${isVendor ? 'justify-end' : 'justify-start'} relative group`}
                      >
                        {!isVendor && (
                          <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5 overflow-hidden shadow-sm">
                            {selectedBuyer?.avatar
                              ? <img src={selectedBuyer.avatar} alt="" className="w-full h-full object-cover" />
                              : getInitials(selectedBuyer?.name)
                            }
                          </div>
                        )}

                        <div className={`max-w-[70%] flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}>
                          {isVendor && !isOptimistic && (
                            <div className={`mb-0.5 flex items-center gap-1 transition-opacity duration-150 ${
                              isEditing || isDeletingConfirm ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}>
                              <button onClick={(e) => { e.stopPropagation(); handleEditStart(processedMsg); }} className="p-0.5 text-gray-400 hover:text-blue-500 rounded" title="Edit"><Edit3 size={10} /></button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteConfirm(processedMsg.id); }} className="p-0.5 text-gray-400 hover:text-red-500 rounded" title="Delete"><Trash2 size={10} /></button>
                            </div>
                          )}

                          {isDeletingConfirm && (
                            <div className="bg-white rounded-lg px-2 py-1 text-[10px] text-gray-700 mb-0.5 shadow-sm flex items-center gap-1">
                              <span>Delete?</span>
                              <button onClick={() => handleDeleteExecute(processedMsg.id)} className="text-red-500 font-bold">Yes</button>
                              <button onClick={handleDeleteCancel} className="text-gray-400">No</button>
                            </div>
                          )}

                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); if (e.key === 'Escape') handleEditCancel(); }}
                                className="px-2 py-1 bg-white border border-[#075E54] rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#075E54] shadow-sm w-full min-w-[120px]" autoFocus />
                              <button onClick={handleEditSave} className="p-0.5 text-green-600" title="Save"><CheckCheck size={12} /></button>
                              <button onClick={handleEditCancel} className="p-0.5 text-gray-400" title="Cancel"><X size={12} /></button>
                            </div>
                          ) : (
                            <div className={`px-2.5 py-1.5 rounded-2xl text-xs shadow-sm ${
                              isVendor
                                ? `bg-[#075E54] text-white rounded-br-md ${isOptimistic ? 'opacity-70' : ''}`
                                : 'bg-[#EFB034] text-gray-900 rounded-bl-md border border-[#d4952c]/30'
                            }`}>
                              {processedMsg.type === 'voice' ? (
                                <audio controls src={processedMsg.mediaUrl} className="max-w-full h-6" />
                              ) : processedMsg.type === 'image' ? (
                                <img src={processedMsg.mediaUrl} alt="attachment" className="rounded-lg max-w-[180px] max-h-[180px] object-cover" />
                              ) : processedMsg.type === 'video' ? (
                                <video controls src={processedMsg.mediaUrl} className="rounded-lg max-w-[180px] max-h-[180px] object-cover" />
                              ) : processedMsg.type === 'file' ? (
                                <a href={processedMsg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 underline">
                                  <FileIcon size={12} />{safeStr(processedMsg.fileName || processedMsg.text)}
                                </a>
                              ) : processedMsg.type === 'location' ? (
                                <div className="text-xs">
                                  <MapPin size={12} className="inline mr-1" />
                                  {processedMsg.text}
                                </div>
                              ) : (
                                <p className="break-words whitespace-pre-wrap leading-relaxed">{safeStr(processedMsg.text)}</p>
                              )}
                            </div>
                          )}

                          <div className={`flex items-center gap-1 mt-0.5 ${isVendor ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[9px] text-gray-500">{formatTime(processedMsg.timestamp)}</span>
                            {isVendor && !isOptimistic && <CheckCheck size={10} className="text-[#075E54]" />}
                            {isVendor && isOptimistic  && <Loader2 size={8} className="animate-spin text-gray-400" />}
                          </div>
                        </div>

                        {isVendor && (
                          <div className="w-6 h-6 rounded-full bg-[#075E54] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5 shadow-sm overflow-hidden">
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
          <div className="flex items-center gap-2 px-4 py-1 bg-red-50 text-red-600 text-[10px]">
            <AlertCircle size={12} /><span>{sendError}</span>
            <button onClick={() => setSendError('')} className="ml-auto hover:text-red-800"><X size={10} /></button>
          </div>
        )}

        {(attachmentFile || (isUploading && uploadProgress > 0)) && (
          <div className="px-4 py-1 bg-white border-t border-gray-100 flex flex-col gap-1">
            {attachmentFile && (
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1 text-[10px] text-gray-600 flex-1 min-w-0">
                {attachmentFile.type.startsWith('audio') ? <Mic size={10} /> :
                 attachmentFile.type.startsWith('video') ? <Video size={10} /> :
                 attachmentFile.type.startsWith('image') ? <FileIcon size={10} /> : <FileIcon size={10} />}
                <span className="truncate max-w-[150px]">{attachmentFile.name}</span>
                {attachmentFile.type.startsWith('audio') && (
                  <audio controls src={URL.createObjectURL(attachmentFile)} className="ml-1 h-5" />
                )}
                <button onClick={() => setAttachmentFile(null)} className="text-red-400 hover:text-red-600 ml-auto"><X size={10} /></button>
                {isUploading && (
                  uploadProgress > 0
                    ? <span className="text-[10px] text-[#075E54] font-medium ml-1">{uploadProgress}%</span>
                    : <Loader2 size={10} className="animate-spin text-gray-400" />
                )}
              </div>
            )}
            {isUploading && uploadProgress > 0 && (
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#075E54] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {selectedBuyer && (
          <div className="px-3 py-2 bg-white border-t border-gray-200">
            {showEmojiPicker && (
              <div className="relative mb-1">
                <div className="absolute bottom-full left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 grid grid-cols-7 gap-0.5 max-w-[240px]">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => { setInputValue((prev) => prev + emoji); setShowEmojiPicker(false); inputRef.current?.focus(); }}
                      className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100 rounded">{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {showUploadMenu && (
              <div className="relative mb-1" ref={uploadMenuRef}>
                <div className="absolute bottom-full left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Camera size={14} /> Photo / Image
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <Video size={14} /> Video
                  </button>
                  <button
                    onClick={() => documentInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <FileIcon size={14} /> Document
                  </button>
                  <button
                    onClick={handleLocationFromMenu}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <MapPin size={14} /> Location
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 focus-within:border-[#075E54]/30 focus-within:bg-white transition-all">
              <button
                type="button"
                ref={uploadBtnRef}
                onClick={() => setShowUploadMenu((prev) => !prev)}
                disabled={isUploading || isSending}
                className="p-1 text-gray-400 hover:text-[#075E54] rounded-full transition-colors"
                title="Attach"
              >
                <Paperclip size={16} />
              </button>

              {/* Hidden file inputs */}
              <input type="file" ref={imageInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
              {/* FIX: accept all common video formats explicitly */}
              <input type="file" ref={videoInputRef} className="hidden" onChange={handleVideoChange} accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/*" />
              <input type="file" ref={documentInputRef} className="hidden" onChange={handleDocumentChange} accept="*/*" />

              <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isUploading || isSending}
                className={`p-1 rounded-full transition-colors ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-[#075E54]'
                }`} title={isRecording ? 'Stop' : 'Record voice'}>
                <Mic size={16} />
              </button>
              {isRecording && <span className="text-[10px] text-red-500 font-mono">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>}

              <button type="button" ref={emojiBtnRef} onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="p-1 text-gray-400 hover:text-[#075E54] rounded-full" title="Add emoji">
                😀
              </button>

              <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Type a message" className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none" />

              <button type="button" onClick={handleSendMessage} disabled={(!inputValue.trim() && !attachmentFile) || isSending || isUploading}
                className={`p-1.5 rounded-full transition-all ${
                  (inputValue.trim() || attachmentFile) && !isSending && !isUploading
                    ? 'bg-[#075E54] text-white shadow-sm'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}>
                {isSending || isUploading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
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