import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// import logo from '../assets/logo.jpeg';
import Navbar3 from '../components/adminDashboard/Navbar3';
import {
  getVendorDashboard,
  getCategories,
  createProductListing,
  uploadListingImage,
  SignoutUser,
} from '../services/authService';

import {
  LayoutDashboard, Package, ChevronRight, Plus,
  ListChecks, AlertCircle, Star, X, Upload, Tag, Box,
  LogOut, ShoppingBag, Truck, CreditCard, MessageSquare, Trash2, Settings,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

// ─── Currency helper ──────────────────────────────────────────────────────────
const getCurrencySymbol = (country) => {
  const map = {
    uganda: 'UGX', nigeria: '₦', kenya: 'KES', ghana: 'GHS',
    'south africa': 'ZAR', usa: '$', 'united states': '$',
    uk: '£', 'united kingdom': '£', tanzania: 'TZS', rwanda: 'RWF',
    ethiopia: 'ETB', zambia: 'ZMW', zimbabwe: 'ZWL', egypt: 'EGP',
    morocco: 'MAD', senegal: 'XOF', ivory: 'XOF', cameroon: 'XAF',
  };
  return map[country?.toLowerCase()] || '$';
};

// ─── These match backend ProductSize choices exactly ─────────────────────────
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'one_size'];

const blankForm = () => ({
  title: '',
  category_id: '',
  price: '',
  sku: '',
  qty: 'Medium',
  location: '',
  description: '',
  image: null,
  imageFile: null,
  colorVariant: '',
  sizeVariant: '',
});

const VendorDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ── Data states ───────────────────────────────────────────────────────────
  const [vendorData, setVendorData] = useState({
    storeName: '', vendorType: 'Products', country: 'Uganda', businessCategory: 'retail',
  });
  const [metrics, setMetrics] = useState({ grossSales: 0, openOrders: 0, pendingPayouts: 0, activeListings: 0 });
  const [salesHistory, setSalesHistory] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ── Modal / form states ───────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [formData, setFormData] = useState(blankForm());
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      const response = await getVendorDashboard();
      if (response) {
        const bc = response.businessCategory || 'retail';
        setVendorData({
          storeName:        response.storeName        || '',
          vendorType:       response.vendorType       || 'Products',
          country:          response.country          || 'Uganda',
          businessCategory: bc,
        });
        setMetrics(response.metrics || { grossSales: 0, openOrders: 0, pendingPayouts: 0, activeListings: 0 });
        setSalesHistory(response.salesHistory   || []);
        setRecentOrders(response.recentOrders   || []);
        setInventoryAlerts(response.inventoryAlerts || []);
        setReviews(response.reviews             || []);

        try {
          const cats = await getCategories(bc);
          setCategories(cats);
        } catch (_) {}
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const currencySymbol = getCurrencySymbol(vendorData.country);

  const SERVICE_CATEGORIES = new Set(['transport', 'tailoring', 'airlines', 'hotels']);
  const isServiceVendor = SERVICE_CATEGORIES.has(vendorData.businessCategory);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () =>
      setFormData((prev) => ({ ...prev, imageFile: file, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData(blankForm());
    setFormErrors({});
    setIsPublished(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (data) => {
    const errs = {};
    if (!data.title?.trim())
      errs.title = 'Title is required';
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0)
      errs.price = 'Valid price is required';
    return errs;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }

    setIsLoading(true);
    try {
      const variants = [];
      if (formData.colorVariant?.trim()) {
        variants.push({ type: 'Color', value: formData.colorVariant.trim() });
      }
      if (formData.sizeVariant?.trim()) {
        variants.push({ type: 'Size', value: formData.sizeVariant.trim() });
      }

      const payload = {
        ...formData,
        business_category: vendorData.businessCategory,
        is_published: isPublished,
        variants,
      };

      const created = await createProductListing(payload);

      if (formData.imageFile && created?.id) {
        try {
          await uploadListingImage(created.id, formData.imageFile);
        } catch (imgErr) {
          console.warn('Image upload failed — listing was still created:', imgErr);
        }
      }

      setMetrics((prev) => ({ ...prev, activeListings: prev.activeListings + 1 }));

      setIsModalOpen(false);
      resetForm();
      setSuccessMsg(`${isServiceVendor ? 'Service' : 'Product'} created successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to create listing:', err);
      const serverErrors = err.response?.data?.errors ?? err.response?.data ?? {};
      let msg = 'Failed to create listing. Please check your inputs and try again.';

      if (typeof serverErrors === 'object' && Object.keys(serverErrors).length > 0) {
        msg = Object.entries(serverErrors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      }
      setFormErrors({ _server: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-white flex flex-col sticky top-0 h-screen z-50">
        {/* ── Eki Vendor Overview in Poppins */}
        <div className="p-6 mb-4">
          <span
            className="text-[15px] font-bold text-[#125852] tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Eki Vendor Overview */}
          </span>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink to="/dashboard"         icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <SidebarLink to="/product-dashboard" icon={<ShoppingBag size={18} />}    label="Products" />
          <SidebarLink to="/servicemanagement" icon={<Plus size={18} />}            label="Services" />
          <SidebarLink to="/order-management"  icon={<Truck size={18} />}           label="Orders" />
          <SidebarLink to="/payment"           icon={<CreditCard size={18} />}      label="Payments" />
          <SidebarLink to="/reviews" icon={<MessageSquare size={18} />} label="Reviews" />
        </nav>

        <div className="p-4 border-t border-white mt-auto space-y-1">
          {/* ── Settings in black */}
          <SidebarLink to="/settings" icon={<Settings size={18} />} label="Settings" />
          <div className="h-px bg-slate-100 my-1" />
          {/* ── Logout in gold */}
          <Link
            to="/"
            onClick={SignoutUser}
            className="flex items-center gap-3 px-3 py-2 w-full text-[#F5B841] hover:bg-[#F5B841]/10 rounded-lg text-[11px] font-bold transition-all"
          >
            <LogOut size={18} /> <span>Log out</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {/* Success toast */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold flex items-center gap-2 animate-pulse">
            <span>✓</span> {successMsg}
          </div>
        )}

        <main className="p-8 max-w-[1400px] mx-auto w-full">
          {/* ── Header — "Eki Vendor Overview" replaces "Eki Vendor Command Center" */}
          <header className="mb-8 text-left">
            <h1
              className="text-2xl font-bold text-[#1A1A1A]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Eki Vendor Overview
            </h1>
            <p className="text-slate-400 text-sm">
              {/* Monitoring activity for{' '} */}
              <span className="font-semibold text-slate-600">{vendorData.storeName || '—'}</span>
              {vendorData.country && (
                <span className="ml-2 text-[11px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                  {vendorData.country} · {currencySymbol}
                </span>
              )}
            </p>
          </header>

          {/* METRIC CARDS */}
          {isFetching ? (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-white animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <MetricCard title="Gross Sales"     value={`${currencySymbol} ${(metrics.grossSales || 0).toLocaleString()}`}     icon={<CreditCard size={18} />} bg="bg-[#E0F2F1]" />
              <MetricCard title="Open Orders"     value={metrics.openOrders || 0}                                                icon={<Package size={18} />}    bg="bg-[#FFF8E1]" />
              <MetricCard title="Pending Payouts" value={`${currencySymbol} ${(metrics.pendingPayouts || 0).toLocaleString()}`} icon={<Box size={18} />}        bg="bg-[#E0F2F1]" />
              <MetricCard title="Active Listings" value={metrics.activeListings || 0}                                           icon={<ListChecks size={18} />}  bg="bg-[#FFF8E1]" />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* SALES GRAPH */}
              <div className="bg-white p-6 rounded-xl border border-white shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm uppercase tracking-tighter">Sales Performance</h3>
                </div>
                <div className="h-[220px] w-full">
                  {salesHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#125852" fill="#125852" fillOpacity={0.05} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 text-sm">No sales data yet</div>
                  )}
                </div>
              </div>

              {/* RECENT ORDERS */}
              <div className="bg-white rounded-xl border border-white shadow-sm overflow-hidden">
                <div className="p-6 border-b border-white flex justify-between items-center">
                  <h3 className="font-bold text-sm uppercase tracking-tighter">Recent Orders</h3>
                  <Link to="/order-management" className="text-[#125852] text-[10px] font-bold">VIEW ALL</Link>
                </div>
                <div className="overflow-x-auto">
                  {recentOrders.length > 0 ? (
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                        <tr>
                          <th className="px-6 py-4">Order ID</th>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Items</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white">
                        {recentOrders.map((order, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-[#125852] font-bold">#{order.id}</td>
                            <td className="px-6 py-4">{order.customer}</td>
                            <td className="px-6 py-4">{order.items ?? '—'}</td>
                            <td className="px-6 py-4 font-bold">{currencySymbol} {Number(order.total || 0).toLocaleString()}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-slate-100 rounded text-[9px] uppercase font-bold">{order.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <Link
                                to={`/order-management/${order.id}`}
                                className="px-3 py-1.5 bg-[#125852] text-white rounded-lg text-[9px] font-bold uppercase hover:bg-[#0e4440] transition-colors"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-300 text-sm">No recent orders</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">

              {/* QUICK ACTIONS */}
              <div className="bg-white p-6 rounded-xl border border-white shadow-sm">
                <h3 className="font-bold text-sm mb-4 uppercase tracking-tighter">Quick Actions</h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-between p-4 border border-white rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Plus size={18} /></div>
                    <div><p className="text-xs font-bold">Add New {isServiceVendor ? 'Service' : 'Product'}</p></div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </button>
              </div>

              {/* LAST PAYOUT */}
              <div className="bg-[#125852] p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/10 rounded-lg"><CreditCard size={18} /></div>
                  </div>
                  <p className="text-[10px] text-white/70 uppercase font-bold tracking-widest mb-1">Last Payout</p>
                  <h3 className="text-2xl font-bold mb-4">{currencySymbol} {(metrics.pendingPayouts || 0).toLocaleString()}</h3>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/60">Recent Activity</span>
                    <Link to="/payment" className="font-bold hover:underline">View History</Link>
                  </div>
                </div>
              </div>

              {/* INVENTORY ALERTS — gold theme */}
              <div className="bg-white p-6 rounded-xl border border-white shadow-sm text-left">
                <div className="flex items-center gap-2 mb-4 text-[#F5B841]">
                  <AlertCircle size={16} />
                  <h3 className="font-bold text-xs uppercase tracking-tighter">Inventory Alerts</h3>
                </div>
                <div className="space-y-4">
                  {inventoryAlerts.length > 0 ? inventoryAlerts.map((alert, i) => (
                    <div key={i} className="flex justify-between items-center text-[11px] border-b border-white pb-2 last:border-0">
                      <span className="font-bold text-slate-700">{alert.title}</span>
                      <span className="text-[#F5B841] font-bold bg-[#F5B841]/10 px-2 py-0.5 rounded">
                        {alert.quantity ?? 0} left
                      </span>
                    </div>
                  )) : (
                    <p className="text-slate-300 text-[11px]">No low-stock alerts</p>
                  )}
                </div>
              </div>

              {/* RECENT REVIEWS */}
              <div className="bg-white p-6 rounded-xl border border-white shadow-sm text-left">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-xs uppercase tracking-tighter">Recent Reviews</h3>
                  <Link to="/reviews" className="text-[#F5B841] text-[10px] font-bold hover:underline uppercase tracking-tighter">VIEW ALL</Link>
                </div>
                <div className="space-y-4">
                  {reviews.length > 0 ? reviews.map((r, i) => (
                    <Link to="/reviews" key={i} className="block text-[11px] space-y-1 hover:bg-slate-50 rounded-lg p-1 transition-colors">
                      <div className="flex text-yellow-400 gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} size={8} fill={idx < r.rating ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <p className="text-slate-500 italic">"{r.comment}"</p>
                      {r.reviewer && <p className="text-slate-400 text-[10px]">— {r.reviewer}</p>}
                    </Link>
                  )) : (
                    <p className="text-slate-300 text-[11px]">No reviews yet</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* ── CREATE LISTING MODAL ───────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] text-left"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold">Create New {isServiceVendor ? 'Service' : 'Product'}</h2>
                <p className="text-[11px] text-slate-500">
                  Category: <span className="font-bold text-[#125852] capitalize">{vendorData.businessCategory}</span>
                </p>
              </div>
              <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5">

              {formErrors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[11px] font-medium px-4 py-3 rounded-lg">
                  {formErrors._server}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Title *</label>
                <input
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  placeholder={`e.g. ${isServiceVendor ? 'Website Design Package' : 'Premium Wireless Headphones'}`}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.title ? 'border-red-500' : 'border-white'}`}
                />
                {formErrors.title && <p className="text-red-500 text-[10px] font-bold">{formErrors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  name="description" value={formData.description} onChange={handleInputChange}
                  rows="3" placeholder="Describe your item..."
                  className="w-full px-4 py-2.5 border border-white rounded-lg text-sm outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-slate-500">Location</label>
                <input
                  type="text" name="location" value={formData.location} onChange={handleInputChange}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-4 py-2.5 border border-white rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Category</label>
                  <select
                    name="category_id" value={formData.category_id} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-white rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-slate-500">Price ({currencySymbol}) *</label>
                  <input
                    type="number" name="price" value={formData.price} onChange={handleInputChange}
                    placeholder="0.00" min="0" step="any"
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.price ? 'border-red-500' : 'border-white'}`}
                  />
                  {formErrors.price && <p className="text-red-500 text-[10px] font-bold">{formErrors.price}</p>}
                </div>
              </div>

              {!isServiceVendor && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-slate-500">SKU</label>
                    <input
                      type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                      placeholder="PRD-XXXX"
                      className="w-full px-4 py-2.5 border border-white rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Quality</label>
                    <select
                      name="qty" value={formData.qty} onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-white rounded-lg text-sm outline-none bg-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              )}

              {!isServiceVendor && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase text-slate-700">
                    Variant <span className="text-slate-400 font-normal">(at least color or size required)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-slate-500">Color</label>
                      <input
                        type="text" name="colorVariant" value={formData.colorVariant}
                        onChange={handleInputChange}
                        placeholder="e.g. Red, Navy Blue"
                        className="w-full px-3 py-2.5 border border-white rounded-lg text-sm outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase text-slate-500">Size</label>
                      <select
                        name="sizeVariant" value={formData.sizeVariant} onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-white rounded-lg text-sm outline-none bg-white"
                      >
                        <option value="">— None —</option>
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s === 'one_size' ? 'One Size' : s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-500">
                  {isServiceVendor ? 'Service Image' : 'Product Image'}
                </label>
                <div className="flex gap-3 items-center">
                  {formData.image && (
                    <div className="w-20 h-20 rounded-lg border border-white overflow-hidden relative group">
                      <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({ ...p, image: null, imageFile: null }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-white rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors"
                  >
                    <Upload size={20} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 mt-1">UPLOAD</span>
                  </div>
                  <input
                    type="file" ref={fileInputRef} onChange={handleFileChange}
                    className="hidden" accept="image/jpeg,image/png,image/webp"
                  />
                </div>
                <p className="text-[10px] text-slate-400">JPEG, PNG or WebP · max 5 MB</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[12px] font-bold text-slate-800 uppercase">Publish immediately</p>
                  <p className="text-[10px] text-slate-400">Off = saved as draft.</p>
                </div>
                <div
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${isPublished ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-white flex justify-end gap-3 bg-slate-50/20">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-8 py-2.5 text-[11px] font-bold border border-white rounded-lg bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit" disabled={isLoading}
                className="px-8 py-2.5 bg-[#F5B841] text-white rounded-lg text-[11px] font-bold uppercase shadow-sm disabled:opacity-60 hover:bg-[#E0A83B] active:scale-95 transition-all"
              >
                {isLoading ? 'Publishing...' : `Publish ${isServiceVendor ? 'Service' : 'Product'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-64 right-0 bg-[#125852] text-white py-2 px-8 flex justify-between items-center text-[9px] z-40">
        <div>Buy Smart. Sell Fast. Grow Together...</div>
        <div>© 2026 Vendor Portal. All rights reserved.</div>
      </footer>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SidebarLink = ({ to, icon, label, active = false }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
      active
        ? 'bg-[#E0F2F1] text-[#125852]'
        : 'text-slate-400 hover:text-slate-900'
    }`}
  >
    {icon} <span>{label}</span>
  </Link>
);

const MetricCard = ({ title, value, icon, bg = 'bg-white' }) => (
  <div className={`${bg} p-6 rounded-2xl border border-white shadow-sm text-left`}>
    <div className="p-2 bg-white rounded-lg shadow-sm w-fit mb-3">{icon}</div>
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-xl font-bold text-slate-900">{value}</h3>
  </div>
);

export default VendorDashboard;