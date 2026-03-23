import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import Navbar3 from '../components/adminDashboard/Navbar3';
import { 
  getVendorDashboard, 
  createProductListing, 
  uploadListingImage 
} from "../services/authService";
import { validateProductForm } from '../utils/productValidation';

import {
  Settings, LayoutDashboard, Package, ChevronRight, Plus, 
  ListChecks, AlertCircle, Star, X, Upload, Tag, Box, 
  MoreVertical, LogOut, ShoppingBag, Truck, CreditCard, MessageSquare, MapPin
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // --- DATA STATES ---
  const [vendorData, setVendorData] = useState({ storeName: "", vendorType: "", country: "" });
  const [metrics, setMetrics] = useState({ grossSales: 0, openOrders: 0, pendingPayouts: 0, activeListings: 0 });
  const [salesHistory, setSalesHistory] = useState([]); 
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [lastPayout, setLastPayout] = useState({ amount: 0, date: "" });

  // --- UI & FORM STATES ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Electronics', price: '', sku: '', qty: 'Medium', vendorLocation: '', description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getVendorDashboard();
        if (response) {
          setVendorData({
            storeName: response.storeName || "",
            vendorType: response.vendorType || "",
            country: response.country || ""
          });
          setMetrics(response.metrics || { grossSales: 0, openOrders: 0, pendingPayouts: 0, activeListings: 0 });
          setSalesHistory(response.salesHistory || []);
          setRecentOrders(response.recentOrders || []);
          setInventoryAlerts(response.inventoryAlerts || []);
          setReviews(response.reviews || []);
          setLastPayout(response.lastPayout || { amount: 0, date: "" });
        }
      } catch (error) {
        console.error("Error fetching vendor dashboard:", error);
      }
    };
    fetchDashboardData();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const validationErrors = validateProductForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the product record
      const productResponse = await createProductListing({
        ...formData,
        isPublished: isPublished
      });

      // 2. If image exists, upload it using the new listing ID
      if (selectedImage && productResponse.id) {
        await uploadListingImage(productResponse.id, selectedImage);
      }

      setIsProductModalOpen(false);
      navigate('/product-dashboard');
    } catch (error) {
      console.error("Failed to publish product:", error);
      setErrors({ server: "Failed to save product. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currency = vendorData.country === 'Uganda' ? 'UGX' : '$';

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-slate-800 relative">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-50">
        <div className="p-6 mb-4">
          <img src={logo} alt="Eki" className="h-8 w-auto object-contain" />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarLink href="/product-dashboard" icon={<ShoppingBag size={18} />} label="Products" />
          <SidebarLink href="/service" icon={<Plus size={18} />} label="Services" />
          <SidebarLink href="/order-management" icon={<Truck size={18} />} label="Orders" />
          <SidebarLink href="/payment" icon={<CreditCard size={18} />} label="Payments" />
          <SidebarLink href="/reviews" icon={<MessageSquare size={18} />} label="Reviews" />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <SidebarLink href="/settings" icon={<Settings size={18} />} label="Store Settings" />
          <button className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-colors">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <main className="p-8 max-w-[1400px] mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Eki Vendor Command Center</h1>
            <p className="text-slate-500 text-[12px]">Monitoring activity for {vendorData.storeName || "your store"}.</p>
          </header>

          {/* METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Gross Sales (30d)" value={`${currency} ${metrics.grossSales.toLocaleString()}`} icon={<LayoutDashboard className="text-teal-600" size={18} />} />
            <MetricCard title="Open Orders" value={metrics.openOrders} icon={<Package className="text-teal-600" size={18} />} color="bg-orange-50/50" />
            <MetricCard title="Pending Payouts" value={`${currency} ${metrics.pendingPayouts.toLocaleString()}`} icon={<Box className="text-teal-600" size={18} />} color="bg-teal-50/50" />
            <MetricCard title="Active Listings" value={metrics.activeListings} icon={<ListChecks className="text-teal-600" size={18} />} color="bg-orange-50/50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesHistory}>
                      <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/><stop offset="95%" stopColor="#0d9488" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" hide /><YAxis hide /><Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#0d9488" fill="url(#colorSales)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center font-bold text-sm">
                  <h2>Recent Orders</h2>
                  <a href="/order-management" className="text-teal-600 text-[10px] uppercase tracking-tighter">View All</a>
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter">
                    <tr><th className="px-6 py-4">Order ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Total</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className="px-6 py-4 text-teal-600 font-bold">#{o.id}</td>
                        <td className="px-6 py-4">{o.customer}</td>
                        <td className="px-6 py-4 font-bold">{currency} {o.total}</td>
                        <td className="px-6 py-4 font-bold uppercase"><span className="px-2 py-0.5 bg-slate-100 rounded-full text-[9px]">{o.status}</span></td>
                        <td className="px-6 py-4"><MoreVertical className="w-4 h-4 text-slate-300" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h2 className="font-bold text-sm mb-6">Quick Actions</h2>
                <div className="space-y-3">
                  <ActionButton icon={<Plus className="text-teal-600" size={16} />} title="Add New Item" desc="List to catalog" onClick={() => setIsProductModalOpen(true)} />
                  <ActionButton icon={<Settings className="text-teal-600" size={16} />} title="Manage Store" desc="Update details" />
                </div>
              </div>

              <div className="bg-[#1a3d3c] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <p className="text-[10px] text-teal-300 uppercase font-bold mb-1">Last Payout</p>
                <p className="text-3xl font-black">{currency} {lastPayout.amount.toLocaleString()}</p>
                <div className="mt-8 flex justify-between items-end text-[9px]">
                  <p className="text-teal-400 font-bold uppercase">Paid on {lastPayout.date || "N/A"}</p>
                  <a href="/payments" className="border-b border-teal-500 hover:text-white transition-colors">History</a>
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-red-500 font-bold text-sm">
                  <AlertCircle size={16}/>
                  <h2>Inventory Alerts</h2>
                </div>
                <div className="space-y-4">
                  {inventoryAlerts.length > 0 ? inventoryAlerts.map((alert, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div><p className="text-[11px] font-bold">{alert.name}</p><p className="text-[9px] text-slate-400">{alert.sku}</p></div>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">{alert.stock} left</span>
                    </div>
                  )) : <p className="text-[10px] text-slate-400 italic">No low stock alerts.</p>}
                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase active:scale-95 transition-all">Restock All Low Items</button>
                </div>
              </div>

              {/* RECENT REVIEWS SECTION */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-teal-600 font-bold text-sm">
                  <Star size={16}/>
                  <h2>Recent Reviews</h2>
                </div>
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((rev, idx) => (
                    <div key={idx} onClick={() => navigate('/reviews')} className="border-b border-slate-50 pb-3 last:border-0 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                      <div className="flex justify-between mb-1">
                        <p className="text-[11px] font-bold">{rev.user}</p>
                        <span className="text-[9px] text-slate-400">{rev.date}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">"{rev.comment}"</p>
                    </div>
                  )) : <p className="text-[10px] text-slate-400 italic">No recent reviews.</p>}
                  <button onClick={() => navigate('/reviews')} className="w-full text-center text-[10px] font-bold text-teal-600 uppercase hover:underline active:scale-95 transition-all">See All Reviews</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#234E4D] text-white py-3 px-6 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-medium opacity-90">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. eki<span className="text-[8px] ml-0.5">TM</span></div>
          <div className="font-bold">Ijoema ltd</div>
        </footer>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">Create New Product</h2>
                <p className="text-[12px] text-slate-500 mt-0.5">Fill in the details below to list a new product.</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {errors.server && <p className="bg-red-50 text-red-500 p-3 rounded-lg text-xs font-bold">{errors.server}</p>}

              {/* Title */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Product Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Premium Wireless Headphones" className={`w-full px-4 py-2.5 bg-white border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-teal-500`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
                    <option>Electronics</option><option>Fashion</option><option>Home</option>
                  </select>
                </div>
                {/* Price */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Base Price ({currency})</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className={`w-full px-4 py-2.5 border ${errors.price ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm focus:outline-none`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* SKU */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">SKU</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="PRD-XXXX" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                  </div>
                </div>
                {/* Inventory Quality - DROPDOWN */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Inventory Quality</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <select name="qty" value={formData.qty} onChange={handleInputChange} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none">
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Vendor Location */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Vendor Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input type="text" name="vendorLocation" value={formData.vendorLocation} onChange={handleInputChange} placeholder="Enter physical location" className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                </div>
              </div>

              {/* Clickable Image Upload */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Product Images</label>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageChange} accept="image/*" />
                <div 
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 bg-slate-100 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 transition-colors overflow-hidden"
                >
                  {selectedImage ? (
                    <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload size={16} className="text-slate-400" />
                      <span className="text-[8px] text-slate-400 mt-1 uppercase font-bold">Upload</span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5 uppercase">Product Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" placeholder="Describe features, benefits..." className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none resize-none"></textarea>
              </div>

              {/* Status Toggle */}
              <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div><h3 className="text-[12px] font-bold text-slate-800">Publish Status</h3><p className="text-[10px] text-slate-500">Visible immediately upon saving.</p></div>
                <div onClick={() => setIsPublished(!isPublished)} className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isPublished ? 'bg-teal-500' : 'bg-slate-200'}`}><div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`}></div></div>
              </div>
            </div>

            <div className="px-6 py-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-6 py-2.5 text-[12px] font-bold text-slate-600 border border-slate-300 rounded-lg active:scale-95 transition-all">Cancel</button>
              <button 
                onClick={handlePublish} 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#f5b841] text-white rounded-lg text-[12px] font-bold hover:bg-[#e0a83b] transition-colors disabled:opacity-50 active:scale-95 shadow-sm"
              >
                {isSubmitting ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SidebarLink = ({ href, icon, label, active = false }) => (
  <a href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${active ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>{icon}<span>{label}</span></a>
);

const MetricCard = ({ title, value, icon, color = "bg-white" }) => (
  <div className={`${color} p-5 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between`}>
    <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{title}</p><p className="text-2xl font-black text-slate-800 mt-1">{value}</p></div>
    <div className="p-2 bg-white rounded-lg border shadow-sm">{icon}</div>
  </div>
);

const ActionButton = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 border border-slate-50 rounded-xl hover:bg-slate-50 transition-all group">
    <div className="flex items-center gap-4"><div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white border border-slate-100">{icon}</div><div><p className="text-[11px] font-bold text-slate-800">{title}</p><p className="text-[9px] text-slate-400 uppercase">{desc}</p></div></div>
    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
  </button>
);

export default VendorDashboard;