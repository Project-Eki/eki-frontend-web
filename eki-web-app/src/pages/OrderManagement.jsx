import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import {
  getVendorOrders,
} from '../services/authService';
import {
  Search, Filter, List, Download, Printer,
  CircleDollarSign, Clock, BarChart3, Package,
} from 'lucide-react';

// ─── Status badge colours ─────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  delivered:  'bg-emerald-100 text-emerald-700',
};

const TAB_FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

// ─── Stat Card Component (MUST be defined BEFORE it's used) ───────────────────
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

const OrderManagement = () => {
  const [orders,      setOrders]      = useState([]);
  const [isFetching,  setIsFetching]  = useState(true);
  const [activeTab,   setActiveTab]   = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalOrders  = orders.length;
  const activeOrders = orders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(String(o.status).toLowerCase())
  ).length;
  const revenue = orders.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // ── Fetch from backend ───────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setIsFetching(true);
    try {
      // Always fetch ALL orders; we filter client-side so tab clicks are instant
      const data = await getVendorOrders();
      console.log('[OrderManagement] orders received:', data);
      setOrders(data);
    } catch (_) {
      setOrders([]);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30_000); // poll every 30 s
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // ── Client-side tab + search filter ─────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    const matchesTab =
      activeTab === 'All' ||
      String(order.status ?? '').toLowerCase() === activeTab.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(order.id       ?? '').toLowerCase().includes(q) ||
      String(order.customer ?? '').toLowerCase().includes(q);

    return matchesTab && matchesSearch;
  });

  const currencySymbol = 'UGX';

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar activePage="orders" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Order Management</h1>
              <p className="text-slate-400 text-[11px] mt-0.5">View and process incoming customer orders.</p>
            </div>
            <div className="flex gap-1.5">
              <button className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition text-[10px] font-bold shadow-sm">
                <Download size={12} /> Export Data
              </button>
              <button className="bg-[#F5B841] text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#E0A83B] transition text-[10px] font-bold shadow-sm">
                <Printer size={12} /> Print Manifests
              </button>
            </div>
          </div>

          {/* Stats Grid - Updated to match VendorDashboard style */}
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

          {/* Search and Filters */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm mb-5 flex items-center justify-between">
            <div className="flex gap-4 items-center flex-1">
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Order ID or Customer..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F5B841] transition font-medium"
                />
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {TAB_FILTERS.map((tab) => (
                  <span
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`cursor-pointer pb-1 transition-colors ${
                      activeTab === tab
                        ? 'text-[#125852] border-b-2 border-[#125852]'
                        : 'hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition">
              <Filter size={12} /> Filters
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-slate-300 w-3 h-3" /></th>
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
                  /* Loading skeleton */
                  [...Array(4)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      <td colSpan="7" className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  /* Empty state */
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <List size={24} className="text-slate-200" />
                        </div>
                        <p className="text-xs font-bold text-slate-900">No orders found</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
                          When you receive orders, they will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  /* Live rows */
                  filteredOrders.map((order, i) => {
                    const statusKey  = String(order.status ?? '').toLowerCase();
                    const badgeClass = STATUS_STYLES[statusKey] ?? 'bg-slate-100 text-slate-600';

                    const displayDate = order.date
                      ? (() => {
                          try { return new Date(order.date).toLocaleDateString(); }
                          catch (_) { return order.date; }
                        })()
                      : '—';

                    return (
                      <tr key={order.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <input type="checkbox" className="rounded border-slate-300 w-3 h-3" />
                        </td>
                        <td className="px-4 py-3 text-[10px] text-[#125852] font-bold">
                          #{order.id}
                        </td>
                        <td className="px-4 py-3 text-[10px]">
                          {order.customer}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-500">
                          {displayDate}
                        </td>
                        <td className="px-4 py-3 text-[10px] font-bold">
                          {currencySymbol} {Number(order.total ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${badgeClass}`}>
                            {order.status ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/order-management/${order.id}`}
                            className="px-2.5 py-1 bg-[#125852] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#0e4440] transition-colors"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-white">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredOrders.length} of {orders.length} results
              </p>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-400 cursor-not-allowed">Previous</button>
                <button className="w-7 h-7 text-[10px] font-bold bg-[#125852] text-white rounded-md shadow-sm">1</button>
                <button className="px-2.5 py-1 text-[10px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - exactly matching VendorDashboard */}
        <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
      </div>
    </div>
  );
};

export default OrderManagement;