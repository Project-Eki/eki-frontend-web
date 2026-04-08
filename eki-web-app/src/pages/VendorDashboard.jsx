import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import VendorSidebar from "../components/VendorSidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import {
  getVendorDashboard,
  getCategories,
  createProductListing,
  uploadListingImage,
} from "../services/authService";

import {
  Package,
  ChevronRight,
  Plus,
  ListChecks,
  AlertCircle,
  Star,
  X,
  Upload,
  Box,
  CreditCard,
  Trash2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "one_size"];

const blankForm = () => ({
  title: "",
  category_id: "",
  price: "",
  sku: "",
  qty: "Medium",
  location: "",
  description: "",
  image: null,
  imageFile: null,
  colorVariant: "",
  sizeVariant: "",
});

const StatCard = ({ title, number, icon: Icon, iconBgColor, iconColor }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900">{number}</p>
      </div>
      <div className={`${iconBgColor} p-2.5 rounded-xl`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </div>
);

const VendorDashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [vendorData, setVendorData] = useState({
    storeName: "",
    vendorType: "Products",
    country: "Uganda",
    businessCategory: "retail",
    vendor_type: "product",
    is_product_vendor: true,
    is_service_vendor: false,
    currencySymbol: "UGX",
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
  const [selectedOrder, setSelectedOrder] = useState(null);

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
          vendorType:
            response.vendorType || (isProductVendor ? "Products" : "Services"),
          country: response.country || "Uganda",
          businessCategory: bc,
          vendor_type: vendorType,
          is_product_vendor: isProductVendor,
          is_service_vendor: isServiceVendor,
          currencySymbol: response.currencySymbol || "UGX",
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
  const isServiceVendor = vendorData.is_service_vendor;
  const vendorType = vendorData.vendor_type;
  const currencySymbol = vendorData.currencySymbol;
  const businessCategory = vendorData.businessCategory;

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
    if (!data.price || isNaN(Number(data.price)) || Number(data.price) <= 0) {
      errs.price = "Valid price is required";
    }
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
          console.warn("Image upload failed:", imgErr);
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
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar
        activePage="dashboard"
        vendorType={vendorType}
        businessCategory={businessCategory}
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
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-tighter mb-3">
                  Sales Performance
                </h3>
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
                            <td className="px-4 py-2.5">{order.customer}</td>
                            <td className="px-4 py-2.5 font-bold">
                              {currencySymbol}{" "}
                              {Number(order.total || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] uppercase font-bold">
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <Link
                                to={`/order-management/${order.id}`}
                                className="px-2.5 py-1 bg-[#125852] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#0e4440]"
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

              <div className="bg-[#125852] p-4 rounded-xl text-white shadow-lg">
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

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-1.5 mb-3 text-[#F5B841]">
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
                        <span className="text-[#F5B841] font-bold bg-yellow-50 px-1.5 py-0.5 rounded text-[9px]">
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

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-[10px] uppercase tracking-tighter">
                    Recent Reviews
                  </h3>
                  <Link
                    to="/reviews"
                    className="text-[#125852] text-[9px] font-bold"
                  >
                    VIEW ALL
                  </Link>
                </div>
                <div className="space-y-3">
                  {reviews.length > 0 ? (
                    reviews.map((r, i) => (
                      <div key={i} className="text-[10px] space-y-1">
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
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-300 text-[10px]">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
          <div>Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
        </footer>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublish}
            className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
          >
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
            <div className="p-5 overflow-y-auto space-y-4">
              {formErrors._server && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-medium px-3 py-2 rounded-lg">
                  {formErrors._server}
                </div>
              )}
              <div>
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
              <div>
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
              <div>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
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
                <div>
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
              {!isServiceVendor && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
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
                    <div>
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
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase text-slate-700">
                      Variant{" "}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500">
                          Color
                        </label>
                        <input
                          type="text"
                          name="colorVariant"
                          value={formData.colorVariant}
                          onChange={handleInputChange}
                          placeholder="e.g. Red, Navy Blue"
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                        />
                      </div>
                      <div>
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
                </>
              )}
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
    </div>
  );
};

export default VendorDashboard;
