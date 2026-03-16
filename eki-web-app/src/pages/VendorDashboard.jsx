import React, { useState } from 'react';

import logo from '../assets/logo.jpeg'; 

import { 
  Search, Bell, Settings, LayoutDashboard, Package, 
  Truck, CreditCard, ChevronRight, Plus, ListChecks, 
  AlertCircle, Star, MoreVertical, X, Upload, Tag, Box, Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VendorDashboard = () => {
  // --- NEW LOGIC STATES ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '', category: '', price: '', sku: '', qty: '', description: ''
  });

  // This simulates the user's registration type and country
  const user = {
    type: "product", // Change to "service" to see service button
    country: "Uganda" 
  };

  const getCurrency = (country) => {
    const map = { 'Uganda': 'UGX', 'Kenya': 'KSh', 'USA': '$' };
    return map[country] || '$';
  };

  const validateAndSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    const fields = ['title', 'category', 'price', 'sku', 'qty', 'description'];
    
    fields.forEach(field => {
      if (!formData[field]) newErrors[field] = "This field is required";
    });
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log("Published:", formData);
      setIsProductModalOpen(false);
    }
  };

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
          <a href="/product-management" className="text-slate-500 hover:text-teal-600 transition">Products</a>
          <a href="/service-management" className="text-slate-500 hover:text-teal-600 transition">Services</a>
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
          <MetricCard title="Gross Sales (30d)" value={`${getCurrency(user.country)} 0.00`} trend="+0.0%" icon={<LayoutDashboard className="text-teal-600" />} />
          <MetricCard title="Open Orders" value="0" subtext="No urgent orders" icon={<Package className="text-teal-600" />} />
          <MetricCard title="Pending Payouts" value={`${getCurrency(user.country)} 0.00`} subtext="Next: TBD" icon={<CreditCard className="text-teal-600" />} color="bg-teal-50" />
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
                {/* ROLE BASED BUTTONS */}
                {user.type === "product" && (
                  <ActionButton icon={<Plus className="w-4 h-4" />} label="Add New Product" onClick={() => setIsProductModalOpen(true)} />
                )}
                {user.type === "service" && (
                  <ActionButton icon={<Settings className="w-4 h-4" />} label="Manage Services" onClick={() => window.location.href='/service-management'} />
                )}
                {/* LINK TO PRODUCT MANAGEMENT */}
                <ActionButton 
                  icon={<ListChecks className="w-4 h-4" />} 
                  label="Product Management" 
                  onClick={() => window.location.href = '/product-management'} 
                />
              </div>

              <div className="mt-8 bg-teal-900 text-white p-6 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] bg-teal-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Verified</span>
                  <p className="text-xs text-teal-200 mt-4 uppercase tracking-widest font-bold">Last Payout</p>
                  <p className="text-2xl font-bold mt-1">{getCurrency(user.country)} 0.00</p>
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

      {/* --- PRODUCT POPUP PAGE (MATCHING SCREENSHOT) --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Create New Product</h2>
                <p className="text-xs text-slate-500 mt-1">Fill in the details below to list a new product in your store catalog.</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>

            <form onSubmit={validateAndSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Product Title</label>
                <input 
                  className={`w-full p-2.5 border rounded-md text-sm outline-none ${errors.title ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="e.g. Premium Wireless Headphones"
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
                {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    className={`w-full p-2.5 border rounded-md text-sm outline-none ${errors.category ? 'border-red-500' : 'border-slate-200'}`}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Electronics</option>
                  </select>
                  {errors.category && <p className="text-red-500 text-[10px] mt-1">{errors.category}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Base Price ({getCurrency(user.country)})</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input 
                      className={`w-full pl-7 p-2.5 border rounded-md text-sm outline-none ${errors.price ? 'border-red-500' : 'border-slate-200'}`}
                      placeholder="0.00"
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-[10px] mt-1">{errors.price}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">SKU</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input className={`w-full pl-9 p-2.5 border rounded-md text-sm outline-none ${errors.sku ? 'border-red-500' : 'border-slate-200'}`} placeholder="PRD-XXXX" onChange={(e) => setFormData({...formData, sku: e.target.value})} />
                  </div>
                  {errors.sku && <p className="text-red-500 text-[10px] mt-1">{errors.sku}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Inventory Quantity</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input className={`w-full pl-9 p-2.5 border rounded-md text-sm outline-none ${errors.qty ? 'border-red-500' : 'border-slate-200'}`} placeholder="0" onChange={(e) => setFormData({...formData, qty: e.target.value})} />
                  </div>
                  {errors.qty && <p className="text-red-500 text-[10px] mt-1">{errors.qty}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Product Images</label>
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200" />
                  <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200" />
                  <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                    <Upload className="w-4 h-4" /><span className="text-[10px]">Upload</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Product Description</label>
                <textarea 
                  rows="3"
                  className={`w-full p-2.5 border rounded-md text-sm outline-none ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
                  placeholder="Describe your product's key features..."
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
                {errors.description && <p className="text-red-500 text-[10px] mt-1">{errors.description}</p>}
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold">Product Variants</span>
                  <button type="button" className="text-[10px] font-bold border px-2 py-1 rounded bg-white">+ Add Variant</button>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <select className="flex-1 p-2 bg-white border rounded text-xs"><option>Size</option></select>
                    <input className="flex-[2] p-2 bg-white border rounded text-xs" defaultValue="Medium" />
                    <Trash2 className="w-4 h-4 text-slate-400 self-center" />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t flex justify-between items-center">
                <p className="text-[10px] text-slate-400 italic">Saved automatically every 30s.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2 border rounded text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-orange-400 text-white rounded text-xs font-bold hover:bg-orange-500">Publish Product</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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

const ActionButton = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-all group">
    <div className="flex items-center gap-3">
      <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-white transition-colors">{icon}</div>
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600" />
  </button>
);

export default VendorDashboard;