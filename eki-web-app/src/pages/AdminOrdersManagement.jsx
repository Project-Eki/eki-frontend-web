import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { Package, ShoppingBag, Clock, CircleDollarSign, RefreshCw } from "lucide-react";
import { OrderStatsCards } from "../components/AdminOrdersManagement/OrderStatsCards";
import { OrdersTable } from "../components/AdminOrdersManagement/OrdersTable";
import { OrderDetailModal } from "../components/AdminOrdersManagement/OrderDetailModal";

const ORDERS_PER_PAGE = 10;

// Mock data - replace with API call
const mockOrders = [
  {
    id: "ORD-1001",
    orderNumber: "ORD-1001",
    vendor: { id: "VEN-001", name: "TechFlow Studio", email: "techflow@example.com" },
    buyer: { id: "BYR-001", name: "Alex Rivera", email: "alex@example.com" },
    items: [{ id: 1, name: "Custom Website Development", quantity: 1, price: 1200, category: "Technology" }],
    subtotal: 1200,
    total: 1200,
    status: "completed",
    createdAt: "2024-12-15T10:30:00Z",
    paymentMethod: "card",
    notes: "Rush order - need ASAP",
  },
  {
    id: "ORD-1002",
    orderNumber: "ORD-1002",
    vendor: { id: "VEN-002", name: "SparkleHome Co.", email: "sparkle@example.com" },
    buyer: { id: "BYR-002", name: "Sarah Jenkins", email: "sarah@example.com" },
    items: [{ id: 2, name: "Professional Home Deep Cleaning", quantity: 2, price: 249, category: "Home Services" }],
    subtotal: 498,
    total: 498,
    status: "processing",
    createdAt: "2024-12-14T14:20:00Z",
    paymentMethod: "mobile_money",
  },
  {
    id: "ORD-1003",
    orderNumber: "ORD-1003",
    vendor: { id: "VEN-003", name: "Visionary Arts", email: "visionary@example.com" },
    buyer: { id: "BYR-003", name: "Michael Chen", email: "michael@example.com" },
    items: [{ id: 3, name: "Social Media Brand Identity Design", quantity: 1, price: 1200, category: "Creative" }],
    subtotal: 1200,
    total: 1200,
    status: "pending",
    createdAt: "2024-12-14T09:15:00Z",
    paymentMethod: "bank_transfer",
  },
  {
    id: "ORD-1004",
    orderNumber: "ORD-1004",
    vendor: { id: "VEN-004", name: "Lexington Partners", email: "lexington@example.com" },
    buyer: { id: "BYR-004", name: "Elena Gilbert", email: "elena@example.com" },
    items: [{ id: 4, name: "Corporate Legal Consulting", quantity: 5, price: 150, category: "Business" }],
    subtotal: 750,
    total: 750,
    status: "completed",
    createdAt: "2024-12-13T16:45:00Z",
    paymentMethod: "card",
  },
  {
    id: "ORD-1005",
    orderNumber: "ORD-1005",
    vendor: { id: "VEN-005", name: "LensMaster Pro", email: "lensmaster@example.com" },
    buyer: { id: "BYR-005", name: "James Wilson", email: "james@example.com" },
    items: [{ id: 5, name: "Event Photography & Videography", quantity: 1, price: 200, category: "Creative" }],
    subtotal: 200,
    total: 200,
    status: "cancelled",
    createdAt: "2024-12-12T11:00:00Z",
    paymentMethod: "card",
  },
  {
    id: "ORD-1006",
    orderNumber: "ORD-1006",
    vendor: { id: "VEN-001", name: "TechFlow Studio", email: "techflow@example.com" },
    buyer: { id: "BYR-006", name: "Olivia Martinez", email: "olivia@example.com" },
    items: [{ id: 6, name: "API Integration Service", quantity: 1, price: 500, category: "Technology" }],
    subtotal: 500,
    total: 500,
    status: "confirmed",
    createdAt: "2024-12-11T13:30:00Z",
    paymentMethod: "mobile_money",
  },
];

const GOLD = "#EFB034";

const AdminOrdersManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({
    status: "All",
    vendor: "All Vendors",
    dateRange: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(mockOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const vendorOptions = useMemo(() => {
    const vendors = new Set(orders.map((order) => order.vendor?.name).filter(Boolean));
    return ["All Vendors", ...Array.from(vendors)];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filters.status !== "All" && order.status !== filters.status.toLowerCase()) {
        return false;
      }
      if (filters.vendor !== "All Vendors" && order.vendor?.name !== filters.vendor) {
        return false;
      }
      if (filters.dateRange !== "all") {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        if (filters.dateRange === "today" && orderDate < today) return false;
        if (filters.dateRange === "week" && orderDate < weekAgo) return false;
        if (filters.dateRange === "month" && orderDate < monthAgo) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(query) ||
          order.buyer?.name?.toLowerCase().includes(query) ||
          order.buyer?.email?.toLowerCase().includes(query) ||
          order.vendor?.name?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [orders, filters, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const processing = orders.filter((o) => o.status === "processing" || o.status === "confirmed").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, pending, processing, completed, revenue };
  }, [orders]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ORDERS_PER_PAGE;
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleOrderUpdated = () => {
    loadData();
    setSelectedOrder(null);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Orders Management</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Monitor and manage all marketplace orders across vendors and buyers.
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              <OrderStatsCards stats={stats} />

              <OrdersTable
                orders={pagedOrders}
                loading={loading}
                onSelectOrder={setSelectedOrder}
                currentPage={safePage}
                totalPages={totalPages}
                totalOrders={filteredOrders.length}
                startIndex={startIndex}
                onPageChange={setCurrentPage}
                filters={filters}
                onFilterChange={handleFilterChange}
                vendorOptions={vendorOptions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery("")}
              />
            </main>

            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. Sell Easy.</div>
              <div>© 2026 Admin Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki
                  <span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
                </span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
                <span className="cursor-pointer hover:underline">Ijoema ltd</span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
};

export default AdminOrdersManagement;