import React from 'react';
import { 
  Search, Bell, Users, Store, LayoutGrid, 
  CreditCard, ShoppingCart, BarChart3, Settings, 
  LogOut, Download, Filter, ChevronRight,
  Wallet, Landmark, Clock, Percent
} from 'lucide-react';
import Footer from "../components/Vendormanagement/VendorFooter";

const PaymentAndPayout = () => {
  const transactions = [];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] text-slate-700" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        <div className="p-6 mb-4">
          <div className="bg-[#0b5d51] w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg italic">ë</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<Users size={18}/>} label="Users" />
          <NavItem icon={<Store size={18}/>} label="Vendors" />
          <NavItem icon={<LayoutGrid size={18}/>} label="Listings" />
          <NavItem icon={<CreditCard size={18}/>} label="Payments" active />
          <NavItem icon={<ShoppingCart size={18}/>} label="Orders" />
          <NavItem icon={<BarChart3 size={18}/>} label="Analytics" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1">
          <NavItem icon={<Settings size={18}/>} label="Setting" />
          <NavItem icon={<LogOut size={18}/>} label="Log out" color="text-red-500" />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-lg font-bold text-slate-800">Payments & Payouts</h2>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search" 
              className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:ring-1 ring-[#0b5d51] outline-none" 
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer p-2 hover:bg-gray-50 rounded-full transition">
              <Bell size={20} className="text-gray-500" />
              <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></div>
            </div>
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">Admin User</p>
                <p className="text-[10px] text-gray-400 font-medium mt-1">Super Admin</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Admin+User&background=0b5d51&color=fff" 
                className="w-8 h-8 rounded-full border border-gray-100 shadow-sm" 
                alt="profile" 
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 flex-1">
          
          {/* Platform Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <AdminStatCard title="Total Processed (MTD)" value="$0.00" trend="+0%" icon={<Wallet size={16}/>} />
            <AdminStatCard title="Funds in Holdings" value="$0.00" trend="+0%" icon={<Landmark size={16}/>} />
            <AdminStatCard title="Pending Payouts" value="$0.00" trend="0" icon={<Clock size={16}/>} />
            <AdminStatCard title="Platform Fees (MTD)" value="$0.00" trend="+0%" icon={<Percent size={16}/>} />
          </div>

          {/* Section Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4 p-1 bg-gray-100/50 rounded-lg">
              <button className="px-4 py-1.5 text-xs font-bold bg-white text-slate-700 shadow-sm rounded-md transition">Transaction History</button>
              <button className="px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-slate-600 transition">Payout Management</button>
            </div>
            <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-gray-50 transition">
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Payment Ledger Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800">Payment Ledger</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Comprehensive list of all inbound customer transactions.</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Find by ID or User" 
                    className="pl-9 pr-4 py-1.5 border border-gray-100 bg-gray-50/50 rounded-lg text-xs outline-none focus:ring-1 ring-[#0b5d51]" 
                  />
                </div>
                <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50"><Filter size={14}/></button>
              </div>
            </div>

            <table className="w-full text-left">
              <thead className="bg-white">
                <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">TXN ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <CreditCard size={24} className="text-gray-200" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 tracking-tight">No inbound transactions found</p>
                        <p className="text-[11px] text-gray-300">New payments will be logged here automatically.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50">
                      {/* Mapping logic */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination / Count */}
            <div className="px-6 py-4 bg-gray-50/30 flex justify-between items-center text-[11px] font-bold text-gray-400">
              <p>Showing 0 of 0 transactions</p>
              <div className="flex gap-2">
                <button className="px-4 py-1.5 border border-gray-200 bg-white rounded-md hover:bg-gray-50 transition cursor-not-allowed">Previous</button>
                <button className="px-4 py-1.5 bg-[#f0ad4e] text-white rounded-md hover:bg-[#ec971f] transition">Next</button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

// --- Small Helper Components ---

const NavItem = ({ icon, label, active, color = "text-gray-400" }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${active ? 'bg-[#2d6a61] text-white' : `${color} hover:bg-gray-50 hover:text-slate-800`}`}
    style={{ fontFamily: "'Poppins', sans-serif" }}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
    {active && <div className="ml-auto w-1 h-4 bg-white/30 rounded-full"></div>}
  </div>
);

const AdminStatCard = ({ title, value, trend, icon }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" style={{ fontFamily: "'Poppins', sans-serif" }}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-50 rounded-lg text-slate-400">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400">{trend}</span>
    </div>
    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">{title}</h4>
    <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default PaymentAndPayout;