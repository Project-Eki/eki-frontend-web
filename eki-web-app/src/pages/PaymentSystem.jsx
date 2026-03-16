import React from 'react';
import { 
  Search, Filter, List, Plus, Bell, Package, 
  Settings, LogOut, ChevronRight, Download, 
  History, DollarSign, Clock, CheckCircle
} from 'lucide-react';

// --- Sub-Components ---

const NavItem = ({ icon, label, active, color = "text-gray-400" }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${active ? 'bg-[#0b5d51] text-white shadow-md' : `${color} hover:bg-gray-50 hover:text-slate-900`}`}>
    <div className={active ? 'text-white' : 'group-hover:text-[#0b5d51]'}>{icon}</div>
    <span className="text-[13px] font-bold tracking-tight">{label}</span>
    {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
  </div>
);

const PaymentCard = ({ title, value, badge, icon, bg = "bg-white", iconColor = "text-[#0b5d51]" }) => (
  <div className={`${bg} p-8 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden`}>
    <div className="flex justify-between items-start mb-6">
      <div className={`bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm ${iconColor}`}>
        {icon}
      </div>
      <span className="text-[9px] font-black border border-gray-100 rounded-full bg-white px-3 py-1 text-slate-400 uppercase tracking-tighter shadow-sm">
        {badge}
      </span>
    </div>
    <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{title}</h4>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</span>
    </div>
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
              className="bg-[#0b5d51] text-white px-6 py-2 rounded-lg font-bold text-sm"
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
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans text-slate-700">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-30">
        <div className="p-6 mb-4">
          <div className="bg-[#0b5d51] w-8 h-8 rounded flex items-center justify-center text-white font-bold text-lg">ë</div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<Package size={18}/>} label="Products" />
          <NavItem icon={<Settings size={18}/>} label="Services" />
          <NavItem icon={<List size={18}/>} label="Orders" />
          <NavItem icon={<Plus size={18}/>} label="Payments" active />
          <NavItem icon={<Search size={18}/>} label="Reviews and Ratings" />
        </nav>

        <div className="p-4 border-t border-gray-50 space-y-1 mt-auto">
          <NavItem icon={<Settings size={18}/>} label="Store Settings" />
          <NavItem icon={<LogOut size={18}/>} label="Log out" color="text-red-500" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-50 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="relative w-96 ml-auto mr-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="Search payment method" 
              className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:ring-1 ring-[#0b5d51] outline-none" 
            />
          </div>
          <div className="flex items-center gap-6">
            <Bell size={20} className="text-gray-500 cursor-pointer" />
            <div className="flex items-center gap-3 border-l pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">Vendor</p>
                <p className="text-[10px] text-gray-400 font-medium">Member</p>
              </div>
              <img 
                src="https://ui-avatars.com/api/?name=Vendor&background=0b5d51&color=fff" 
                className="w-8 h-8 rounded-full border border-gray-200" 
                alt="profile" 
              />
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-8 flex-1">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payments & Financial</h1>
              <p className="text-gray-400 text-sm mt-1">Manage your earnings, payouts, and billing methods securely.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-gray-200 text-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition shadow-sm font-bold text-xs">
                <History size={14} /> History
              </button>
              <button className="bg-[#0b5d51] text-white px-4 py-2 rounded-lg hover:bg-[#084a41] transition shadow-sm font-bold text-xs">
                Request Payout
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            <PaymentCard title="Current Balance" value="$0.00" badge="+0% this month" icon={<DollarSign size={16}/>} />
            <PaymentCard title="Pending Earnings" value="$0.00" badge="0 orders in escrow" icon={<Clock size={16}/>} bg="bg-cyan-50/50" iconColor="text-cyan-600" />
            <PaymentCard title="Last Payout" value="$0.00" badge="Oct 15, 2023" icon={<CheckCircle size={16}/>} bg="bg-amber-50/50" iconColor="text-amber-600" />
          </div>

          {/* Table Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-8 text-sm font-bold">
              <span className="text-[#0b5d51] border-b-2 border-[#0b5d51] pb-2 cursor-pointer">Transaction History</span>
              <span className="text-gray-400 hover:text-slate-700 cursor-pointer transition">Payout Settings</span>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Filter by ID..." 
                  className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 ring-[#0b5d51]" 
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-gray-50">
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Empty Table Placeholder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[350px] flex flex-col items-center justify-center">
             <div className="bg-gray-50 p-5 rounded-full mb-4">
                <History size={32} className="text-gray-300" />
             </div>
             <p className="font-bold text-slate-800">No transactions recorded</p>
             <p className="text-xs text-gray-400 mt-1">Your financial activity will appear here once processed.</p>
          </div>

          {/* Footer Pagination */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            <p>0 of 0 Results</p>
            <div className="flex gap-2">
              <button className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Previous</button>
              <button className="px-5 py-2 bg-[#f0ad4e] text-white rounded-lg hover:bg-[#ec971f] transition">Next</button>
            </div>
          </div>
        </div>

        {/* Global Footer */}
        <footer className="mt-auto bg-[#0b3d37] text-white p-4 px-8 flex justify-between items-center text-[10px] font-medium">
          <p className="opacity-80 font-bold">Buy Smart. Sell Fast. Grow Together...</p>
          <p className="opacity-60 uppercase">© 2026 Vendor Portal. All rights reserved.</p>
          <div className="flex gap-6 opacity-80 uppercase">
            <span className="cursor-pointer">Support</span>
            <span className="cursor-pointer">Privacy</span>
            <span className="cursor-pointer">Ijoema ltd</span>
          </div>
        </footer>
      </main>
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