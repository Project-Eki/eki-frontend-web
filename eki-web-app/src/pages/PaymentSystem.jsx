import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/eki-logo-white.png';
import Navbar3 from '../components/adminDashboard/Navbar3';
import { 
  Search, Filter, List, Plus, Bell, Package, 
  Settings, LogOut, ChevronRight, Download, 
  History, DollarSign, Clock, CheckCircle,
  LayoutDashboard, ShoppingBag, Truck, CreditCard, MessageSquare
} from 'lucide-react';

// --- Sub-Components ---

const SidebarNavLink = ({ to, icon, label, active = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active
        ? 'bg-[#FFF8ED] text-[#F2B53D]'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon} <span>{label}</span>
  </Link>
);

const PaymentCard = ({ title, value, badge, icon, bg = "bg-white", iconColor = "text-[#0b5d51]" }) => (
  <div className={`${bg} p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden text-left`}>
    <div className="p-2 bg-white rounded-lg shadow-sm w-fit mb-3">
      {icon}
    </div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-xl font-bold text-slate-900">{value}</h3>
    <span className="text-[10px] text-slate-400 mt-2 font-bold tracking-tight inline-block">{badge}</span>
  </div>
);

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
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">We couldn't load the payment system.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-[#F5B841] text-white px-6 py-2 rounded-lg font-bold text-sm"
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

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-4 gap-4">
      {/* SIDEBAR - with rounded corners and NO separators */}
      <aside className="w-64 bg-white border border-slate-200 rounded-2xl flex flex-col sticky top-4 h-[calc(100vh-2rem)] shadow-sm">
        {/* Logo */}
        <div className="p-6 pt-8 pb-6">
          <img src={logo} alt="Eki" className="h-12 w-auto object-contain mx-auto" />
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarNavLink to="/vendordashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarNavLink to="/product-dashboard" icon={<ShoppingBag size={18} />} label="Products" />
          <SidebarNavLink to="/servicemanagement" icon={<Package size={18} />} label="Services" />
          <SidebarNavLink to="/order-management" icon={<Truck size={18} />} label="Orders" />
          <SidebarNavLink to="/payment" icon={<CreditCard size={18} />} label="Payments" active />
          <SidebarNavLink to="/reviews" icon={<MessageSquare size={18} />} label="Reviews" />
          <SidebarNavLink to="/settings" icon={<Settings size={18} />} label="Store Settings" />
        </nav>
        
        <div className="p-4">
          <button
            onClick={() => console.log('logout')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {/* Dashboard Body */}
        <main className="p-8 max-w-[1400px] mx-auto w-full pb-24">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Payments & Financial</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your earnings, payouts, and billing methods securely.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition shadow-sm font-bold text-xs">
                <History size={14} /> History
              </button>
              <button className="bg-[#F5B841] text-white px-4 py-2 rounded-lg hover:bg-[#E0A83B] transition shadow-sm font-bold text-xs">
                Request Payout
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <PaymentCard title="Current Balance" value="$0.00" badge="+0% this month" icon={<DollarSign size={18} className="text-teal-600"/>} bg="bg-[#E0F2F1]" />
            <PaymentCard title="Pending Earnings" value="$0.00" badge="0 orders in escrow" icon={<Clock size={18} className="text-orange-500"/>} bg="bg-[#FFF8E1]" />
            <PaymentCard title="Last Payout" value="$0.00" badge="Oct 15, 2023" icon={<CheckCircle size={18} className="text-teal-600"/>} bg="bg-[#E0F2F1]" />
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-8 text-sm font-bold">
              <span className="text-[#125852] border-b-2 border-[#125852] pb-2 cursor-pointer">Transaction History</span>
              <span className="text-slate-400 hover:text-slate-700 cursor-pointer transition">Payout Settings</span>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter by ID..." 
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F5B841]" 
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Empty Table Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[350px] flex flex-col items-center justify-center">
            <div className="bg-slate-50 p-5 rounded-full mb-4">
              <History size={32} className="text-slate-300" />
            </div>
            <p className="font-bold text-slate-800">No transactions recorded</p>
            <p className="text-xs text-slate-400 mt-1">Your financial activity will appear here once processed.</p>
          </div>

          {/* Footer Pagination */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <p>0 of 0 Results</p>
            <div className="flex gap-2">
              <button className="px-5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">Previous</button>
              <button className="px-5 py-2 bg-[#F5B841] text-white rounded-lg hover:bg-[#E0A83B] transition">Next</button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#125852] text-white py-4 px-8 flex justify-between items-center text-[9px] rounded-xl mx-8 mb-4">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
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