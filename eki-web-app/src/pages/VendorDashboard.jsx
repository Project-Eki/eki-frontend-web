import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import VendorSidebar from "../components/VendorSidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Vendormanagement/VendorFooter";
import ProductListing from "../components/ProductListing";
import {
  getVendorDashboard,
  getCategories,
  createProductListing,
  uploadListingImages,
} from "../services/authService";

import { getCurrencySymbol } from "../utils/currency";

import {
  Package,
  ChevronRight,
  Plus,
  ListChecks,
  AlertCircle,
  Star,
  CreditCard,
  Box,
  X,
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

// ─── Helper: format order ID professionally ───────────────────────────────────
// Pads numeric IDs to 6 digits (e.g. 42 → #000042).
// Truncates UUID/hash IDs to last 8 chars with a leading #.
const formatOrderId = (raw) => {
  if (!raw && raw !== 0) return '—';
  const str = String(raw).trim();
  // Pure numeric
  if (/^\d+$/.test(str)) {
    return `#${str.padStart(6, '0')}`;
  }
  // UUID or long hash — show last 8 chars uppercased
  if (str.length > 12) {
    return `#${str.slice(-8).toUpperCase()}`;
  }
  return `#${str.toUpperCase()}`;
};

const VendorDashboard = () => {
  const navigate = useNavigate();

  const [vendorData, setVendorData] = useState({
    storeName: "",
    vendorType: "Products",
    country: "Uganda",
    businessCategory: "retail",
    vendor_type: "product",
    is_product_vendor: true,
    is_service_vendor: false,
    currencySymbol: getCurrencySymbol("Uganda"),
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
  const [successMsg, setSuccessMsg] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("UGX");
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

        const country = response.country || "Uganda";
        const resolvedCurrencySymbol = getCurrencySymbol(country);

        setVendorData({
          storeName: response.storeName || "",
          vendorType:
            response.vendorType || (isProductVendor ? "Products" : "Services"),
          country,
          businessCategory: bc,
          vendor_type: vendorType,
          is_product_vendor: isProductVendor,
          is_service_vendor: isServiceVendor,
          currencySymbol: resolvedCurrencySymbol,
        });
        setCurrencySymbol(response.currencySymbol || "UGX");

        setMetrics(
          response.metrics || {
            grossSales: 0,
            openOrders: 0,
            pendingPayouts: 0,
            activeListings: 0,
          }
        );
        setSalesHistory(response.salesHistory || []);

        // FIX: cap recent orders to 7
        const allOrders = response.recentOrders || [];
        setRecentOrders(allOrders.slice(0, 7));

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
  const businessCategory = vendorData.businessCategory;

  const handleSubmitListing = async (payload, imageFiles) => {
    setIsLoading(true);
    try {
      const created = await createProductListing(payload);
      if (imageFiles.length > 0 && created?.id) {
        await uploadListingImages(created.id, imageFiles);
      }

      setMetrics((prev) => ({
        ...prev,
        activeListings: prev.activeListings + 1,
      }));
      setIsModalOpen(false);
      setSuccessMsg(
        `${isServiceVendor ? "Service" : "Product"} created successfully!`
      );
      setTimeout(() => setSuccessMsg(""), 4000);
      
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to create listing:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
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
                          stroke="#F5B841"
                          fill="#F5B841"
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

              {/* ── Recent Orders Table ──────────────────────────────────── */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-tighter">
                      Recent Orders
                    </h3>
                    {/* FIX: show count badge so vendor knows it's capped at 7 */}
                    {recentOrders.length > 0 && (
                      <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full">
                        {recentOrders.length}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/order-management"
                    className="text-[#125852] text-[9px] font-bold hover:underline"
                  >
                    VIEW ALL
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  {recentOrders.length > 0 ? (
                    <table className="w-full text-left text-[10px]" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase">
                        <tr>
                          <th className="px-4 py-3 whitespace-nowrap">Order ID</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentOrders.map((order, i) => (
                          <tr
                            key={order.id ?? i}
                            className="hover:bg-slate-50 transition-colors"
                          >
                            {/* FIX: professional order ID formatting */}
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1">
                                <span className="font-black text-[#125852] tracking-wider font-mono text-[10px]">
                                  {formatOrderId(order.id)}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 font-medium">{order.customer}</td>
                            <td className="px-4 py-2.5 font-bold text-slate-800">
                              {currencySymbol}{" "}
                              {Number(order.total || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
                              {/* FIX: colour-coded status badges */}
                              <span className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black tracking-wide ${
                                (() => {
                                  const s = String(order.status || '').toLowerCase();
                                  if (s === 'pending')    return 'bg-amber-50 text-amber-700 border border-amber-200';
                                  if (s === 'confirmed')  return 'bg-blue-50 text-blue-700 border border-blue-200';
                                  if (s === 'processing') return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                                  if (s === 'delivered' || s === 'completed') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                                  if (s === 'cancelled' || s === 'canceled')  return 'bg-red-50 text-red-700 border border-red-200';
                                  return 'bg-slate-100 text-slate-500 border border-slate-200';
                                })()
                              }`}>
                                {order.status || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="px-2.5 py-1 bg-[#F5B841] text-white rounded-lg text-[8px] font-bold uppercase hover:bg-[#E0A83B] transition-colors"
                              >
                                View
                              </button>
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
                    <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
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

        <Footer />
      </div>

      {/* Order Summary Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">Order Summary</h2>
                {/* FIX: use the formatter in the modal too */}
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono font-medium">
                  {formatOrderId(selectedOrder.id)} · {selectedOrder.date || "Just now"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Name</span>
                    <span className="text-[12px] font-bold text-slate-800">
                      {selectedOrder.customer}
                    </span>
                  </div>
                  {selectedOrder.email && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Email</span>
                      <span className="text-[11px] text-slate-600">
                        {selectedOrder.email}
                      </span>
                    </div>
                  )}
                  {selectedOrder.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Phone</span>
                      <span className="text-[11px] text-slate-600">
                        {selectedOrder.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Order Items
                </h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-200 last:border-0">
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-slate-700">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            Qty: {item.quantity} × {currencySymbol} {Number(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">
                          {currencySymbol} {Number(item.total || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-1.5">
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-slate-700">
                          Order {formatOrderId(selectedOrder.id)}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-slate-800">
                        {currencySymbol} {Number(selectedOrder.total || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Subtotal</span>
                    <span className="text-[11px] text-slate-700">
                      {currencySymbol} {Number(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.shipping > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Shipping</span>
                      <span className="text-[11px] text-slate-700">
                        {currencySymbol} {Number(selectedOrder.shipping || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Tax</span>
                      <span className="text-[11px] text-slate-700">
                        {currencySymbol} {Number(selectedOrder.tax || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-[12px] font-bold text-slate-800">Total</span>
                    <span className="text-[14px] font-bold text-[#F5B841]">
                      {currencySymbol} {Number(selectedOrder.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                <span className="text-[11px] font-bold text-slate-600">Order Status</span>
                <span className="px-3 py-1 bg-[#F5B841] text-white rounded-full text-[10px] font-bold uppercase">
                  {selectedOrder.status || "Processing"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-[11px] font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              <Link
                to={`/order-management/${selectedOrder.id}`}
                className="px-4 py-2 text-[11px] font-bold bg-[#F5B841] text-white rounded-lg hover:bg-[#E0A83B] transition-colors"
              >
                Manage Order
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Use the reusable ProductListing component */}
      <ProductListing
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitListing}
        isLoading={isLoading}
        isServiceVendor={isServiceVendor}
        businessCategory={businessCategory}
        currencySymbol={currencySymbol}
        submitLabel={isServiceVendor ? "Publish Service" : "Publish Product"}
      />
    </div>
  );
};

export default VendorDashboard;