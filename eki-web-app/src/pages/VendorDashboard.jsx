import React from 'react';

import logo from '../assets/logo.jpeg'; 

import { 
  Search, Bell, Settings, LayoutDashboard, Package, 
  Truck, CreditCard, ChevronRight, Plus, ListChecks, 
  AlertCircle, Star, MoreVertical 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
  const emptyChartData = [
    { name: 'Oct 01', sales: 0 },
    { name: 'Oct 07', sales: 0 },
    { name: 'Oct 14', sales: 0 },
    { name: 'Oct 21', sales: 0 },
    { name: 'Oct 31', sales: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      
      <nav className="bg-white border-b px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
        
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Eki Logo" 
              className="h-10 w-auto object-contain" 
            />
          </div>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-teal-600 border-b-2 border-teal-600 pb-1">Dashboard</a>
          <a href="#" className="text-slate-500 hover:text-teal-600 transition">Products</a>
          <a href="#" className="text-slate-500 hover:text-teal-600 transition">Services</a>
          <a href="#" className="text-slate-500 hover:text-teal-600 transition">Orders</a>
          <a href="#" className="text-slate-500 hover:text-teal-600 transition">Payments</a>
          
          <div className="flex items-center gap-4 ml-4 border-l pl-6">
            <Settings className="w-5 h-5 text-slate-500 cursor-pointer" />
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-500 cursor-pointer" />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
             
                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-[10px] text-white">VN</div>
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-bold leading-tight">Vendor Name</p>
                <p className="text-[10px] text-slate-400">Store Owner</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Vendor Command Center</h1>
          <p className="text-slate-500 text-sm">Welcome back. Here's what's happening with your store today.</p>
        </header>

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Gross Sales (30d)" value="$0.00" trend="+0.0%" icon={<LayoutDashboard className="text-teal-600" />} />
          <MetricCard title="Open Orders" value="0" subtext="No urgent orders" icon={<Package className="text-teal-600" />} />
          <MetricCard title="Pending Payouts" value="$0.00" subtext="Next: TBD" icon={<CreditCard className="text-teal-600" />} color="bg-teal-50" />
          <MetricCard title="Active Listings" value="0" subtext="+0 New" icon={<ListChecks className="text-teal-600" />} color="bg-orange-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold">Sales Performance</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold">
                  <button className="px-3 py-1 rounded-md">1M</button>
                  <button className="px-3 py-1 bg-teal-800 text-white rounded-md shadow-sm">6M</button>
                  <button className="px-3 py-1 rounded-md">1Y</button>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={emptyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="font-bold">Recent Orders</h2>
                <button className="text-teal-600 text-xs font-bold hover:underline">View All Orders</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-medium">
                    <tr>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Order ID</th>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Customer</th>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Items</th>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Total</th>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-6 py-3 uppercase tracking-wider text-[10px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                        No recent transactions to display.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h2 className="font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <ActionButton icon={<Plus className="w-4 h-4" />} label="Add New Product" />
                <ActionButton icon={<Settings className="w-4 h-4" />} label="Manage Services" />
              </div>

              <div className="mt-8 bg-teal-900 text-white p-6 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
                  <p className="text-xs text-teal-200 mt-4 uppercase tracking-widest font-bold">Last Payout</p>
                  <p className="text-2xl font-bold mt-1">$0.00</p>
                  <p className="text-[10px] text-teal-300 mt-4">Paid on: --/--/--</p>
                  <button className="mt-4 text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View History <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 bg-teal-800 w-24 h-24 rounded-full opacity-20"></div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <h2 className="font-bold">Inventory Alerts</h2>
              </div>
              <div className="text-center py-6">
                <p className="text-xs text-slate-400">Your inventory levels are healthy.</p>
                <button className="mt-4 w-full py-2 border rounded-lg text-xs font-bold hover:bg-slate-50 transition">Review All Low Items</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-4 h-4 text-teal-500" />
                <h2 className="font-bold">Recent Reviews</h2>
              </div>
              <p className="text-center text-xs text-slate-400 py-4">No reviews yet.</p>
              <div className="border-t pt-4 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-teal-600 transition">See All Reviews</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 bg-teal-950 text-teal-50 px-8 py-6 flex flex-col md:flex-row justify-between items-center text-[11px]">
        <p className="font-medium italic">Buy Smart. Sell Fast. Grow together...</p>
        <p className="mt-4 md:mt-0 text-teal-400 font-bold">© 2026 Vendor Portal. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 underline underline-offset-4 decoration-teal-800">
          <a href="#">Support</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Report Issue</a>
        </div>
      </footer>
    </div>
  );
};


const MetricCard = ({ title, value, trend, subtext, icon, color = "bg-white" }) => (
  <div className={`${color === "bg-white" ? "bg-white" : color} p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4`}>
    <div className="p-2 bg-white rounded-lg border shadow-sm">{icon}</div>
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{title}</p>
        {trend && <span className="text-[10px] text-teal-600 font-bold">{trend}</span>}
      </div>
      <p className="text-xl font-black mt-1">{value}</p>
      {subtext && <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{subtext}</p>}
    </div>
  </div>
);

const ActionButton = ({ icon, label }) => (
  <button className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">{icon}</div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
  </button>
);

export default VendorDashboard;