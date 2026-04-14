import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VendorSidebar from "../components/VendorSidebar";
import Navbar3 from "../components/adminDashboard/Navbar4";
import Footer from "../components/Vendormanagement/VendorFooter";
import ProductListing from "../components/ProductListing";
import {
  getVendorDashboard,
  getCategories,
  createProductListing,
  uploadListingImages,
  getProducts,
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
const formatOrderId = (raw) => {
  if (!raw && raw !== 0) return '—';
  const str = String(raw).trim();
  if (/^\d+$/.test(str)) {
    return `#${str.padStart(6, '0')}`;
  }
  if (str.length > 12) {
    return `#${str.slice(-8).toUpperCase()}`;
  }
  return `#${str.toUpperCase()}`;
};

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [redirected, setRedirected] = useState(false);

  const [vendorData, setVendorData] = useState({
    storeName: "",
    vendorType: "",
    country: "",
    businessCategory: "",
    vendor_type: "",
    is_product_vendor: true,
    is_service_vendor: false,
    currencySymbol: "",
    branchLocation: "",
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
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [branchLocation, setBranchLocation] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!authLoading && !redirected) {
      if (!isAuthenticated) {
        setRedirected(true);
        navigate('/login');
      } else if (user?.role !== 'vendor') {
        setRedirected(true);
        navigate('/');
      }
    }
  }, [authLoading, isAuthenticated, user?.role, navigate, redirected]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'vendor') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user?.role]);

  const fetchDashboardData = async () => {
    setIsFetching(true);
    try {
      // ── Fetch dashboard + real products in parallel ──
      const [response, allProducts] = await Promise.all([
        getVendorDashboard(),
        getProducts().catch(() => []),
      ]);

      console.log('[VendorDashboard] Full response:', response);
      console.log('[VendorDashboard] Products:', allProducts);

      if (response) {
        const bc = response.businessCategory || "";
        const isProductVendor = response.is_product_vendor ?? true;
        const isServiceVendor = response.is_service_vendor ?? false;
        const vendorType = response.vendor_type ?? (isProductVendor ? "product" : "service");

        const country = response.country ||
                        response.business_country ||
                        localStorage.getItem('vendor_country') ||
                        "";

        const resolvedCurrencySymbol = country ? getCurrencySymbol(country) : "";

        const resolvedBranchLocation =
          response.branchLocation ||
          localStorage.getItem('vendor_branch_location') ||
          "";

        setVendorData({
          storeName: response.storeName || "",
          vendorType: response.vendorType || (isProductVendor ? "Products" : "Services"),
          country,
          businessCategory: bc,
          vendor_type: vendorType,
          is_product_vendor: isProductVendor,
          is_service_vendor: isServiceVendor,
          currencySymbol: resolvedCurrencySymbol,
          branchLocation: resolvedBranchLocation,
        });
        setCurrencySymbol(resolvedCurrencySymbol);
        setBranchLocation(resolvedBranchLocation);

        // ── Compute accurate active listings from real product data ──
        const products = Array.isArray(allProducts) ? allProducts : [];
        const accurateActiveListings = products.filter(
          (p) => p.is_published === true
        ).length;

        const apiMetrics = response.metrics || {};
        setMetrics({
          grossSales: apiMetrics.grossSales || 0,
          openOrders: apiMetrics.openOrders || 0,
          pendingPayouts: apiMetrics.pendingPayouts || 0,
          // ── Use real product count, fall back to API value if products unavailable ──
          activeListings: products.length > 0
            ? accurateActiveListings
            : (apiMetrics.activeListings || 0),
        });

        setSalesHistory(response.salesHistory || []);

        const allOrders = response.recentOrders || [];
        setRecentOrders(allOrders.slice(0, 7));

        // ── Inventory alerts: only show items with stock <= 5 ──
        const rawAlerts = response.inventoryAlerts || [];

        // Also derive low-stock alerts from real product data if API doesn't provide them
        let computedAlerts = rawAlerts.filter(
          (alert) => (alert.quantity ?? alert.stock ?? 0) <= 5
        );

        // If no alerts from API, build from products with stock <= 5
        if (computedAlerts.length === 0 && products.length > 0) {
          computedAlerts = products
            .filter((p) => {
              // Check product-level stock
              const productStock = p.stock ?? p.detail?.stock ?? 0;
              // Also check variants
              const variantLowStock = Array.isArray(p.variants) && p.variants.some(
                (v) => (v.stock ?? 0) <= 5
              );
              return productStock <= 5 || variantLowStock;
            })
            .map((p) => ({
              title: p.title,
              quantity: p.stock ?? p.detail?.stock ?? 0,
            }));
        }

        setInventoryAlerts(computedAlerts);

        setReviews(response.reviews || []);

        try {
          const cats = await getCategories(bc);
          setCategories(cats);
        } catch (_) {}
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate('/login');
      }
    } finally {
      setIsFetching(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#ecece7] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5B841] mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

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

      setIsModalOpen(false);
      setSuccessMsg(
        `${isServiceVendor ? "Service" : "Product"} created successfully!`
      );
      setTimeout(() => setSuccessMsg(""), 4000);

      // ── Refetch everything so active listings count updates immediately ──
      await fetchDashboardData();
    } catch (err) {
      console.error("Failed to create listing:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const displayCurrency = currencySymbol || vendorData.currencySymbol || "";

  return (
    <div className="flex min-h-screen bg-[#ecece7] font-sans text-slate-800 p-3 gap-3">
      <VendorSidebar activePage="dashboard" />

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
                number={`${displayCurrency} ${(metrics.grossSales || 0).toLocaleString()}`}
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
                number={`${displayCurrency} ${(metrics.pendingPayouts || 0).toLocaleString()}`}
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

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs uppercase tracking-tighter">
                      Recent Orders
                    </h3>
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
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center gap-1">
                                <span className="font-black text-[#125852] tracking-wider font-mono text-[10px]">
                                  {formatOrderId(order.id)}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-700 font-medium">
                              {typeof order.customer === 'object' && order.customer !== null
                                ? (order.customer.name || order.customer.email || '—')
                                : (order.customer || '—')}
                            </td>
                            <td className="px-4 py-2.5 font-bold text-slate-800">
                              {displayCurrency}{" "}
                              {Number(order.total || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5">
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
                  {displayCurrency}{" "}
                  {(metrics.pendingPayouts || 0).toLocaleString()}
                </h3>
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-white/60">Recent Activity</span>
                  <Link to="/payment" className="font-bold hover:underline">
                    View History
                  </Link>
                </div>
              </div>

              {/* ── Inventory Alerts: only stock <= 5 ── */}
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
                        <span className="text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[9px] border border-red-100">
                          {alert.quantity ?? alert.stock ?? 0} left
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

      {/* ── Order Summary Modal — full order details ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-800">Order Summary</h2>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono font-medium">
                  {formatOrderId(selectedOrder.id)} · {selectedOrder.date
                    ? (() => { try { return new Date(selectedOrder.date).toLocaleString(); } catch (_) { return selectedOrder.date; } })()
                    : "Just now"}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={16} className="text-slate-500" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Customer Details */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Customer Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Name</span>
                    <span className="text-[12px] font-bold text-slate-800">
                      {typeof selectedOrder.customer === 'object' && selectedOrder.customer !== null
                        ? (selectedOrder.customer.name || '—')
                        : (selectedOrder.customer || '—')}
                    </span>
                  </div>
                  {/* Email — handle both nested object and flat field */}
                  {(selectedOrder.customer?.email || selectedOrder.email) && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Email</span>
                      <span className="text-[11px] text-slate-600">
                        {selectedOrder.customer?.email || selectedOrder.email}
                      </span>
                    </div>
                  )}
                  {/* Phone — handle both nested object and flat field */}
                  {(selectedOrder.customer?.phone || selectedOrder.phone) && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Phone</span>
                      <span className="text-[11px] text-slate-600">
                        {selectedOrder.customer?.phone || selectedOrder.phone}
                      </span>
                    </div>
                  )}
                  {/* Delivery address if available */}
                  {(selectedOrder.customer?.address || selectedOrder.address || selectedOrder.location) && (
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] text-slate-500">Address</span>
                      <span className="text-[11px] text-slate-600 text-right max-w-[60%]">
                        {selectedOrder.customer?.address || selectedOrder.address || selectedOrder.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items — show each item with name, qty, price */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Items Ordered
                </h3>
                {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => {
                      // Support varying field names from the API
                      const itemName = item.name || item.title || item.product_name || `Item ${idx + 1}`;
                      const itemQty  = item.qty ?? item.quantity ?? 1;
                      const itemPrice = item.price ?? item.unit_price ?? 0;
                      const itemTotal = item.total ?? item.subtotal ?? (Number(itemPrice) * Number(itemQty));
                      const itemVariant = item.variant || item.variant_label || '';

                      return (
                        <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-200 last:border-0">
                          <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-700">{itemName}</p>
                            {itemVariant && (
                              <p className="text-[9px] text-slate-400 mt-0.5">Variant: {itemVariant}</p>
                            )}
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Qty: {itemQty} × {displayCurrency} {Number(itemPrice).toLocaleString()}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-slate-800 ml-3 flex-shrink-0">
                            {displayCurrency} {Number(itemTotal).toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Fallback when items array is absent — show single order line
                  <div className="flex justify-between items-center py-1.5">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-slate-700">
                        Order {formatOrderId(selectedOrder.id)}
                      </p>
                      {/* Show item count if available as a number */}
                      {typeof selectedOrder.items === 'number' && selectedOrder.items > 0 && (
                        <p className="text-[9px] text-slate-400 mt-0.5">{selectedOrder.items} item(s)</p>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">
                      {displayCurrency} {Number(selectedOrder.total || 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 rounded-xl p-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-3">
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-500">Subtotal</span>
                    <span className="text-[11px] text-slate-700">
                      {displayCurrency} {Number(selectedOrder.subtotal || selectedOrder.total || 0).toLocaleString()}
                    </span>
                  </div>
                  {selectedOrder.shipping > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Shipping</span>
                      <span className="text-[11px] text-slate-700">
                        {displayCurrency} {Number(selectedOrder.shipping || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-500">Tax</span>
                      <span className="text-[11px] text-slate-700">
                        {displayCurrency} {Number(selectedOrder.tax || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-[12px] font-bold text-slate-800">Total</span>
                    <span className="text-[14px] font-bold text-[#F5B841]">
                      {displayCurrency} {Number(selectedOrder.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                <span className="text-[11px] font-bold text-slate-600">Order Status</span>
                <span className="px-3 py-1 bg-[#F5B841] text-white rounded-full text-[10px] font-bold uppercase">
                  {selectedOrder.status || "Processing"}
                </span>
              </div>
            </div>

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

      {/* ── ProductListing modal ── */}
      <ProductListing
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitListing}
        isLoading={isLoading}
        isServiceVendor={isServiceVendor}
        businessCategory={businessCategory}
        currencySymbol={displayCurrency}
        branchLocation={branchLocation}
        submitLabel={isServiceVendor ? "Publish Service" : "Publish Product"}
      />
    </div>
  );
};

export default VendorDashboard;