import React, { useState, useEffect, useRef } from 'react';
import VendorSidebar from '../components/VendorSidebar';
import Navbar4 from '../components/adminDashboard/Navbar4';
import Footer from "../components/Vendormanagement/VendorFooter";
import {
  Search, History, DollarSign, Clock, CheckCircle,
} from 'lucide-react';

import {
  getVendorDashboard,
  getVendorWallet,
  getVendorEscrow,
  getVendorOrders,
} from '../services/authService';
import { getCurrencySymbol } from '../utils/currency';
import { VendorProvider } from '../context/vendorContext';

const PAYMENTS_PER_PAGE = 10;

// ─── Helper: format transaction ID like TX-XXXX from order id ────────────────
const formatTransactionId = (raw) => {
  if (!raw && raw !== 0) return '—';
  const str = String(raw).trim();
  if (/^TX-/i.test(str)) return str.toUpperCase();
  if (/^\d+$/.test(str)) return `TX-${str.padStart(4, '0')}`;
  return `TX-${str.slice(-6).toUpperCase()}`;
};

// ─── Helper: derive transaction type from order data ─────────────────────────
const deriveType = (order) => {
  const rawType = order.type ?? order.transaction_type ?? order.payment_type ?? '';
  if (rawType) return rawType;
  const status = String(order.status ?? '').toLowerCase();
  if (status === 'cancelled' || status === 'canceled') return 'Refund';
  if (status === 'completed' || status === 'delivered') return 'Sale';
  if (status.includes('payout')) return 'Payout';
  return 'Sale';
};

// ─── Helper: format display date ─────────────────────────────────────────────
const formatDate = (raw) => {
  if (!raw) return '—';
  try {
    return new Date(raw).toLocaleDateString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric',
    });
  } catch (_) {
    return raw;
  }
};

