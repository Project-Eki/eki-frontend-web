import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import { 
  Search, Filter, List, Bell, Package, 
  Settings, LogOut, Download, Printer, 
  CircleDollarSign, Clock, BarChart3, ChevronRight
} from 'lucide-react';

const OrderManagement = () => {
  const location = useLocation();
  const orders = []; // Array is empty, no dummy rows will show

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-700 overflow-hidden">
      {/* Sidebar - Matching the slim profile in the image */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
        <div className="p-5 mb-2">
          <Link to="/vendor-dashboard">
            <img src={logoImage} alt="Logo" className="w-6 h-6 object-contain" />
          </Link>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <NavItem to="/product-dashboard" icon={<Package size={18}/>} label="Products" />
          <NavItem to="/services" icon={<Settings size={18}/>} label="Services" />
          <NavItem to="/order-management" icon={<List size={18}/>} label="Orders" active={true} />
          <NavItem to="/payment" icon={<CircleDollarSign size={18}/>} label="Payments" />
          <NavItem to="/reviews" icon={<Search size={18}/>} label="Reviews" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1">
          <NavItem to="/settings" icon={<Settings size={18}/>} label="Store Settings" />
          <NavItem to="/sign-in" icon={<LogOut size={18}/>} label="Log out" color="text-red-500" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-8 gap-4 shrink-0">
          <div className="relative cursor-pointer p-1.5 hover:bg-gray-50 rounded-full transition">
            <Bell size={19} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex items-center gap-3 pl-4 border-l ml-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor</p>
            <img 
              src="https://ui-avatars.com/api/?name=Vendor&background=0b5d51&color=fff" 
              className="w-8 h-8 rounded-full border border-gray-200" 
              alt="profile" 
            />
          </div>
        </header>

        {/* Dashboard Content Area */}
        <div className="p-8 max-w-[1440px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Order Management</h1>
              <p className="text-slate-400 text-sm mt-0.5">View and process incoming customer orders.</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white border border-gray-200 text-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition text-xs font-bold shadow-sm">
                <Download size={14} /> Export Data
              </button>
              <button className="bg-[#EFB034] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 hover:brightness-105 transition text-xs font-bold shadow-sm">
                <Printer size={14} /> Print Manifests
              </button>
            </div>
          </div>

          {/* Stats Grid - Reset to 0 */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Orders" value="0" sub="0% from last month" icon={<Package size={18} className="text-teal-600"/>} bg="bg-teal-50" />
            <StatCard title="Active Orders" value="0" sub="0 urgent orders" icon={<Clock size={18} className="text-orange-500"/>} bg="bg-orange-50" />
            <StatCard title="Revenue" value="UGX 0" sub="0% increase" icon={<CircleDollarSign size={18} className="text-teal-600"/>} bg="bg-teal-50" />
            <StatCard title="Avg. Processing" value="0 Days" sub="0 days from avg." icon={<BarChart3 size={18} className="text-orange-500"/>} bg="bg-orange-50" />
          </div>

          {/* Search and Filters */}
          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-6 flex items-center justify-between">
            <div className="flex gap-6 items-center flex-1">
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by Order ID or Customer..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-1 ring-teal-600/20 transition font-medium" 
                />
              </div>
              <div className="flex gap-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className="text-teal-700 cursor-pointer border-b-2 border-teal-700 pb-1">All</span>
                <span className="hover:text-slate-600 cursor-pointer">Pending</span>
                <span className="hover:text-slate-600 cursor-pointer">Confirmed</span>
                <span className="hover:text-slate-600 cursor-pointer">Completed</span>
                <span className="hover:text-slate-600 cursor-pointer">Cancelled</span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-gray-50 shadow-sm transition">
              <Filter size={14} /> Filters
            </button>
          </div>

          {/* Empty Table UI */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] border-b border-gray-50">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300" /></th>
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

            {/* Pagination match */}
            <div className="p-4 border-t border-gray-50 flex justify-between items-center bg-white">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Showing 0 of 0 results</p>
              <div className="flex items-center gap-1.5">
                <button className="px-3 py-1.5 text-[11px] font-bold border border-gray-200 rounded-md text-slate-400 cursor-not-allowed">Previous</button>
                <button className="w-8 h-8 text-[11px] font-bold bg-teal-800 text-white rounded-md shadow-sm">1</button>
                <button className="px-3 py-1.5 text-[11px] font-bold border border-gray-200 rounded-md text-slate-600 hover:bg-gray-50">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <footer className="mt-auto bg-[#0b3d37] text-white py-3.5 px-8 flex justify-between items-center text-[10px] font-medium tracking-wide">
          <p className="opacity-70 uppercase tracking-[0.15em] font-bold">Buy Smart. Sell Fast. Grow Together...</p>
          <div className="flex gap-6 opacity-60 uppercase font-bold tracking-widest">
            <Link to="#" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, to, color = "text-slate-500" }) => (
  <Link to={to} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group ${active ? 'bg-teal-800 text-white shadow-md shadow-teal-900/10' : `${color} hover:bg-slate-50 hover:text-slate-900`}`}>
    <span className={active ? 'text-white' : 'text-slate-300 group-hover:text-teal-700 transition-colors'}>{icon}</span>
    <span className="text-[13px] font-bold tracking-tight">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-40" />}
  </Link>
);

const StatCard = ({ title, value, sub, icon, bg }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow">
    <div className="flex flex-col">
      <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</h4>
      <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
      <p className="text-[10px] text-slate-400 mt-2 font-bold tracking-tight">{sub}</p>
    </div>
    <div className={`${bg} p-2.5 rounded-xl flex items-center justify-center shrink-0`}>
      {icon}
    </div>
  </div>
);

export default OrderManagement;