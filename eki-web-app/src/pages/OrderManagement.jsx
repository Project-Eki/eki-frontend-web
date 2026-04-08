import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import Footer from "../components/Vendormanagement/VendorFooter";

import {
  getVendorOrders,
  getVendorDashboard,
} from '../services/authService';

import { getCurrencySymbol } from '../utils/currency';

import {
  Search, Filter, List,
  CircleDollarSign, Clock, BarChart3, Package,
  X, Hash, User, Calendar, MapPin, ShoppingBag, Tag, Star,
} from 'lucide-react';

// ─── Helper: format order ID professionally ───────────────────────────────────
const formatOrderId = (raw) => {
  if (!raw && raw !== 0) return '—';
  const str = String(raw).trim();
  if (/^\d+$/.test(str)) return `#${str.padStart(6, '0')}`;
  if (str.length > 12) return `#${str.slice(-8).toUpperCase()}`;
  return `#${str.toUpperCase()}`;
};

// ─── Status badge — coloured background, always BLACK text ───────────────────
const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-black border border-yellow-200',
  confirmed:  'bg-blue-100 text-black border border-blue-200',
  processing: 'bg-indigo-100 text-black border border-indigo-200',
  completed:  'bg-green-100 text-black border border-green-200',
  cancelled:  'bg-red-100 text-black border border-red-200',
  delivered:  'bg-emerald-100 text-black border border-emerald-200',
};

