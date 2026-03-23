import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.jpeg';
import Navbar3 from '../components/adminDashboard/Navbar3';
import { 
  getVendorDashboard, 
  createProductListing, 
  uploadListingImage,
  // Make sure to add these two to your authService.js
  updateProductListing, 
  deleteProductListing 
} from "../services/authService";
import { validateProductForm } from '../utils/productValidation';

import { 
  Settings, LayoutDashboard, Package, ChevronRight, Plus, 
  ListChecks, AlertCircle, Star, X, Upload, Tag, Box, 
  MoreVertical, LogOut, ShoppingBag, Truck, CreditCard, MessageSquare, MapPin, Trash2, Edit3
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
  const [isLoading, setIsLoading] = useState(true);

  // --- UI & FORM STATES ---
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null); // ID if editing, null if creating
  const [isPublished, setIsPublished] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '', category: 'Electronics', price: '', sku: '', qty: 'Medium', location: '', description: '',
    variants: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      }
    } catch (error) {
      console.error("Error fetching vendor dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const resetForm = () => {
    setFormData({ title: '', category: 'Electronics', price: '', sku: '', qty: 'Medium', location: '', description: '', variants: [] });
    setSelectedImage(null);
    setEditingProductId(null);
    setErrors({});
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);
    setFormData({
      title: product.title || '',
      category: product.category || 'Electronics',
      price: product.price || '',
      sku: product.sku || '',
      qty: product.qty || 'Medium',
      location: product.location || '',
      description: product.description || '',
      variants: product.variants || []
    });
    setIsPublished(product.is_published ?? true);
    setIsProductModalOpen(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure? This listing will be permanently removed.")) return;
    
    setIsSubmitting(true);
    try {
      await deleteProductListing(editingProductId);
      setIsProductModalOpen(false);
      resetForm();
      fetchDashboardData(); // Refresh metrics and list
    } catch (error) {
      setErrors({ server: "Failed to delete listing." });
    } finally {
      setIsSubmitting(false);
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
      const cleanedData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        qty: formData.qty.toUpperCase(), 
        is_published: isPublished
      };

      if (editingProductId) {
        await updateProductListing(editingProductId, cleanedData);
      } else {
        const productResponse = await createProductListing(cleanedData);
        if (selectedImage && productResponse.id) {
          await uploadListingImage(productResponse.id, selectedImage);
        }
      }

      setIsProductModalOpen(false);
      resetForm();
      fetchDashboardData();
    } catch (error) {
      setErrors(error.response?.data || { server: "Failed to save product." });
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
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarLink to="/product-dashboard" icon={<ShoppingBag size={18} />} label="Products" />
          <SidebarLink to="/service" icon={<Plus size={18} />} label="Services" />
          <SidebarLink to="/order-management" icon={<Truck size={18} />} label="Orders" />
          <SidebarLink to="/payment" icon={<CreditCard size={18} />} label="Payments" />
          <SidebarLink to="/reviews" icon={<MessageSquare size={18} />} label="Reviews" />
        </nav>
        <div className="p-4 border-t border-slate-100 space-y-2">
          <SidebarLink to="/settings" icon={<Settings size={18} />} label="Store Settings" />
          <button onClick={() => navigate('/sign-in')} className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg text-[11px] font-bold transition-colors">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <main className="p-8 max-w-[1400px] mx-auto w-full">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Eki Vendor Command Center</h1>
              <p className="text-slate-500 text-[12px]">Monitoring activity for {vendorData.storeName || "your store"}.</p>
            </div>
            <button 
              onClick={() => { resetForm(); setIsProductModalOpen(true); }}
              className="bg-[#125852] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#0d4540] transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Add New Listing
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard title="Gross Sales (30d)" value={`${currency} ${metrics.grossSales.toLocaleString()}`} icon={<LayoutDashboard className="text-teal-600" size={18} />} />
            <MetricCard title="Open Orders" value={metrics.openOrders} icon={<Package className="text-teal-600" size={18} />} color="bg-orange-50/50" />
            <MetricCard title="Pending Payouts" value={`${currency} ${metrics.pendingPayouts.toLocaleString()}`} icon={<Box className="text-teal-600" size={18} />} color="bg-teal-50/50" />
            <MetricCard title="Active Listings" value={metrics.activeListings} icon={<ListChecks className="text-teal-600" size={18} />} color="bg-orange-50/50" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Sales Chart */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="h-[300px] w-full">
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
                        <Area type="monotone" dataKey="sales" stroke="#0d9488" fill="url(#colorSales)" strokeWidth={2} isAnimationActive={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs italic">No sales data available.</div>
                  )}
                </div>
              </div>

              {/* Listings Table - Key for "Manage" functionality */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center font-bold text-sm">
                  <h2>Active Product Listings</h2>
                  <Link to="/product-dashboard" className="text-teal-600 text-[10px] uppercase font-bold tracking-tighter hover:underline">Full Inventory</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-tighter">
                      <tr>
                        <th className="px-6 py-4">Title</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">SKU</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentOrders.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 font-medium text-slate-900">{p.title || 'Untitled Product'}</td>
                          <td className="px-6 py-4 font-bold">{currency} {p.price || '0'}</td>
                          <td className="px-6 py-4 text-slate-400">{p.sku || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleEditClick(p)}
                              className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 font-bold transition-colors"
                            >
                              <Edit3 size={14} /> Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h2 className="font-bold text-sm mb-6 uppercase tracking-tighter">Quick Actions</h2>
                <div className="space-y-3">
                  <ActionButton icon={<Plus className="text-teal-600" size={16} />} title="New Listing" desc="Add to your store" onClick={() => { resetForm(); setIsProductModalOpen(true); }} />
                  <ActionButton icon={<Settings className="text-teal-600" size={16} />} title="Settings" desc="Update store info" />
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6 text-orange-500">
                  <AlertCircle size={16} />
                  <h2 className="font-bold text-sm uppercase tracking-tighter">Inventory Alerts</h2>
                </div>
                <div className="space-y-4">
                  {inventoryAlerts.length > 0 ? inventoryAlerts.map((alert, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] font-medium border-b border-slate-50 pb-3 last:border-0">
                      <span className="text-slate-600">{alert.product_name}</span>
                      <span className="text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded">{alert.stock_left} Left</span>
                    </div>
                  )) : <p className="text-[10px] text-slate-400 italic">No low stock alerts.</p>}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full bg-[#234E4D] text-white py-4 px-8 mt-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-medium">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. eki<span className="text-[8px] ml-0.5">TM</span></div>
          <div className="font-bold uppercase tracking-widest">Ijoema ltd</div>
        </footer>
      </div>

      {/* --- REFACTORED PRODUCT MODAL --- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form onSubmit={handlePublish} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingProductId ? 'Manage Listing' : 'Create New Product'}
                </h2>
                <p className="text-[12px] text-slate-500">
                  {editingProductId ? 'Update your product details or remove listing.' : 'Fill in the information to list a new item.'}
                </p>
              </div>
              <button type="button" onClick={() => { setIsProductModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {errors.server && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold rounded-lg">{errors.server}</div>}
              
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Product Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-lg text-sm outline-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none appearance-none cursor-pointer">
                    <option>Electronics</option><option>Computers</option><option>Grocery</option><option>Home & Decor</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Price ({currency})</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase">Inventory Quality</label>
                  <select name="qty" value={formData.qty} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                    <option value="High">High Quality</option>
                    <option value="Medium">Medium Quality</option>
                    <option value="Low">Low Quality</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-700 uppercase">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none"></textarea>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h3 className="text-[12px] font-bold text-slate-800 uppercase">Visibility</h3>
                  <p className="text-[10px] text-slate-400">Published products are visible to customers.</p>
                </div>
                <div onClick={() => setIsPublished(!isPublished)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isPublished ? 'bg-green-500' : 'bg-slate-300'}`}>
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </div>

            <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <div>
                {editingProductId && (
                  <button 
                    type="button" 
                    onClick={handleDelete}
                    className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-[11px] font-bold transition-all border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={16} /> DELETE
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { setIsProductModalOpen(false); resetForm(); }} className="px-6 py-2.5 text-[12px] font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#F5B841] text-white rounded-lg text-[12px] font-bold hover:bg-[#E0A83B] uppercase shadow-md active:scale-95 transition-all">
                  {isSubmitting ? "Saving..." : editingProductId ? "Update Product" : "Publish Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---
const SidebarLink = ({ to, icon, label, active = false }) => (
  <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${active ? 'bg-teal-50 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
    {icon} <span>{label}</span>
  </Link>
);

const MetricCard = ({ title, value, icon, color = "bg-white" }) => (
  <div className={`${color} p-6 rounded-xl border border-slate-100 shadow-sm transition-hover hover:shadow-md`}>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-50">{icon}</div>
      <ChevronRight size={14} className="text-slate-300" />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
  </div>
);

const ActionButton = ({ icon, title, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all text-left group">
    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">{icon}</div>
    <div>
      <p className="text-[11px] font-bold text-slate-800">{title}</p>
      <p className="text-[9px] text-slate-400">{desc}</p>
    </div>
  </button>
);

export default VendorDashboard;