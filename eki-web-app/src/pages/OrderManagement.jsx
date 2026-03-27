import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/eki-logo-white.png';
import Navbar3 from '../components/adminDashboard/Navbar3';
import { 
  Search, Filter, List, Bell, Package, 
  Settings, LogOut, Download, Printer, 
  CircleDollarSign, Clock, BarChart3,
  LayoutDashboard, ShoppingBag, Truck, CreditCard, MessageSquare
} from 'lucide-react';

const OrderManagement = () => {
  const orders = []; // Array is empty, no dummy rows will show

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
          <SidebarNavLink to="/order-management" icon={<Truck size={18} />} label="Orders" active />
          <SidebarNavLink to="/payment" icon={<CreditCard size={18} />} label="Payments" />
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

        {/* Dashboard Content Area */}
        <main className="p-8 max-w-[1400px] mx-auto w-full pb-24">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">Order Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">View and process incoming customer orders.</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition text-xs font-bold shadow-sm">
                <Download size={14} /> Export Data
              </button>
              <button className="bg-[#F5B841] text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#E0A83B] transition text-xs font-bold shadow-sm">
                <Printer size={14} /> Print Manifests
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Orders" value="0" sub="0% from last month" icon={<Package size={18} className="text-teal-600"/>} bg="bg-[#E0F2F1]" />
            <StatCard title="Active Orders" value="0" sub="0 urgent orders" icon={<Clock size={18} className="text-orange-500"/>} bg="bg-[#FFF8E1]" />
            <StatCard title="Revenue" value="UGX 0" sub="0% increase" icon={<CircleDollarSign size={18} className="text-teal-600"/>} bg="bg-[#E0F2F1]" />
            <StatCard title="Avg. Processing" value="0 Days" sub="0 days from avg." icon={<BarChart3 size={18} className="text-orange-500"/>} bg="bg-[#FFF8E1]" />
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center justify-between">
            <div className="flex gap-6 items-center flex-1">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Customer..." 
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] transition font-medium" 
                />
              </div>
              <div className="flex gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-[#125852] cursor-pointer border-b-2 border-[#125852] pb-1">All</span>
                <span className="hover:text-slate-600 cursor-pointer">Pending</span>
                <span className="hover:text-slate-600 cursor-pointer">Confirmed</span>
                <span className="hover:text-slate-600 cursor-pointer">Completed</span>
                <span className="hover:text-slate-600 cursor-pointer">Cancelled</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition">
              <Filter size={14} /> Filters
            </button>
          </div>

          {/* Empty Table UI */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-slate-300" /></th>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="py-28 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <List size={32} className="text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">No orders found</p>
                      <p className="text-xs text-slate-400 mt-1 font-medium">When you receive orders, they will appear here.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Showing 0 of 0 results</p>
              <div className="flex items-center gap-1.5">
                <button className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-md text-slate-400 cursor-not-allowed">Previous</button>
                <button className="w-8 h-8 text-[11px] font-bold bg-[#125852] text-white rounded-md shadow-sm">1</button>
                <button className="px-3 py-1.5 text-[11px] font-bold border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50">Next</button>
              </div>
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

// Sidebar Navigation Link Component - Matching VendorDashboard exactly
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

const StatCard = ({ title, value, sub, icon, bg }) => (
  <div className={`${bg} p-6 rounded-2xl border border-slate-200 shadow-sm text-left`}>
    <div className="p-2 bg-white rounded-lg shadow-sm w-fit mb-3">{icon}</div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-xl font-bold text-slate-900">{value}</h3>
    <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-tight">{sub}</p>
  </div>
);

export default OrderManagement;