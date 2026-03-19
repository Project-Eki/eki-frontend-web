import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Added for navigation
import logoImage from '../assets/logo.jpeg';
import { 
  Search, Filter, LayoutGrid, List, ArrowUpDown, 
  Plus, Bell, Package, Eye, AlertTriangle, CheckCircle,
  Settings, LogOut, ChevronRight, Download, Printer, MoreVertical
} from 'lucide-react';

const OrderManagement = () => {
  const location = useLocation(); // To handle active states dynamically
  const orders = [];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-slate-700">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        <div className="p-6 mb-4">
          <Link to="/vendor-dashboard" className="flex items-center gap-2">
             {/* Integrated your logoImage here */}
             <img src={logoImage} alt="Eki Logo" className="w-5 h-auto rounded" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem to="/product-dashboard" icon={<Package size={20}/>} label="Products" active={location.pathname === '/product-dashboard'} />
          <NavItem to="/services" icon={<Settings size={20}/>} label="Services" active={location.pathname === '/services'} />
          <NavItem to="/order-management" icon={<List size={20}/>} label="Orders" active={true} />
          <NavItem to="/payment" icon={<Plus size={20}/>} label="Payments" active={location.pathname === '/payment'} />
          <NavItem to="/reviews" icon={<Search size={20}/>} label="Reviews and Ratings" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1">
          <NavItem to="/settings" icon={<Settings size={20}/>} label="Store Settings" />
          {/* Linked to sign in as per your preference */}
          <NavItem to="/login" icon={<LogOut size={20}/>} label="Log out" color="text-red-500" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-50 flex items-center justify-end px-8 gap-6 sticky top-0 z-20">
          <div className="relative cursor-pointer p-2 hover:bg-gray-50 rounded-full transition">
            <Bell size={20} className="text-gray-500" />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex items-center gap-3 border-l pl-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800 leading-none">Vendor</p>
            </div>
            <img 
              src="https://ui-avatars.com/api/?name=Vendor&background=0b5d51&color=fff" 
              className="w-9 h-9 rounded-full border border-gray-200" 
              alt="profile" 
            />
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 flex-1">
          {/* Title and Action Buttons */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
              <p className="text-gray-400 text-sm mt-1">View and process incoming customer orders.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-sm font-bold text-sm">
                <Download size={16} /> Export Data
              </button>
              <button className="bg-[#f59e0b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#d97706] transition shadow-sm font-bold text-sm">
                <Printer size={16} /> Print Manifests
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Orders" value="0" sub="0% from last month" icon={<Package className="text-[#0b5d51]"/>} bg="bg-emerald-50" />
            <StatCard title="Active Orders" value="0" sub="0 urgent orders" icon={<div className="text-amber-500">🕒</div>} bg="bg-amber-50" />
            <StatCard title="Revenue" value="UGX 0" sub="0% increase" icon={<div className="text-emerald-600">💰</div>} bg="bg-emerald-50" />
            <StatCard title="Avg. Processing" value="0 Days" sub="0 days from avg." icon={<div className="text-amber-500">📊</div>} bg="bg-amber-50" />
          </div>

          {/* Table Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6 shadow-sm flex items-center justify-between">
            <div className="flex gap-6 items-center flex-1">
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Customer..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-1 ring-[#0b5d51] outline-none transition" 
                />
              </div>
              {/* Status Filters */}
              <div className="flex gap-4 text-sm font-bold text-gray-400">
                <span className="text-[#0b5d51] border-b-2 border-[#0b5d51] pb-1 cursor-pointer">All</span>
                <span className="hover:text-slate-700 cursor-pointer">Pending</span>
                <span className="hover:text-slate-700 cursor-pointer">Confirmed</span>
                <span className="hover:text-slate-700 cursor-pointer">Completed</span>
                <span className="hover:text-slate-700 cursor-pointer">Cancelled</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-gray-50">
              <Filter size={16} /> Filters
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 w-10"><input type="checkbox" className="rounded" /></th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <List size={48} className="mb-4 opacity-20" />
                        <p className="font-bold">No orders found</p>
                        <p className="text-sm font-medium">When you receive orders, they will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer">
                      {/* Data mapping w */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400">
            <p>Showing 0 of 0 results</p>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <div className="flex gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded bg-[#0b5d51] text-white">1</button>
                <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">2</button>
              </div>
              <button className="px-4 py-2 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <footer className="mt-auto bg-[#0b3d37] text-white p-4 px-8 flex justify-between items-center text-[10px] font-medium tracking-wide">
          <p className="opacity-80 uppercase tracking-widest font-bold">Buy Smart. Sell Fast. Grow Together...</p>
          <p className="opacity-60">© 2026 Vendor Portal. All rights reserved.</p>
          <div className="flex gap-6 opacity-80 uppercase">
            <Link to="/support" className="hover:underline">Support</Link>
            <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="hover:underline">Terms of Service</Link>
            <span className="cursor-pointer hover:underline">Ijoema ltd</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

// Helper Nav Component - Updated to use Link
const NavItem = ({ icon, label, active, to, color = "text-gray-400" }) => (
  <Link to={to} className="block no-underline">
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-[#0b5d51] text-white shadow-md' : `${color} hover:bg-gray-50 hover:text-slate-900`}`}>
      <div className={active ? 'text-white' : 'group-hover:text-[#0b5d51]'}>{icon}</div>
      <span className="text-[13px] font-bold tracking-tight">{label}</span>
      {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </div>
  </Link>
);

const StatCard = ({ title, value, sub, icon, bg }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center`}>{icon}</div>
    </div>
    <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none">{title}</h4>
    <div className="mt-2 flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</span>
    </div>
    <p className="text-[11px] text-gray-400 mt-2 font-bold tracking-tighter">{sub}</p>
  </div>
);

export default OrderManagement;