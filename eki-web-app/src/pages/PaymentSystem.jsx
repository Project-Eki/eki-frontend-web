import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar4 from '../components/adminDashboard/Navbar4';
import Footer from "../components/Vendormanagement/VendorFooter";
import { 
  Search, Download, History, DollarSign, Clock, CheckCircle,
  CreditCard, Box, ListChecks, Package
} from 'lucide-react';

import { getVendorDashboard } from '../services/authService';

// ── FIXED: import the currency utility ────────────────────────────────────────
import { getCurrencySymbol } from '../utils/currency';

// ─── Stat Card Component (exactly matching VendorDashboard) ───────────────────
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

// --- Error Boundary ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
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
  const transactions = [];

  // ── FIXED: dynamic currency state instead of hardcoded '$' ──────────────────
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // ── FIXED: fetch vendor country and resolve currency on mount ────────────────
  useEffect(() => {
    getVendorDashboard()
      .then((data) => {
        if (data?.country) {
          setCurrencySymbol(getCurrencySymbol(data.country));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar activePage="payments" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar4 />

        {/* Dashboard Body */}
        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          <div className="flex justify-between items-start mb-5">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">Payments & Financial</h1>
              <p className="text-slate-400 text-[11px] mt-0.5">Manage your earnings, payouts, and billing methods securely.</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-slate-50 transition shadow-sm font-bold text-[10px]">
                <History size={12} /> History
              </button>
              <button className="bg-[#F5B841] text-white px-3 py-1.5 rounded-lg hover:bg-[#E0A83B] transition shadow-sm font-bold text-[10px]">
                Request Payout
              </button>
            </div>
          </div>

          {/* Stats Grid — FIXED: use currencySymbol state instead of hardcoded '$' */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <StatCard
              title="Current Balance"
              number={`${currencySymbol} 0.00`}
              icon={DollarSign}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Pending Earnings"
              number={`${currencySymbol} 0.00`}
              icon={Clock}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Last Payout"
              number={`${currencySymbol} 0.00`}
              icon={CheckCircle}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-6 text-xs font-bold">
              <span className="text-[#125852] border-b-2 border-[#125852] pb-1.5 cursor-pointer">Transaction History</span>
              <span className="text-slate-400 hover:text-slate-700 cursor-pointer transition">Payout Settings</span>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                <input 
                  type="text" 
                  placeholder="Filter by ID..." 
                  className="pl-8 pr-3 py-1 border border-slate-200 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-[#F5B841] w-48" 
                />
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50">
                <Download size={10} /> Export CSV
              </button>
            </div>
          </div>

          {/* Empty Table Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[280px] flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-4 rounded-full mb-3">
              <History size={24} className="text-slate-300" />
            </div>
            <p className="font-bold text-xs text-slate-800">No transactions recorded</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Your financial activity will appear here once processed.</p>
          </div>

          {/* Footer Pagination */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <p>0 of 0 Results</p>
            <div className="flex gap-1.5">
              <button className="px-4 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition text-[10px]">Previous</button>
              <button className="px-4 py-1.5 bg-[#F5B841] text-white rounded-lg hover:bg-[#E0A83B] transition text-[10px]">Next</button>
            </div>
          </div>
        </main>

        {/* Imported Footer Component replacing the inline one */}
        <Footer />
      </div>
    </div>
  );
};

// Final Wrapped Component
const PaymentSystem = () => {
  return (
    <ErrorBoundary>
      <PaymentSystemContent />
    </ErrorBoundary>
  );
};

export default PaymentSystem;