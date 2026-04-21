import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import Footer from '../components/Vendormanagement/VendorFooter';

import {
  getVendorOrders,
  getVendorDashboard,
  confirmVendorOrder,
  verifyPickupCode,
  resendPickupCode,
} from '../services/authService';

import { getCurrencySymbol } from '../utils/currency';

import {
  Search, List, CircleDollarSign, Clock, Package,
  X, Hash, User, Calendar, MapPin, ShoppingBag, Tag, Star,
  CheckCircle, RefreshCw, Send,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatOrderId = (raw) => {
  if (!raw && raw !== 0) return '—';
  const str = String(raw).trim();
  // Numeric IDs: zero-pad to 6 digits
  if (/^\d+$/.test(str)) return `#${str.padStart(6, '0')}`;
  // UUID or long alphanumeric: show last 12 chars uppercased (matches notification display)
  if (str.length > 12) return `#${str.slice(-12).toUpperCase()}`;
  return `#${str.toUpperCase()}`;
};

const normalizeStatus = (status) => {
  const s = String(status ?? '').toLowerCase();
  return s === 'delivered' ? 'fulfilled' : s;
};

const STATUS_BADGE = {
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  confirmed:  'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border border-purple-200',
  completed:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelled:  'bg-red-50 text-red-600 border border-red-200',
  fulfilled:  'bg-teal-50 text-teal-700 border border-teal-200',
};

const TAB_FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled', 'Fulfilled'];
const ORDERS_PER_PAGE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, iconBg, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-xl`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
  </div>
);

const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, idx) => (
      <Star key={idx} size={11} className="text-[#F5B841]"
        fill={idx < rating ? '#F5B841' : 'none'} strokeWidth={1.5} />
    ))}
  </div>
);

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, currencySymbol, onClose, onOrderUpdated }) => {
  const [step, setStep]               = useState('detail');
  const [codeInput, setCodeInput]     = useState('');
  const [confirmCode, setConfirmCode] = useState(''); // vendor confirmation_code for confirm_onsite
  const [verifying, setVerifying]     = useState(false);
  const [confirming, setConfirming]   = useState(false);
  const [resending, setResending]     = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [buyerName, setBuyerName]     = useState('');

  if (!order) return null;

  const statusKey    = normalizeStatus(order.status);
  const badgeClass   = STATUS_BADGE[statusKey] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
  const statusLabel  = statusKey === 'fulfilled' ? 'Fulfilled'
    : (typeof order.status === 'object' ? order.status?.label ?? '—' : order.status ?? '—');

  const customerName =
    typeof order.customer === 'object' && order.customer !== null
      ? order.customer.name || order.customer.email || '—'
      : order.customer ?? '—';

  const customerEmail =
    typeof order.customer === 'object' ? order.customer.email ?? '' : '';

  const items = Array.isArray(order.items) ? order.items : [];

  const displayDate = order.date
    ? (() => { try { return new Date(order.date).toLocaleString(); } catch (_) { return order.date; } })()
    : '—';

  // ── Confirm order — uses unified action endpoint: confirm_onsite ────────────
  // Backend requires confirmation_code — collected in the 'confirm' step
  const handleConfirmOrder = async () => {
    if (!confirmCode.trim()) { setErrorMsg('Please enter your confirmation code.'); return; }
    setConfirming(true);
    setErrorMsg('');
    try {
      await confirmVendorOrder(order.id, confirmCode.trim());
      onOrderUpdated?.();
      setStep('pickup');
    } catch (err) {
      // Surface the exact backend message so the vendor knows what went wrong
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : null);

      if (serverMsg) {
        setErrorMsg(serverMsg);
      } else if (err.response?.status === 500) {
        setErrorMsg('Server error — please check that the escrow is in "held" status and you have not already confirmed this order. Contact support if this persists.');
      } else {
        setErrorMsg('Failed to confirm order. Check your confirmation code and try again.');
      }
    } finally {
      setConfirming(false);
    }
  };

  // ── Verify pickup code — uses unified action endpoint: mark_fulfilled ───────
  const handleVerifyCode = async () => {
    if (!codeInput.trim()) { setErrorMsg('Please enter the pickup code.'); return; }
    setVerifying(true);
    setErrorMsg('');
    try {
      const result = await verifyPickupCode(order.id, codeInput.trim());
      setBuyerName(result?.customer?.name || result?.buyer_name || customerName);
      onOrderUpdated?.();
      setStep('success');
    } catch (err) {
      setStep('failure');
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend code — uses unified action endpoint: resend_code ─────────────────
  const handleResendCode = async () => {
    setResending(true);
    try {
      await resendPickupCode(order.id);
    } catch (_) { /* silent — code resend is best-effort */ }
    finally { setResending(false); }
  };

  // Shared overlay wrapper
  const Overlay = ({ children, maxW = 'sm:max-w-md' }) => (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${maxW} rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );

  // ── Confirm order — vendor enters their confirmation_code ──────────────────
  if (step === 'confirm') return (
    <Overlay maxW="sm:max-w-lg">
      <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Confirm order</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Order {formatOrderId(order.id)}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 sm:px-8 py-6 space-y-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          Enter your <span className="font-bold text-slate-700">vendor confirmation code</span> to verify the buyer is present onsite.
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-4 py-3 rounded-xl">{errorMsg}</div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Your confirmation code</label>
          <input
            type="text"
            value={confirmCode}
            onChange={(e) => { setErrorMsg(''); setConfirmCode(e.target.value.toUpperCase()); }}
            placeholder="Enter confirmation code"
            className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase tracking-widest text-center focus:border-[#125852] outline-none transition-colors"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="space-y-2.5 pt-1">
          <button onClick={handleConfirmOrder} disabled={confirming || !confirmCode.trim()}
            className="w-full py-3.5 bg-[#125852] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0e4340] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
            {confirming ? <><RefreshCw size={14} className="animate-spin" /> Confirming…</> : <><CheckCircle size={14} /> Confirm order</>}
          </button>
          <button onClick={() => { setStep('detail'); setErrorMsg(''); setConfirmCode(''); }}
            className="w-full py-3 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            Back
          </button>
        </div>
      </div>
    </Overlay>
  );

  // ── Pickup code entry ───────────────────────────────────────────────────────
  if (step === 'pickup') return (
    <Overlay maxW="sm:max-w-lg">
      <div className="px-6 sm:px-8 py-4 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">Enter pickup code</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Order {formatOrderId(order.id)}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 sm:px-8 py-6 space-y-5">
        <p className="text-xs text-slate-500 leading-relaxed">
          Enter the pickup code provided by the customer. Format:{' '}
          <span className="font-mono font-bold text-slate-700">ABC-XXXXXXXX</span>
        </p>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-4 py-3 rounded-xl">{errorMsg}</div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Pickup code</label>
          <input
            type="text"
            value={codeInput}
            onChange={(e) => { setErrorMsg(''); setCodeInput(e.target.value.toUpperCase()); }}
            placeholder="e.g. EKI-F22EU8"
            className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl text-lg font-mono font-bold uppercase tracking-widest text-center focus:border-[#125852] outline-none transition-colors"
            autoComplete="off"
            autoFocus
          />
          <p className="text-[10px] text-slate-400 text-center">Format: ABC-XXXXXXXX</p>
        </div>

        <div className="space-y-2.5 pt-1">
          <button onClick={handleVerifyCode} disabled={verifying || !codeInput.trim()}
            className="w-full py-3.5 bg-[#125852] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#0e4340] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed">
            {verifying ? <><RefreshCw size={14} className="animate-spin" /> Verifying…</> : <><CheckCircle size={14} /> Verify &amp; complete order</>}
          </button>
          <div className="flex gap-2">
            <button onClick={handleResendCode} disabled={resending}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
              {resending ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
              Resend code
            </button>
            <button onClick={() => { setStep('detail'); setErrorMsg(''); setCodeInput(''); }}
              className="flex-1 py-3 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <Overlay maxW="sm:max-w-sm">
      <div className="px-5 py-10 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <div>
          <p className="text-base font-black text-slate-800">Order Complete!</p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            <span className="font-bold text-slate-700">{buyerName || customerName}</span>'s order has been fulfilled successfully.
          </p>
        </div>
        <button onClick={onClose} className="w-full py-2.5 bg-[#125852] text-white rounded-xl text-xs font-bold hover:bg-[#0e4340] transition-colors">
          Done
        </button>
      </div>
    </Overlay>
  );

  // ── Failure ─────────────────────────────────────────────────────────────────
  if (step === 'failure') return (
    <Overlay maxW="sm:max-w-sm">
      <div className="px-5 py-10 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <X size={32} className="text-red-400" />
        </div>
        <div>
          <p className="text-base font-black text-slate-800">Invalid Code</p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            The pickup code could not be verified. Please ask the customer for the correct code.
          </p>
        </div>
        <button onClick={() => { setStep('pickup'); setCodeInput(''); }} className="w-full py-2.5 bg-[#125852] text-white rounded-xl text-xs font-bold hover:bg-[#0e4340] transition-colors">
          Try again
        </button>
        <button onClick={onClose} className="w-full py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
          Close
        </button>
      </div>
    </Overlay>
  );

  // ── Order detail (default) ──────────────────────────────────────────────────
  return (
    <Overlay>
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Hash size={13} className="text-[#F5B841]" />
            <h2 className="text-sm sm:text-base font-bold text-slate-800">Order {formatOrderId(order.id)}</h2>
          </div>
          <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold ${badgeClass}`}>
            {statusLabel}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium px-3 py-2 rounded-lg">{errorMsg}</div>
        )}

        {/* Customer */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 flex-shrink-0">
            <User size={14} className="text-[#125852]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Customer</p>
            <p className="text-xs sm:text-[13px] font-bold text-slate-800 truncate">{customerName}</p>
            {customerEmail && <p className="text-[10px] text-slate-400 truncate">{customerEmail}</p>}
          </div>
        </div>

        {/* Date & Location */}
        <div className={`grid gap-3 ${order.location ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
            <Calendar size={13} className="text-[#F5B841] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Date</p>
              <p className="text-[10px] font-semibold text-slate-700">{displayDate}</p>
            </div>
          </div>
          {order.location && (
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
              <MapPin size={13} className="text-[#F5B841] mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Location</p>
                <p className="text-[10px] font-semibold text-slate-700 truncate">{order.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order items */}
        <div>
          <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Order Summary</p>
          <div className="border border-slate-100 rounded-xl overflow-hidden">
            {items.length > 0 ? items.map((item, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-2.5 ${i !== items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      : <ShoppingBag size={12} className="text-slate-300" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{item.name || `Item ${i + 1}`}</p>
                    {item.qty && <p className="text-[9px] text-slate-400">Qty: {item.qty}</p>}
                    {item.variant && <p className="text-[9px] text-slate-400">{item.variant}</p>}
                  </div>
                </div>
                {item.price != null && (
                  <p className="text-[11px] font-bold text-slate-700 ml-2 flex-shrink-0">
                    {currencySymbol} {Number(item.price).toLocaleString()}
                  </p>
                )}
              </div>
            )) : (
              <div className="px-3 py-4 flex items-center gap-2">
                <Tag size={12} className="text-slate-300" />
                <p className="text-[11px] text-slate-400">No item details available</p>
              </div>
            )}
          </div>
        </div>

        {/* Review */}
        {order.review && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1.5">
            <p className="text-[9px] font-bold uppercase text-amber-600">Customer Review</p>
            <StarRating rating={order.review.rating} />
            {order.review.comment && <p className="text-[10px] text-amber-800 italic">"{order.review.comment}"</p>}
            {order.review.reviewer && <p className="text-[9px] text-amber-500">— {order.review.reviewer}</p>}
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Notes</p>
            <p className="text-[10px] text-slate-600">{order.notes}</p>
          </div>
        )}

        {/* Totals */}
        <div className="border-t border-slate-100 pt-3 space-y-1.5">
          {order.subtotal != null && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-700">{currencySymbol} {Number(order.subtotal).toLocaleString()}</span>
            </div>
          )}
          {order.shipping != null && (
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Shipping</span>
              <span className="font-semibold text-slate-700">{currencySymbol} {Number(order.shipping).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-[13px] pt-1 border-t border-slate-100">
            <span className="font-bold text-slate-800">Total</span>
            <span className="font-black text-[#125852]">{currencySymbol} {Number(order.total || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-100 flex gap-2 bg-slate-50/30 flex-shrink-0">
        <button onClick={onClose}
          className="flex-1 py-2.5 text-xs font-bold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
          Close
        </button>

        {/* Smart action button — label & behaviour change with order status */}
        {statusKey === 'pending' ? (
          <button
            onClick={() => { setErrorMsg(''); setConfirmCode(''); setStep('confirm'); }}
            className="flex-1 py-2.5 text-xs font-bold bg-[#125852] text-white rounded-xl hover:bg-[#0e4340] transition-colors flex items-center justify-center gap-1.5">
            <CheckCircle size={13} /> Confirm Order
          </button>
        ) : statusKey === 'confirmed' ? (
          <button
            onClick={() => { setErrorMsg(''); setCodeInput(''); setStep('pickup'); }}
            className="flex-1 py-2.5 text-xs font-bold bg-[#F5B841] text-white rounded-xl hover:bg-[#E0A83B] transition-colors flex items-center justify-center gap-1.5">
            <CheckCircle size={13} /> Enter Pickup Code
          </button>
        ) : (
          <Link to={`/order-management/${order.id}`}
            className="flex-1 py-2.5 text-xs font-bold bg-[#F5B841] text-white rounded-xl hover:bg-[#E0A83B] transition-colors text-center flex items-center justify-center">
            View Full Order
          </Link>
        )}
      </div>
    </Overlay>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderManagement = () => {
  const [orders,         setOrders]         = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);  // only true on first load
  const [activeTab,      setActiveTab]      = useState('All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('UGX');
  const [selectedOrder,  setSelectedOrder]  = useState(null);
  const [currentPage,    setCurrentPage]    = useState(1);

  const isMountedRef  = useRef(true);
  const fetchingRef   = useRef(false);
  // Keep a stable copy of orders so background polls never blank the UI
  const ordersRef     = useRef([]);

  const location = useLocation();
  const navigate  = useNavigate();

  // ── Auto-open order modal when navigated from a notification ─────────────────
  // Navbar passes: navigate('/order-management', { state: { openOrderId: '...' } })
  useEffect(() => {
    const openOrderId = location.state?.openOrderId;
    if (!openOrderId || ordersRef.current.length === 0) return;
    const target = ordersRef.current.find(
      (o) => String(o.id) === String(openOrderId)
    );
    if (target) {
      setSelectedOrder(target);
      // Clear state so back-navigation doesn't re-open the modal
      navigate('/order-management', { replace: true, state: {} });
    }
  }, [location.state, orders, navigate]); // re-run when orders load

  // ── Derived stats ───────────────────────────────────────────────────────────
  const totalOrders  = orders.length;
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(normalizeStatus(o.status))
  ).length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // ── Load currency from dashboard (once, no flicker) ─────────────────────────
  useEffect(() => {
    getVendorDashboard()
      .then((data) => {
        if (!isMountedRef.current) return;
        const country = data?.country || data?.business_country || localStorage.getItem('vendor_country') || '';
        if (country) setCurrencySymbol(getCurrencySymbol(country));
      })
      .catch(() => {});
  }, []);

  // ── Fetch orders — ANTI-FLICKER design ───────────────────────────────────────
  // • On first load: show skeleton until data arrives, then render.
  // • On subsequent polls: update state ONLY when data actually changes,
  //   so React skips re-renders that would cause visible flicker.
  const fetchOrders = useCallback(async (isInitial = false) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const data = await getVendorOrders();
      if (!isMountedRef.current) return;

      const incoming = Array.isArray(data) ? data : [];

      // Shallow-compare by stringifying IDs + statuses to avoid unnecessary re-renders
      const currentSignature = ordersRef.current
        .map((o) => `${o.id}:${o.status}`).join(',');
      const incomingSignature = incoming
        .map((o) => `${o.id}:${o.status}`).join(',');

      if (isInitial || currentSignature !== incomingSignature) {
        ordersRef.current = incoming;
        setOrders(incoming);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('[OrderManagement] fetch error:', err);
        // On initial load failure set empty; on poll failure keep existing data
        if (isInitial) setOrders([]);
      }
    } finally {
      fetchingRef.current = false;
      if (isInitial && isMountedRef.current) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchOrders(true); // initial load — shows skeleton
    const interval = setInterval(() => fetchOrders(false), 30_000); // silent polls
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchOrders]);

  // Reset page on filter/search change
  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const status = normalizeStatus(order.status);
    const matchesTab = activeTab === 'All' || status === activeTab.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const customerStr =
      typeof order.customer === 'object' && order.customer !== null
        ? `${order.customer.name ?? ''} ${order.customer.email ?? ''}`
        : String(order.customer ?? '');

    const matchesSearch =
      !q ||
      String(order.id ?? '').toLowerCase().includes(q) ||
      formatOrderId(order.id).toLowerCase().includes(q) ||
      customerStr.toLowerCase().includes(q) ||
      status.includes(q) ||
      String(order.total ?? '').includes(q);

    return matchesTab && matchesSearch;
  }), [orders, activeTab, searchQuery]);

  const totalPages  = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const startIndex  = (safePage - 1) * ORDERS_PER_PAGE;
  const pagedOrders = useMemo(
    () => filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE),
    [filteredOrders, startIndex]
  );

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = (() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  const countForTab = useCallback((tab) => {
    if (tab === 'All') return orders.length;
    return orders.filter((o) => normalizeStatus(o.status) === tab.toLowerCase()).length;
  }, [orders]);

  // ── onOrderUpdated: silently refresh without blanking UI ────────────────────
  const handleOrderUpdated = useCallback(() => {
    fetchOrders(false);
    setSelectedOrder(null);
  }, [fetchOrders]);

  return (
    <div className="flex min-h-screen bg-[#ecece7] text-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <VendorSidebar activePage="orders" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <main className="flex-1 p-3 sm:p-5 max-w-[1400px] mx-auto w-full pb-24">
          {/* Page header */}
          <div className="mb-4 sm:mb-5">
            <h1 className="text-lg sm:text-xl font-bold text-[#1A1A1A] tracking-tight">Order Management</h1>
            <p className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5">Confirm and complete orders with pickup code verification.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
            <StatCard title="Total Orders"  value={initialLoading ? '—' : String(totalOrders)}  icon={Package}          iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard title="Active Orders" value={initialLoading ? '—' : String(activeOrders)} icon={Clock}            iconBg="bg-blue-50"    iconColor="text-blue-600"    />
            <StatCard title="Revenue"       value={initialLoading ? '—' : `${currencySymbol} ${revenue.toLocaleString()}`} icon={CircleDollarSign} iconBg="bg-orange-50" iconColor="text-orange-600" />
          </div>

          {/* Tab filters + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 sm:justify-between mb-3 sm:mb-4">
            {/* Tabs — horizontally scrollable on mobile */}
            <div className="flex gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
              {TAB_FILTERS.map((tab) => {
                const count    = countForTab(tab);
                const isActive = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                      isActive ? 'bg-[#125852] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                    }`}>
                    {tab}
                    {count > 0 && (
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, customer..."
                className="w-full sm:w-48 pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-[#F5B841] bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {initialLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                        </td>
                      </tr>
                    ))
                  ) : pagedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <List size={24} className="text-slate-200" />
                          </div>
                          <p className="text-xs font-bold text-slate-900">No orders found</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {searchQuery ? 'Try a different search term.' : 'Orders will appear here when received.'}
                          </p>
                          {searchQuery && (
                            <button onClick={() => setSearchQuery('')}
                              className="mt-3 px-3 py-1.5 bg-[#F5B841] text-white text-[10px] font-bold rounded-lg hover:bg-[#E0A83B] transition-colors">
                              Clear search
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : pagedOrders.map((order, i) => {
                    const statusKey = normalizeStatus(order.status);
                    const badge     = STATUS_BADGE[statusKey] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
                    const label     = statusKey === 'fulfilled' ? 'Fulfilled' : (order.status ?? '—');
                    const date      = order.date ? (() => { try { return new Date(order.date).toLocaleDateString(); } catch (_) { return order.date; } })() : '—';
                    const customer  = typeof order.customer === 'object' ? (order.customer?.name || order.customer?.email || '—') : (order.customer ?? '—');
                    return (
                      <tr key={order.id ?? i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3"><span className="font-black text-[#125852] font-mono text-[10px]">{formatOrderId(order.id)}</span></td>
                        <td className="px-4 py-3 text-[10px] text-slate-700 font-medium">{customer}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-500">{date}</td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-800">{currencySymbol} {Number(order.total ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-bold ${badge}`}>{label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-[#F5B841] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#E0A83B] transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-slate-50">
              {initialLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 space-y-2">
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3" />
                  </div>
                ))
              ) : pagedOrders.length === 0 ? (
                <div className="py-16 text-center">
                  <List size={24} className="text-slate-200 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">No orders found</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {searchQuery ? 'Try a different search.' : 'Orders will appear here.'}
                  </p>
                </div>
              ) : pagedOrders.map((order, i) => {
                const statusKey = normalizeStatus(order.status);
                const badge     = STATUS_BADGE[statusKey] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
                const label     = statusKey === 'fulfilled' ? 'Fulfilled' : (order.status ?? '—');
                const date      = order.date ? (() => { try { return new Date(order.date).toLocaleDateString(); } catch (_) { return order.date; } })() : '—';
                const customer  = typeof order.customer === 'object' ? (order.customer?.name || order.customer?.email || '—') : (order.customer ?? '—');
                return (
                  <div key={order.id ?? i} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-black text-[#125852] font-mono text-[10px]">{formatOrderId(order.id)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-bold ${badge}`}>{label}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 truncate">{customer}</p>
                      <p className="text-[10px] text-slate-400">{date} · <span className="font-bold text-slate-700">{currencySymbol} {Number(order.total ?? 0).toLocaleString()}</span></p>
                    </div>
                    <button onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-[#F5B841] text-white rounded-lg text-[9px] font-bold uppercase hover:bg-[#E0A83B] transition-colors flex-shrink-0">
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination */}
          {filteredOrders.length > ORDERS_PER_PAGE && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {startIndex + 1}–{Math.min(startIndex + ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}
                  className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed">
                  Previous
                </button>
                {pageNumbers.map((page) => (
                  <button key={page} onClick={() => goToPage(page)}
                    className={`w-7 h-7 text-[10px] font-bold rounded-md transition-colors ${page === safePage ? 'bg-[#125852] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages}
                  className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            {filteredOrders.length} Result{filteredOrders.length !== 1 ? 's' : ''}
          </p>
        </main>

        <Footer />
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default OrderManagement;