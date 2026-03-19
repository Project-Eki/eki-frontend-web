import React, { useState } from 'react';
import logo from '../assets/logo.jpeg';
// Note: Ensure this utility exists in your project
import { validateProductForm } from '../utils/productValidation';
import { getVendorDashboard } from "../services/authService";

import {
  Search, Bell, Settings, LayoutDashboard, Package,
  ChevronRight, Plus, ListChecks, AlertCircle, Star,
  X, Upload, Tag, Box, MoreVertical, Clock
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VendorDashboard = () => {
  // --- LIVE DATA STATES ---
  const [vendorData, setVendorData] = useState({
    storeName: "Artisan Workshop",
    vendorType: "product", // 'product' or 'service'
    country: "Uganda"      
  });

  const [metrics, setMetrics] = useState({ grossSales: 0, openOrders: 0, pendingPayouts: 0, activeListings: 0 });
  const [salesHistory, setSalesHistory] = useState([]); 
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lastPayout, setLastPayout] = useState({ amount: 0, date: "Oct 30, 2026" });

  // --- UI STATES ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});

  // --- DYNAMIC CURRENCY ---
  const getCurrency = (country) => {
    const map = { 'Uganda': 'UGX', 'Kenya': 'KSh', 'USA': '$' };
    return map[country] || '$';
  };
  const currency = getCurrency(vendorData.country);

  const handlePublish = (e) => {
    e.preventDefault();
    // Logic for validation would go here
    console.log("Saving to Database...", formData);
    setIsProductModalOpen(false);
    setIsServiceModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* NAVIGATION */}
      <nav className="bg-white border-b px-6 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <img src={logo} alt="Eki" className="h-8 w-auto" />
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-1.5 bg-slate-100 rounded-full text-xs w-64 focus:outline-none border border-transparent focus:border-teal-500" />
          </div>
        </div>
        
        {/* UPDATED NAV LINKS */}
        <div className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider">
          <a href="/dashboard" className="text-orange-400 border-b-2 border-orange-400 pb-4 mt-4">Dashboard</a>
          <a href="/product-dashboard" className="text-slate-500 hover:text-orange-400 pb-4 mt-4 transition-colors">Products</a>
          <a href="/service" className="text-slate-500 hover:text-orange-400 pb-4 mt-4 transition-colors">Services</a>
          <a href="/order-management" className="text-slate-500 hover:text-orange-400 pb-4 mt-4 transition-colors">Orders</a>
          <a href="/payments" className="text-slate-500 hover:text-orange-400 pb-4 mt-4 transition-colors">Payments</a>
          
          <div className="flex items-center gap-4 ml-4 border-l pl-6 normal-case text-slate-400">
            <Settings className="w-5 h-5 cursor-pointer hover:text-teal-600" />
            <Bell className="w-5 h-5 cursor-pointer hover:text-teal-600" />
            <div className="flex items-center gap-2 border-l pl-4">
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-800 leading-tight">{vendorData.storeName}</p>
                <p className="text-[9px]">Admin Access</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-100 border flex items-center justify-center text-teal-700 font-bold text-xs">AW</div>
            </div>
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-[1400px] mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Eki Vendor Command Center</h1>
          <p className="text-slate-500 text-sm">Welcome back, James. Monitoring activity for {vendorData.country}.</p>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard title="Gross Sales (30d)" value={`${currency} ${metrics.grossSales.toLocaleString()}`} trend="+12.5%" icon={<LayoutDashboard className="text-teal-600" />} />
          <MetricCard title="Open Orders" value={metrics.openOrders} subtext="2 Urgent" icon={<Package className="text-teal-600" />} color="bg-orange-50/50" />
          <MetricCard title="Pending Payouts" value={`${currency} ${metrics.pendingPayouts.toLocaleString()}`} subtext="Next: Nov 05" icon={<Box className="text-teal-600" />} color="bg-teal-50/50" />
          <MetricCard title="Active Listings" value={metrics.activeListings} subtext="+3 New" icon={<ListChecks className="text-teal-600" />} color="bg-orange-50/50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* CHART */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div><h2 className="font-bold text-sm">Sales Performance</h2><p className="text-[10px] text-slate-400 italic">Revenue trajectory</p></div>
                <div className="flex bg-slate-100 p-1 rounded-lg text-[10px] font-bold">
                  <button className="px-3 py-1">1W</button>
                  <button className="px-3 py-1 bg-[#234E4D] text-white rounded shadow-sm">1M</button>
                  <button className="px-3 py-1">1Y</button>
                </div>
              </div>
              <div className="h-72 w-full">
                {salesHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesHistory}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#0d9488" fill="url(#colorSales)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center border border-dashed rounded-lg text-slate-400 text-xs">Waiting for live sales data...</div>
                )}
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center font-bold text-sm">
                <h2>Recent Orders</h2>
                <a href="/order-management" className="text-teal-600 text-[10px] hover:underline">View All Orders</a>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.length > 0 ? recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="px-6 py-4 text-teal-600 font-bold">#{o.id}</td>
                      <td className="px-6 py-4">{o.customer}</td>
                      <td className="px-6 py-4 font-bold">{currency} {o.total}</td>
                      <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px]">{o.status}</span></td>
                      <td className="px-6 py-4"><MoreVertical className="w-4 h-4 text-slate-300" /></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No live orders to display.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h2 className="font-bold text-sm mb-6">Quick Actions</h2>
              <div className="space-y-3">
                {vendorData.vendorType === 'product' ? (
                  <ActionButton icon={<Plus className="text-teal-600" />} title="Add New Product" desc="List physical items to your shop" onClick={() => setIsProductModalOpen(true)} />
                ) : (
                  <ActionButton icon={<Plus className="text-teal-600" />} title="Add New Service" desc="List professional services" onClick={() => setIsServiceModalOpen(true)} />
                )}
                <ActionButton icon={<Settings className="text-teal-600" />} title="Manage Store" desc="Update your business settings" />
              </div>
            </div>

            {/* PAYOUT CARD */}
            <div className="bg-[#1a3d3c] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6"><Box className="w-5 h-5 opacity-50" /><span className="text-[8px] bg-[#234E4D] px-2 py-1 rounded-full uppercase border border-white/10">Verified</span></div>
                 <p className="text-[10px] text-teal-300 uppercase font-bold tracking-widest">Last Payout</p>
                 <p className="text-3xl font-black">{currency} {lastPayout.amount.toLocaleString()}</p>
                 <div className="mt-8 flex justify-between items-end text-[9px]"><p className="text-teal-400 font-bold uppercase">Paid on {lastPayout.date}</p><a href="/payments" className="border-b border-teal-500 pb-0.5">View History</a></div>
               </div>
            </div>

            {/* INVENTORY ALERTS */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4 text-red-500" /><h2 className="font-bold text-sm">Inventory Alerts</h2></div>
              <p className="text-[10px] text-slate-400 mb-6 italic">Low stock notifications</p>
              <div className="space-y-4">
                {inventoryAlerts.length > 0 ? inventoryAlerts.map((i, idx) => (
                  <InventoryItem key={idx} name={i.name} sku={i.sku} stock={i.stock} total={i.threshold} />
                )) : (
                  <p className="text-[10px] text-slate-400 text-center italic py-4">Inventory is healthy.</p>
                )}
                <button className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold hover:bg-slate-100 transition">Restock All Low Items</button>
              </div>
            </div>

            {/* RECENT REVIEWS */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-4"><div className="flex items-center gap-2"><Star className="w-4 h-4 text-orange-400" /><h2 className="font-bold text-sm">Recent Reviews</h2></div><span className="text-[10px] font-bold text-slate-400">0.0 avg</span></div>
              <div className="space-y-6">
                {reviews.length > 0 ? reviews.map((r, idx) => (
                  <div key={idx} className="space-y-2"><div className="flex items-center gap-3"><div className="w-6 h-6 rounded-full bg-slate-200" /><div><p className="text-[10px] font-bold">{r.user}</p></div></div><p className="text-[10px] text-slate-500 italic">"{r.comment}"</p></div>
                )) : (
                  <p className="text-[10px] text-slate-400 text-center italic py-4">No reviews yet.</p>
                )}
                <div className="border-t pt-4 text-center"><button className="text-[10px] font-bold text-slate-400 hover:text-teal-600">See All Reviews</button></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-start">
              <div><h2 className="text-lg font-bold">Create New Product</h2><p className="text-[10px] text-slate-500">Fill in details for your store catalog.</p></div>
              <X className="w-5 h-5 text-slate-300 cursor-pointer" onClick={() => setIsProductModalOpen(false)} />
            </div>
            <form className="p-6 space-y-4 max-h-[80vh] overflow-y-auto" onSubmit={handlePublish}>
              <div><label className="text-[10px] font-bold mb-1 block">Product Title</label><input placeholder="e.g. Premium Wireless Headphones" className="w-full p-2.5 border rounded-md text-xs bg-slate-50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold mb-1 block">Category</label><select className="w-full p-2.5 border rounded-md text-xs bg-slate-50"><option>Electronics</option></select></div>
                <div><label className="text-[10px] font-bold mb-1 block">Base Price ({currency})</label><input placeholder="0.00" className="w-full p-2.5 border rounded-md text-xs bg-slate-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold mb-1 block">SKU</label><div className="relative"><Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400"/><input placeholder="PRD-XXXX" className="w-full pl-8 p-2.5 border rounded-md text-xs bg-slate-50" /></div></div>
                <div><label className="text-[10px] font-bold mb-1 block">Inventory Quantity</label><div className="relative"><Box className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400"/><input placeholder="0" className="w-full pl-8 p-2.5 border rounded-md text-xs bg-slate-50" /></div></div>
              </div>
              <div><label className="text-[10px] font-bold mb-1 block">Product Images</label><div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50"><Upload className="w-4 h-4"/><span className="text-[8px] mt-1 font-bold">UPLOAD</span></div></div>
              <div><label className="text-[10px] font-bold mb-1 block">Product Description</label><textarea placeholder="Describe features..." className="w-full p-2.5 border rounded-md text-xs bg-slate-50 h-24" /></div>
              <div className="pt-4 border-t flex justify-end gap-3"><button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2 border rounded-md text-[10px] font-bold">Cancel</button><button type="submit" className="px-6 py-2 bg-orange-400 text-white rounded-md text-[10px] font-bold shadow-md hover:bg-orange-500 transition">Publish Product</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- SERVICE MODAL --- */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-start">
              <div><h2 className="text-xl font-bold">Create New Service</h2><p className="text-[10px] text-slate-500">List professional services on the marketplace.</p></div>
              <X className="w-5 h-5 text-slate-300 cursor-pointer" onClick={() => setIsServiceModalOpen(false)} />
            </div>
            <form className="p-6 space-y-4" onSubmit={handlePublish}>
              <div><label className="text-[10px] font-bold mb-1 block">Service Title</label><input placeholder="e.g. Consultation" className="w-full p-2.5 border rounded-md text-xs bg-slate-50" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold mb-1 block">Category</label><select className="w-full p-2.5 border rounded-md text-xs bg-slate-50"><option>Consulting</option></select></div>
                <div><label className="text-[10px] font-bold mb-1 block">Base Price ({currency})</label><input placeholder="0.00" className="w-full p-2.5 border rounded-md text-xs bg-slate-50" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[10px] font-bold mb-1 block">Service Duration</label><input placeholder="e.g. 60 min" className="w-full p-2.5 border rounded-md text-xs bg-slate-50" /></div>
                <div><label className="text-[10px] font-bold mb-1 block">Availability</label><select className="w-full p-2.5 border rounded-md text-xs bg-slate-50"><option>Available Now</option></select></div>
              </div>
              <div><label className="text-[10px] font-bold mb-1 block">Service Description</label><textarea className="w-full p-2.5 border rounded-md text-xs bg-slate-50 h-20" placeholder="Describe what you offer..." /></div>
              <div className="p-4 bg-slate-50 border rounded-lg flex items-center justify-between">
                <div><p className="text-[11px] font-bold">Remote Offering</p><p className="text-[9px] text-slate-400 italic">Deliver online via video call.</p></div>
                <div className="w-10 h-5 bg-teal-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
              </div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setIsServiceModalOpen(false)} className="px-6 py-2 border rounded-md text-[10px] font-bold">Cancel</button><button type="submit" className="px-6 py-2 bg-orange-400 text-white rounded-md text-[10px] font-bold shadow-md">Publish Service</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="w-full font-sans">
        <div className="w-full bg-[#234E4D] text-white py-3 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-wide">
            <div className="flex-shrink-0 font-bold">Buy Smart. Sell Fast. Grow Together...</div>
            <div className="flex items-center gap-1 text-center">
              <span>© 2026 Vendor Portal. All rights reserved.</span>
              <span className="ml-1 font-bold">eki<span className="text-[8px] font-normal ml-0.5">TM</span></span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:opacity-80">Support</a>
              <a href="#" className="hover:opacity-80">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
              <span className="font-bold border-l border-white/30 pl-6">Ijoema ltd</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const MetricCard = ({ title, value, trend, subtext, icon, color = "bg-white" }) => (
  <div className={`${color} p-5 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between transition-all hover:shadow-md`}>
    <div>
      <div className="flex items-center gap-2"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>{trend && <span className="text-[9px] text-teal-600 font-bold">{trend}</span>}</div>
      <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      {subtext && <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{subtext}</p>}
    </div>
    <div className="p-2 bg-white rounded-lg border shadow-sm">{icon}</div>
  </div>
);

const ActionButton = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all text-left group">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white border border-slate-100">{icon}</div>
      <div><p className="text-[11px] font-bold text-slate-800">{title}</p><p className="text-[9px] text-slate-400">{desc}</p></div>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
  </button>
);

const InventoryItem = ({ name, sku, stock, total }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px]">
      <div className="font-bold">{name} <span className="text-slate-400 font-normal ml-2">{sku}</span></div>
      <div className="text-red-500 font-bold">{stock} left</div>
    </div>
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(stock / total) * 100}%` }}></div>
    </div>
  </div>
);

export default VendorDashboard;