const TAB_FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled', 'Delivered'];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, number, icon: Icon, iconBgColor, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{number}</p>
      </div>
      <div className={`${iconBgColor} p-2.5 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

// ─── Star Rating (gold) ───────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, idx) => (
      <Star
        key={idx}
        size={11}
        className="text-[#F5B841]"
        fill={idx < rating ? '#F5B841' : 'none'}
        strokeWidth={1.5}
      />
    ))}
  </div>
);

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, currencySymbol, onClose }) => {
  if (!order) return null;

  const statusKey  = String(order.status ?? '').toLowerCase();
  const badgeClass = STATUS_STYLES[statusKey] ?? 'bg-slate-100 text-black border border-slate-200';

  const customerName =
    typeof order.customer === 'object' && order.customer !== null
      ? (order.customer.name || order.customer.email || '—')
      : (order.customer ?? '—');

  const statusLabel =
    typeof order.status === 'object' && order.status !== null
      ? (order.status.label || order.status.name || '—')
      : (order.status ?? '—');

  const items = Array.isArray(order.items) ? order.items : [];

  const displayDate = order.date
    ? (() => { try { return new Date(order.date).toLocaleString(); } catch (_) { return order.date; } })()
    : '—';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-[#F5B841]" />
              <h2 className="text-base font-bold text-slate-800">
                Order {formatOrderId(order.id)}
              </h2>
            </div>
            <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Customer Info */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
              <User size={14} className="text-[#125852]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Customer</p>
              <p className="text-[13px] font-bold text-slate-800 truncate">{customerName}</p>
              {order.customer?.email && order.customer?.name && (
                <p className="text-[10px] text-slate-400 truncate">{order.customer.email}</p>
              )}
            </div>
          </div>

          {/* Date + Location */}
          <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Location</p>
                  <p className="text-[10px] font-semibold text-slate-700 truncate">{order.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Order Summary</p>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between px-3 py-2.5 ${
                      i !== items.length - 1 ? 'border-b border-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag size={12} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">
                          {item.name || item.title || `Item ${i + 1}`}
                        </p>
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
                ))
              ) : (
                <div className="px-3 py-4 flex items-center gap-2">
                  <Tag size={12} className="text-slate-300" />
                  <p className="text-[11px] text-slate-400">
                    {Array.isArray(order.items)
                      ? order.items.length
                      : typeof order.items === 'number'
                      ? order.items
                      : '—'}{' '}
                    item(s)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Review — gold stars */}
          {order.review && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl space-y-1.5">
              <p className="text-[9px] font-bold uppercase text-amber-600">Customer Review</p>
              <StarRating rating={order.review.rating} />
              {order.review.comment && (
                <p className="text-[10px] text-amber-800 italic">"{order.review.comment}"</p>
              )}
              {order.review.reviewer && (
                <p className="text-[9px] text-amber-500">— {order.review.reviewer}</p>
              )}
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
                <span className="font-semibold text-slate-700">
                  {currencySymbol} {Number(order.subtotal).toLocaleString()}
                </span>
              </div>
            )}
            {order.shipping != null && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-slate-700">
                  {currencySymbol} {Number(order.shipping).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-[13px] pt-1 border-t border-slate-100 mt-1">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-black text-[#125852]">
                {currencySymbol} {Number(order.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2 bg-slate-50/30 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-[11px] font-bold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <Link
            to={`/order-management/${order.id}`}
            className="flex-1 py-2.5 text-[11px] font-bold bg-[#F5B841] text-white rounded-xl hover:bg-[#E0A83B] transition-colors text-center"
          >
            View Full Order
          </Link>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const OrderManagement = () => {
  const [orders,         setOrders]         = useState([]);
  const [isFetching,     setIsFetching]     = useState(true);
  const [activeTab,      setActiveTab]      = useState('All');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('UGX');
  const [selectedOrder,  setSelectedOrder]  = useState(null);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalOrders  = orders.length;
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(String(o.status ?? '').toLowerCase())
  ).length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // ── Fetch currency ─────────────────────────────────────────────────────────
  useEffect(() => {
    getVendorDashboard()
      .then((data) => {
        const country =
          data?.country ||
          data?.business_country ||
          localStorage.getItem('vendor_country') ||
          '';
        if (country) setCurrencySymbol(getCurrencySymbol(country));
      })
      .catch(() => {});
  }, []);

  // ── Fetch orders ───────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setIsFetching(true);
    try {
      const data = await getVendorOrders();
      console.log('[OrderManagement] orders received:', data);
      setOrders(Array.isArray(data) ? data : []);
    } catch (_) {
      setOrders([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Filter + Search (work together) ───────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    // Tab filter
    const matchesTab =
      activeTab === 'All' ||
      String(order.status ?? '').toLowerCase() === activeTab.toLowerCase();

    // Search — matches order ID, formatted ID, customer name/email, status, total
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
      String(order.status ?? '').toLowerCase().includes(q) ||
      String(order.total ?? '').includes(q);

    return matchesTab && matchesSearch;
  });

  // ── Count per tab for badge numbers ───────────────────────────────────────
  const countForTab = (tab) =>
    tab === 'All'
      ? orders.length
      : orders.filter((o) =>
          String(o.status ?? '').toLowerCase() === tab.toLowerCase()
        ).length;

  return (
    <div
      className="flex min-h-screen bg-[#ecece7] text-slate-800 p-3 gap-3"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <VendorSidebar activePage="orders" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">

          {/* Page Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Order Management</h1>
            <p className="text-slate-400 text-[11px] mt-0.5">View and process incoming customer orders.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              title="Total Orders"
              number={isFetching ? '—' : String(totalOrders)}
              icon={Package}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Active Orders"
              number={isFetching ? '—' : String(activeOrders)}
              icon={Clock}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Revenue"
              number={isFetching ? '—' : `${currencySymbol} ${revenue.toLocaleString()}`}
              icon={CircleDollarSign}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Avg. Processing"
              number="—"
              icon={BarChart3}
              iconBgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          </div>

          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3">
            <div className="relative w-full max-w-lg">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order ID, customer name, status or amount…"
                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#F5B841] focus:border-transparent transition font-medium text-slate-700 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Tab Filters */}
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm mb-5 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {TAB_FILTERS.map((tab) => {
                const count    = countForTab(tab);
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#125852] text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span
                        className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search result hint */}
          {searchQuery && (
            <p className="text-[10px] text-slate-400 font-medium mb-3 px-1">
              {filteredOrders.length === 0
                ? `No results for "${searchQuery}"`
                : `${filteredOrders.length} result${filteredOrders.length !== 1 ? 's' : ''} for "${searchQuery}"`}
            </p>
          )}

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="rounded border-slate-300 w-3 h-3" />
                  </th>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {isFetching ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan="7" className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <List size={24} className="text-slate-200" />
                        </div>
                        <p className="text-xs font-bold text-slate-900">No orders found</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          {searchQuery
                            ? 'Try a different search term or clear the search.'
                            : 'When you receive orders, they will appear here.'}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-3 px-3 py-1.5 bg-[#F5B841] text-white text-[10px] font-bold rounded-lg hover:bg-[#E0A83B] transition-colors"
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, i) => {
                    const statusKey  = String(order.status ?? '').toLowerCase();
                    const badgeClass =
                      STATUS_STYLES[statusKey] ?? 'bg-slate-100 text-black border border-slate-200';

                    const displayDate = order.date
                      ? (() => {
                          try { return new Date(order.date).toLocaleDateString(); }
                          catch (_) { return order.date; }
                        })()
                      : '—';

                    const customerDisplay =
                      typeof order.customer === 'object' && order.customer !== null
                        ? (order.customer.name || order.customer.email || '—')
                        : (order.customer ?? '—');

                    return (
                      <tr
                        key={order.id ?? i}
                        className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-slate-300 w-3 h-3" />
                        </td>

                        {/* Formatted Order ID */}
                        <td className="px-4 py-3">
                          <span className="font-black text-[#125852] tracking-wider font-mono text-[10px]">
                            {formatOrderId(order.id)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-[10px] text-slate-700 font-medium">
                          {customerDisplay}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-500">
                          {displayDate}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold text-slate-800">
                          {currencySymbol} {Number(order.total ?? 0).toLocaleString()}
                        </td>

                        {/* Status badge — coloured bg, black text */}
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${badgeClass}`}>
                            {String(order.status ?? '—')}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-[#F5B841] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#E0A83B] transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredOrders.length} of {orders.length} orders
              </p>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-400 cursor-not-allowed">
                  Previous
                </button>
                <button className="w-7 h-7 text-[10px] font-bold bg-[#125852] text-white rounded-md shadow-sm">
                  1
                </button>
                <button className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;