// ─── Items Popup: shows first item + clickable "+N more" badge ───────────────
const ItemsPopup = ({ items, first, rest }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative flex items-center gap-1.5" ref={ref}>
      <span className="truncate" title={first}>{first}</span>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="shrink-0 text-[8px] bg-slate-100 hover:bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full font-bold transition-colors cursor-pointer"
      >
        +{rest} more
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[180px] max-w-[260px]">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            All items in order
          </p>
          <ul className="space-y-0">
            {items.map((it, idx) => (
              <li
                key={idx}
                className="text-[10px] text-slate-700 py-1.5 border-b border-slate-100 last:border-b-0"
              >
                {it.name || 'Item'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1.5">Something went wrong</h2>
            <p className="text-gray-500 text-xs mb-4">We couldn't load the payment system.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#F5B841] text-white px-5 py-1.5 rounded-lg font-bold text-[11px]"
            >
              Reload System
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PaymentSystemContent = () => {
  const [currencySymbol,   setCurrencySymbol]   = useState('UGX');
  const [balance,          setBalance]          = useState('0.00');
  const [pendingEarnings,  setPendingEarnings]  = useState('0.00');
  const [lastPayout,       setLastPayout]       = useState('0.00');
  const [transactions,     setTransactions]     = useState([]);
  const [isFetching,       setIsFetching]       = useState(true);
  const [searchQuery,      setSearchQuery]      = useState('');
  const [currentPage,      setCurrentPage]      = useState(1);
  const [activeTab,        setActiveTab]        = useState('history'); // 'history' | 'payout'

  useEffect(() => {
    const load = async () => {
      setIsFetching(true);
      try {
        // ── Currency symbol — resolved from vendor's country ──
        const dash = await getVendorDashboard();
        if (dash?.country) setCurrencySymbol(getCurrencySymbol(dash.country));

        // ── Current Balance → GET /api/v1/payments/wallet/vendor/ ──
        const wallet = await getVendorWallet();
        const bal = wallet?.balance ?? wallet?.current_balance ?? wallet?.amount ?? 0;
        setBalance(
          Number(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
        const lp = wallet?.last_payout ?? wallet?.last_payout_amount ?? 0;
        setLastPayout(
          Number(lp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );

        // ── Pending Earnings → GET /api/v1/orders/vendor/escrow-summary/ ──
        const escrow = await getVendorEscrow();
        const held = escrow?.held_amount ?? escrow?.escrow_amount ?? escrow?.pending ?? 0;
        setPendingEarnings(
          Number(held).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );

        // ── Transaction History → GET /api/v1/orders/vendor/order-list/ ──
        const orders = await getVendorOrders();
        setTransactions(Array.isArray(orders) ? orders : []);
      } catch (e) {
        console.error('[PaymentSystem] load error:', e);
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ── Filter by transaction ID, customer name, status, or type ─────────────
  const filteredTx = transactions.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const txId = formatTransactionId(o.id).toLowerCase();
    const customerName = String(o.customer?.name ?? '').toLowerCase();
    return (
      txId.includes(q) ||
      String(o.id ?? '').toLowerCase().includes(q) ||
      String(o.status ?? '').toLowerCase().includes(q) ||
      deriveType(o).toLowerCase().includes(q) ||
      customerName.includes(q)
    );
  });

  // Pagination calculations
  const totalPages        = Math.max(1, Math.ceil(filteredTx.length / PAYMENTS_PER_PAGE));
  const safePage          = Math.min(currentPage, totalPages);
  const startIndex        = (safePage - 1) * PAYMENTS_PER_PAGE;
  const pagedTransactions = filteredTx.slice(startIndex, startIndex + PAYMENTS_PER_PAGE);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Page number buttons (show up to 5 around current page)
  const pageNumbers = (() => {
    const pages = [];
    const start = Math.max(1, safePage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  // ── Status badge styling ─────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const key = String(status ?? '').toLowerCase();
    if (key === 'completed' || key === 'delivered' || key === 'success')
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (key === 'pending')
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (key === 'cancelled' || key === 'canceled' || key === 'failed')
      return 'bg-red-50 text-red-700 border border-red-200';
    if (key === 'confirmed')
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    if (key === 'processing')
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    return 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  // ── Type icon ────────────────────────────────────────────────────────────
  const getTypeIcon = (type) => {
    const t = String(type ?? '').toLowerCase();
    if (t === 'payout') return '↗';
    if (t === 'refund') return '↙';
    return '↗'; // Sale
  };

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="payments" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 />

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">

          {/* ── Page Header ─────────────────────────────────────────────── */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Payments & Financial</h1>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Streamline your earnings, payouts, and billing in one secure place.
              </p>
            </div>
          </div>

          {/* ── Stats Grid ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <StatCard
              title="Current Balance"
              number={isFetching ? '—' : `${currencySymbol} ${balance}`}
              icon={DollarSign}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Pending Earnings"
              number={isFetching ? '—' : `${currencySymbol} ${pendingEarnings}`}
              icon={Clock}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Last Payout"
              number={isFetching ? '—' : `${currencySymbol} ${lastPayout}`}
              icon={CheckCircle}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* ── Table Controls ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-4">
            {/* Tabs */}
            <div className="flex gap-6 text-xs font-bold">
              <span
                onClick={() => setActiveTab('history')}
                className={`pb-1.5 cursor-pointer transition-colors ${
                  activeTab === 'history'
                    ? 'text-[#125852] border-b-2 border-[#125852]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Transaction History
              </span>
              {/* <span
                onClick={() => setActiveTab('payout')}
                className={`pb-1.5 cursor-pointer transition-colors ${
                  activeTab === 'payout'
                    ? 'text-[#125852] border-b-2 border-[#125852]'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Payout Settings
              </span> */}
            </div>

            {/* Search */}
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input
                  type="text"
                  placeholder="Filter by ID, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-[#F5B841] w-48"
                />
              </div>
            </div>
          </div>

          {/* ── Tab: Payout Settings (placeholder) ──────────────────────── */}
          {activeTab === 'payout' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[280px] flex flex-col items-center justify-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <CheckCircle size={24} className="text-slate-300" />
              </div>
              <p className="font-bold text-xs text-slate-800">Payout Settings</p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Payout configuration will appear here.
              </p>
            </div>
          )}

          {/* ── Tab: Transaction History ─────────────────────────────────── */}
          {activeTab === 'history' && (
            <>
              {isFetching ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[280px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F5B841]" />
                </div>

              ) : filteredTx.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[280px] flex flex-col items-center justify-center">
                  <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <History size={24} className="text-slate-300" />
                  </div>
                  <p className="font-bold text-xs text-slate-800">No transactions recorded</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Your financial activity will appear here once processed.
                  </p>
                </div>

              ) : (
                <>
                  {/* ── Table ─────────────────────────────────────────── */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table
                      className="w-full text-left text-[10px]"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Transaction ID</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Items Paid For</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedTransactions.map((order, i) => {
                          const txId      = formatTransactionId(order.id);
                          const txType    = deriveType(order);
                          const txDate    = formatDate(order.date ?? order.created_at ?? order.order_date);
                          const statusKey = String(order.status ?? '').toLowerCase();
                          const amount    = Number(order.total ?? 0).toLocaleString(undefined, {
                            minimumFractionDigits: 2, maximumFractionDigits: 2,
                          });
                          const typeIcon  = getTypeIcon(txType);

                          // ── Customer name ──────────────────────────────
                          const customerName = order.customer?.name || '—';

                          // ── Items summary ──────────────────────────────
                          const items = Array.isArray(order.items) ? order.items : [];
                          const itemsSummary = (() => {
                            if (items.length === 0) return null;
                            if (items.length === 1) return items[0].name || 'Item';
                            return { first: items[0].name || 'Item', rest: items.length - 1 };
                          })();

                          return (
                            <tr key={order.id ?? i} className="hover:bg-slate-50 transition-colors">

                              {/* Date */}
                              <td className="px-4 py-2.5 text-slate-500 font-medium whitespace-nowrap">
                                {txDate}
                              </td>

                              {/* Transaction ID */}
                              <td className="px-4 py-2.5 font-black text-[#125852] tracking-wider font-mono">
                                {txId}
                              </td>

                              {/* Customer */}
                              <td className="px-4 py-2.5 text-slate-700 font-semibold max-w-[120px]">
                                <span className="truncate block" title={customerName}>
                                  {customerName}
                                </span>
                              </td>

                              {/* Items Paid For */}
                              <td className="px-4 py-2.5 text-slate-500 max-w-[180px]">
                                {itemsSummary === null ? (
                                  <span className="text-slate-300">—</span>
                                ) : typeof itemsSummary === 'string' ? (
                                  <span className="truncate block" title={itemsSummary}>
                                    {itemsSummary}
                                  </span>
                                ) : (
                                  <ItemsPopup
                                    items={items}
                                    first={itemsSummary.first}
                                    rest={itemsSummary.rest}
                                  />
                                )}
                              </td>

                              {/* Type */}
                              <td className="px-4 py-2.5">
                                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                                  <span className="text-[11px]">{typeIcon}</span>
                                  {txType}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wide ${getStatusBadge(statusKey)}`}
                                >
                                  {order.status || '—'}
                                </span>
                              </td>

                              {/* Amount — no + prefix */}
                              <td className="px-4 py-2.5 font-bold text-slate-800 text-right whitespace-nowrap">
                                {currencySymbol} {amount}
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Pagination Footer ──────────────────────────────── */}
                  <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      Showing {filteredTx.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + PAYMENTS_PER_PAGE, filteredTx.length)} of {filteredTx.length} transactions
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => goToPage(safePage - 1)}
                        disabled={safePage === 1}
                        className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>

                      {pageNumbers.map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-7 h-7 text-[10px] font-bold rounded-md transition-colors ${
                            page === safePage
                              ? 'bg-[#125852] text-white shadow-sm'
                              : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => goToPage(safePage + 1)}
                        disabled={safePage === totalPages}
                        className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Results count footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <p>
                  {filteredTx.length} Result{filteredTx.length !== 1 ? 's' : ''}
                </p>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

const PaymentSystem = () => (
  <ErrorBoundary>
    <VendorProvider>
      <PaymentSystemContent />
    </VendorProvider>
  </ErrorBoundary>
);

export default PaymentSystem;