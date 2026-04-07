import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar4';
import Footer from '../components/Footer';
import {
  getVendorDashboard,
  getCategories,
  createProductListing,
  uploadListingImage,
  SignoutUser,
} from '../services/authService';

import {
  Package, ChevronRight, Plus,
  ListChecks, AlertCircle, Star, X, Upload, Box,
  CreditCard, Trash2, MapPin, Calendar, ShoppingBag,
  User, Hash, Clock, Tag, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

import { getCurrencySymbol } from '../utils/currency';

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

const StatCard = ({ title, number, icon: Icon, iconBgColor, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ fontFamily: "'Poppins', sans-serif" }}>{title}</p>
        <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{number}</p>
      </div>
      <div className={`${iconBgColor} p-2.5 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

const resolveItemCount = (items) => {
  if (items === null || items === undefined) return '—';
  if (typeof items === 'number') return items;
  if (typeof items === 'string') return items;
  if (Array.isArray(items)) return items.length;
  if (typeof items === 'object') {
    if (items.count !== undefined) return items.count;
    if (items.length !== undefined) return items.length;
    return Object.keys(items).length;
  }
  return '—';
};

// ─── Status badge colours ─────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  completed:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  delivered:  'bg-emerald-100 text-emerald-700',
};

// ─── Order Detail Modal ───────────────────────────────────────────────────────
const OrderDetailModal = ({ order, currencySymbol, onClose }) => {
  if (!order) return null;

  const statusKey  = String(order.status ?? '').toLowerCase();
  const badgeClass = STATUS_STYLES[statusKey] ?? 'bg-slate-100 text-slate-600';

  const customerName = typeof order.customer === 'object' && order.customer !== null
    ? (order.customer.name || order.customer.email || '—')
    : (order.customer ?? '—');

  const statusLabel = typeof order.status === 'object' && order.status !== null
    ? (order.status.label || order.status.name || '—')
    : (order.status ?? '—');

  const items = Array.isArray(order.items) ? order.items : [];

  const displayDate = order.date
    ? (() => { try { return new Date(order.date).toLocaleString(); } catch (_) { return order.date; } })()
    : '—';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{ fontFamily: "'Poppins', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Hash size={14} className="text-[#F5B841]" />
              <h2 className="text-base font-bold text-slate-800">Order #{order.id}</h2>
            </div>
            <span className={`mt-1 inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold ${badgeClass}`}>
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Customer Info */}
          <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
              <User size={14} className="text-[#125852]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Customer</p>
              <p className="text-[13px] font-bold text-slate-800 truncate">{customerName}</p>
              {order.customer?.email && order.customer?.name && (
                <p className="text-[10px] text-slate-400 truncate">{order.customer.email}</p>
              )}
            </div>
          </div>

          {/* Date + Location row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
              <Calendar size={13} className="text-[#F5B841] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Date</p>
                <p className="text-[10px] font-semibold text-slate-700">{displayDate}</p>
              </div>
            </div>
            {order.location && (
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl">
                <MapPin size={13} className="text-[#F5B841] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase text-slate-400 mb-0.5">Location</p>
                  <p className="text-[10px] font-semibold text-slate-700 truncate">{order.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <p className="text-[9px] font-bold uppercase text-slate-400 mb-2">Order Summary</p>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 ${i !== items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <ShoppingBag size={12} className="text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{item.name || item.title || `Item ${i + 1}`}</p>
                        {item.qty && <p className="text-[9px] text-slate-400">Qty: {item.qty}</p>}
                        {item.variant && <p className="text-[9px] text-slate-400">{item.variant}</p>}
                      </div>
                    </div>
                    {item.price != null && (
                      <p className="text-[11px] font-bold text-slate-700 ml-2 flex-shrink-0">
                        {currencySymbol} {Number(item.price).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={12} className="text-slate-300" />
                    <p className="text-[11px] text-slate-400">
                      {resolveItemCount(order.items)} item{resolveItemCount(order.items) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment notes */}
          {order.notes && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[9px] font-bold uppercase text-amber-600 mb-1">Notes</p>
              <p className="text-[10px] text-amber-800">{order.notes}</p>
            </div>
          )}

          {/* Totals */}
          <div className="border-t border-slate-100 pt-3 space-y-1.5">
            {order.subtotal != null && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-700">{currencySymbol} {Number(order.subtotal).toLocaleString()}</span>
              </div>
            )}
            {order.shipping != null && (
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Shipping</span>
                <span className="font-semibold text-slate-700">{currencySymbol} {Number(order.shipping).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-[13px] pt-1 border-t border-slate-100 mt-1">
              <span className="font-bold text-slate-800">Total</span>
              <span className="font-black text-[#125852]">{currencySymbol} {Number(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2 bg-slate-50/30 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-[11px] font-bold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <Link
            to={`/order-management/${order.id}`}
            className="flex-1 py-2.5 text-[11px] font-bold bg-[#F5B841] text-white rounded-xl hover:bg-[#E0A83B] transition-colors text-center"
          >
            View Full Order
          </Link>
        </div>
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [vendorData, setVendorData] = useState({
    storeName: "",
    vendorType: "Products",
    country: "Uganda",
    businessCategory: "retail",
    is_product_vendor: true,
    is_service_vendor: false,
    vendor_type: "product",
  });
  const [metrics, setMetrics] = useState({
    grossSales: 0,
    openOrders: 0,
    pendingPayouts: 0,
    activeListings: 0,
  });
  const [salesHistory, setSalesHistory] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [formData, setFormData] = useState(blankForm());
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      const response = await getVendorDashboard();
      if (response) {
        const bc = response.businessCategory || "retail";
        const isProductVendor = response.is_product_vendor ?? true;
        const isServiceVendor = response.is_service_vendor ?? false;
        const vendorType =
          response.vendor_type ?? (isProductVendor ? "product" : "service");
        setVendorData({
          storeName: response.storeName || "",
          vendorType: response.vendorType || "Products",
          country: response.country || "Uganda",
          businessCategory: response.businessCategory || "retail",
          is_product_vendor: isProductVendor,
          is_service_vendor: isServiceVendor,
          vendor_type: vendorType,
          allowed_listing_types: response.allowed_listing_types || ["product"],
        });
        setMetrics(
          response.metrics || {
            grossSales: 0,
            openOrders: 0,
            pendingPayouts: 0,
            activeListings: 0,
          },
        );
        setSalesHistory(response.salesHistory || []);
        setRecentOrders(response.recentOrders || []);
        setInventoryAlerts(response.inventoryAlerts || []);
        setReviews(response.reviews || []);

        try {
          const bc = response.businessCategory || "retail";
          const cats = await getCategories(bc);
          setCategories(cats);
        } catch (_) {}
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const isProductVendor = vendorData?.is_product_vendor ?? false;
  const isServiceVendor = vendorData?.is_service_vendor ?? false;
  const vendorType = vendorData.vendor_type; // 'product' or 'service'

  // Two-step lookup: country name → ISO code → symbol (mirrors backend)
  const currencySymbol = getCurrencySymbol(vendorData.country);

  // const SERVICE_CATEGORIES = new Set([
  //   "transport",
  //   "tailoring",
  //   "airlines",
  //   "hotels",
  // ]);

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
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        image: reader.result,
      }));
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFormData(blankForm());
    setFormErrors({});
    setIsPublished(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (data) => {
    const errs = {};
    if (!data.title?.trim()) errs.title = "Title is required";
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0)
      errs.price = "Valid price is required";
    return errs;
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      const variants = [];
      if (formData.colorVariant?.trim()) {
        variants.push({ type: "Color", value: formData.colorVariant.trim() });
      }
      if (formData.sizeVariant?.trim()) {
        variants.push({ type: "Size", value: formData.sizeVariant.trim() });
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
          console.warn(
            "Image upload failed — listing was still created:",
            imgErr,
          );
        }
      }

      setMetrics((prev) => ({
        ...prev,
        activeListings: prev.activeListings + 1,
      }));

      setIsModalOpen(false);
      resetForm();
      setSuccessMsg(
        `${isServiceVendor ? "Service" : "Product"} created successfully!`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Failed to create listing:", err);
      const serverErrors =
        err.response?.data?.errors ?? err.response?.data ?? {};
      let msg =
        "Failed to create listing. Please check your inputs and try again.";

      if (
        typeof serverErrors === "object" &&
        Object.keys(serverErrors).length > 0
      ) {
        msg = Object.entries(serverErrors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
      }
      setFormErrors({ _server: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-popins text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar
        activePage="dashboard"
        isProductVendor={isProductVendor}
        isServiceVendor={isServiceVendor}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        {successMsg && (
          <div className="fixed top-6 right-6 z-[200] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 animate-pulse">
            <span>✓</span> {successMsg}
          </div>
        )}

        <main className="p-5 max-w-[1400px] mx-auto w-full pb-16">
          <header className="mb-5 text-left">
            <h1 className="text-xl font-bold text-[#1A1A1A]">
              Eki Vendor Dashboard
            </h1>
          </header>

          {/* METRIC CARDS */}
          {isFetching ? (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl border border-slate-200 animate-pulse h-24"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <StatCard
                title="Gross Sales"
                number={`${currencySymbol} ${(metrics.grossSales || 0).toLocaleString()}`}
                icon={CreditCard}
                iconBgColor="bg-emerald-50"
                iconColor="text-emerald-600"
              />
              <StatCard
                title="Open Orders"
                number={metrics.openOrders || 0}
                icon={Package}
                iconBgColor="bg-blue-50"
                iconColor="text-blue-600"
              />
              <StatCard
                title="Pending Payouts"
                number={`${currencySymbol} ${(metrics.pendingPayouts || 0).toLocaleString()}`}
                icon={Box}
                iconBgColor="bg-orange-50"
                iconColor="text-orange-600"
              />
              <StatCard
                title="Active Listings"
                number={metrics.activeListings || 0}
                icon={ListChecks}
                iconBgColor="bg-indigo-50"
                iconColor="text-indigo-600"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              {/* SALES GRAPH */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-xs uppercase tracking-tighter">
                    Sales Performance
                  </h3>
                </div>
                <div className="h-[180px] w-full">
                  {salesHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={salesHistory}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis dataKey="date" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke="#125852"
                          fill="#125852"
                          fillOpacity={0.05}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 text-xs">
                      No sales data yet
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT ORDERS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-xs uppercase tracking-tighter">
                    Recent Orders
                  </h3>
                  <Link
                    to="/order-management"
                    className="text-[#125852] text-[9px] font-bold"
                  >
                    VIEW ALL
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  {recentOrders.length > 0 ? (
                    <table className="w-full text-left text-[10px]">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                        <tr>
                          <th className="px-4 py-3">Order ID</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Items</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentOrders.map((order, i) => (
                          <tr
                            key={i}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            <td className="px-4 py-2.5 text-[#125852] font-bold">
                              #{order.id}
                            </td>
                            <td className="px-4 py-2.5">
                              {/* customer may be a nested object e.g. { name, email } */}
                              {typeof order.customer === "object" &&
                              order.customer !== null
                                ? order.customer.name ||
                                  order.customer.email ||
                                  "—"
                                : (order.customer ?? "—")}
                            </td>
                            <td className="px-4 py-2.5">
                              {/* items can be an array of objects, a count number, or undefined */}
                              {resolveItemCount(order.items)}
                            </td>
                            <td className="px-4 py-2.5 font-bold">
                              {currencySymbol}{" "}
                              {Number(order.total || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] uppercase font-bold">
                                {/* status may also be an object */}
                                {typeof order.status === "object" &&
                                order.status !== null
                                  ? order.status.label ||
                                    order.status.name ||
                                    "—"
                                  : (order.status ?? "—")}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Link
                                to={`/order-management/${order.id}`}
                                className="px-2.5 py-1 bg-[#125852] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#0e4440] transition-colors"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-slate-300 text-xs">
                      No recent orders
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* QUICK ACTIONS */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xs mb-3 uppercase tracking-tighter">
                  Quick Actions
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                >
                  <div className="flex items-center gap-2 text-left">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Plus size={14} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold">
                        Add New {isServiceVendor ? "Service" : "Product"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                </button>
              </div>

              {/* LAST PAYOUT */}
              <div className="bg-[#125852] p-4 rounded-xl text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <CreditCard size={14} />
                    </div>
                  </div>
                  <p className="text-[9px] text-white/70 uppercase font-bold tracking-widest mb-1">
                    Last Payout
                  </p>
                  <h3 className="text-xl font-bold mb-3">
                    {currencySymbol}{" "}
                    {(metrics.pendingPayouts || 0).toLocaleString()}
                  </h3>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-white/60">Recent Activity</span>
                    <Link to="/payment" className="font-bold hover:underline">
                      View History
                    </Link>
                  </div>
                </div>
              </div>

              {/* INVENTORY ALERTS */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                <div className="flex items-center gap-1.5 mb-3 text-[#E53935]">
                  <AlertCircle size={12} />
                  <h3 className="font-bold text-[10px] uppercase tracking-tighter">
                    Inventory Alerts
                  </h3>
                </div>
                <div className="space-y-3">
                  {inventoryAlerts.length > 0 ? (
                    inventoryAlerts.map((alert, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-[10px] border-b border-slate-100 pb-2 last:border-0"
                      >
                        <span className="font-bold text-slate-700">
                          {alert.title}
                        </span>
                        <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[9px]">
                          {alert.quantity ?? 0} left
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-300 text-[10px]">
                      No low-stock alerts
                    </p>
                  )}
                </div>
              </div>

              {/* RECENT REVIEWS */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[10px] uppercase tracking-tighter">
                    Recent Reviews
                  </h3>
                  <Link
                    to="/reviews"
                    className="text-[#125852] text-[9px] font-bold hover:underline uppercase tracking-tighter"
                  >
                    VIEW ALL
                  </Link>
                </div>
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((r, i) => (
                      <Link
                        to="/reviews"
                        key={i}
                        className="block text-[10px] space-y-1 hover:bg-slate-50 rounded-lg p-1 transition-colors"
                      >
                        <div className="flex text-yellow-400 gap-0.5">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              size={7}
                              fill={idx < r.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </div>
                        <p className="text-slate-500 italic text-[9px]">
                          "{r.comment}"
                        </p>
                        {r.reviewer && (
                          <p className="text-slate-400 text-[8px]">
                            — {r.reviewer}
                          </p>
                        )}
                      </Link>
                    ))
                  ) : (
                    <p className="text-slate-300 text-[10px]">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* ── CREATE LISTING MODAL ───────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] text-left"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-start">
              <div>
                <h2 className="text-base font-bold">
                  Create New {isServiceVendor ? "Service" : "Product"}
                </h2>
                <p className="text-[10px] text-slate-500">
                  Category:{" "}
                  <span className="font-bold text-[#125852] capitalize">
                    {vendorData.businessCategory}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {formErrors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium px-3 py-2 rounded-lg">
                  {formErrors._server}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder={`e.g. ${isServiceVendor ? "Website Design Package" : "Premium Wireless Headphones"}`}
                  className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.title ? "border-red-500" : "border-slate-200"}`}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-[9px] font-bold">
                    {formErrors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Describe your item..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Kampala, Uganda"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841]"
                />
              </div>

              {/* Category + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                  >
                    <option value="">— Select —</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500">
                    Price ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="any"
                    className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] ${formErrors.price ? "border-red-500" : "border-slate-200"}`}
                  />
                  {formErrors.price && (
                    <p className="text-red-500 text-[9px] font-bold">
                      {formErrors.price}
                    </p>
                  )}
                </div>
              </div>

              {/* SKU + Quality (products only) */}
              {!isServiceVendor && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="PRD-XXXX"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Quality
                    </label>
                    <select
                      name="qty"
                      value={formData.qty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Variants */}
              {!isServiceVendor && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase text-slate-700">
                    Variant{" "}
                    <span className="text-slate-400 font-normal">
                      (optional)
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Color — free-text input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Color
                      </label>
                      <input
                        type="text"
                        name="colorVariant"
                        value={formData.colorVariant}
                        onChange={handleInputChange}
                        placeholder="e.g. Red, Navy Blue, Olive"
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-[#F5B841] placeholder:text-slate-300"
                      />
                      <p className="text-[8px] text-slate-400">
                        Type any color or comma-separate multiple
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-slate-500">
                        Size
                      </label>
                      <select
                        name="sizeVariant"
                        value={formData.sizeVariant}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-white"
                      >
                        <option value="">— None —</option>
                        {SIZE_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s === "one_size" ? "One Size" : s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Image upload */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  {isServiceVendor ? "Service Image" : "Product Image"}
                </label>
                <div className="flex gap-2 items-center">
                  {formData.image && (
                    <div className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative group">
                      <img
                        src={formData.image}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((p) => ({
                            ...p,
                            image: null,
                            imageFile: null,
                          }));
                          if (fileInputRef.current)
                            fileInputRef.current.value = "";
                        }}
                        className="absolute top-0.5 right-0.5 bg-white/80 p-0.5 rounded-full text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-50 hover:border-[#125852] transition-colors"
                  >
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                      UPLOAD
                    </span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </div>
                <p className="text-[8px] text-slate-400">
                  JPEG, PNG or WebP · max 5 MB
                </p>
              </div>

              {/* Publish toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase">
                    Publish immediately
                  </p>
                  <p className="text-[9px] text-slate-400">
                    Off = saved as draft.
                  </p>
                </div>
                <div
                  onClick={() => setIsPublished(!isPublished)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-all ${isPublished ? "bg-green-500" : "bg-slate-200"}`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isPublished ? "translate-x-5" : "translate-x-0"}`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/20">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-6 py-2 text-[10px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#F5B841] text-white rounded-lg text-[10px] font-bold uppercase shadow-sm disabled:opacity-60 hover:bg-[#E0A83B] active:scale-95 transition-all"
              >
                {isLoading
                  ? "Publishing..."
                  : `Publish ${isServiceVendor ? "Service" : "Product"}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default VendorDashboard;