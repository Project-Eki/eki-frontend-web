import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const load = async () => {
      setIsFetching(true);
      try {
        // ── Currency symbol ──
        const dash = await getVendorDashboard();
        if (dash?.country) setCurrencySymbol(getCurrencySymbol(dash.country));

        // ── Current Balance  →  GET /api/v1/payments/wallet/vendor/ ──
        const wallet = await getVendorWallet();
        const bal = wallet?.balance ?? wallet?.current_balance ?? wallet?.amount ?? 0;
        setBalance(
          Number(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );
        const lp = wallet?.last_payout ?? wallet?.last_payout_amount ?? 0;
        setLastPayout(
          Number(lp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );

        // ── Pending Earnings  →  GET /api/v1/orders/vendor/escrow-summary/ ──
        const escrow = await getVendorEscrow();
        const held = escrow?.held_amount ?? escrow?.escrow_amount ?? escrow?.pending ?? 0;
        setPendingEarnings(
          Number(held).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        );

        // ── Transaction History  →  GET /api/v1/orders/vendor/order-list/ ──
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

  const filteredTx = transactions.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      String(o.id ?? '').toLowerCase().includes(q) ||
      String(o.status ?? '').toLowerCase().includes(q)
    );
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTx.length / PAYMENTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAYMENTS_PER_PAGE;
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
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  })();

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="payments" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 />

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Payments & Financial</h1>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Streamline your earnings, payouts, and billing in one secure place.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
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

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6 text-xs font-bold">
              <span className="text-[#125852] border-b-2 border-[#125852] pb-1.5 cursor-pointer">
                Transaction History
              </span>
              <span className="text-slate-400 hover:text-slate-700 cursor-pointer transition">
                Payout Settings
              </span>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input
                  type="text"
                  placeholder="Filter by ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-[#F5B841] w-48"
                />
              </div>
            </div>
          </div>

          {/* Table / Empty / Loading */}
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table
                  className="w-full text-left text-[10px]"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px]">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedTransactions.map((order, i) => {
                      const customerDisplay =
                        typeof order.customer === 'object' && order.customer !== null
                          ? order.customer.name || order.customer.email || '—'
                          : order.customer ?? '—';

                      const displayDate = order.date
                        ? (() => {
                            try { return new Date(order.date).toLocaleDateString(); }
                            catch (_) { return order.date; }
                          })()
                        : '—';

                      const statusKey = String(order.status ?? '').toLowerCase();
                      const badgeClass =
                        statusKey === 'completed' || statusKey === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : statusKey === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : statusKey === 'cancelled' || statusKey === 'canceled'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : statusKey === 'confirmed'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : statusKey === 'processing'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200';

                      return (
                        <tr key={order.id ?? i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2.5 font-black text-[#125852] tracking-wider font-mono">
                            #{String(order.id ?? '').padStart(6, '0')}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700 font-medium">
                            {customerDisplay}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{displayDate}</td>
                          <td className="px-4 py-2.5 font-bold text-slate-800">
                            {currencySymbol} {Number(order.total ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wide ${badgeClass}`}
                            >
                              {order.status || '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
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

          {/* Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <p>
              {filteredTx.length} Result{filteredTx.length !== 1 ? 's' : ''}
            </p>
          </div>
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