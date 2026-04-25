import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { Package, CheckCircle, RefreshCw, Flag } from "lucide-react";
import { ProductStatCard } from "../components/AdminProductsManagement/ProductStatCard";
import { ProductTable } from "../components/AdminProductsManagement/ProductTable";
import { ProductProfileModal } from "../components/AdminProductsManagement/ProductProfileModal";
import { BulkActionBar } from "../components/AdminProductsManagement/BulkActionBar";
import { CategoryChart } from "../components/AdminProductsManagement/CategoryChart";
import { StockStatusChart } from "../components/AdminProductsManagement/StockStatusChart";

const GOLD = "#EFB034";

const mockProducts = [
  { id: "1", sku: "PRD-721", title: "Lumix GH6 Mirrorless Camera", category: "Electronics", price: "$2,199.00", vendor: "PhotoPro HQ", stock: 12, status: "Active", image: null },
  { id: "2", sku: "PRD-842", title: "Minimalist Oak Coffee Table", category: "Home", price: "$349.50", vendor: "Nordic Living", stock: 0, status: "Out of Stock", image: null },
  { id: "3", sku: "PRD-319", title: "Premium Wool Blend Overcoat", category: "Apparel", price: "$189.99", vendor: "Urban Threads", stock: 45, status: "Active", image: null },
  { id: "4", sku: "PRD-102", title: "Smart Home Hub Pro v2", category: "Electronics", price: "$129.00", vendor: "TechNova", stock: 150, status: "Pending", image: null },
  { id: "5", sku: "PRD-556", title: "Ergonomic Mesh Office Chair", category: "Office", price: "$420.00", vendor: "WorkWell Co.", stock: 8, status: "Active", image: null },
  { id: "6", sku: "PRD-901", title: "Wireless Mechanical Keyboard", category: "Electronics", price: "$159.99", vendor: "TechNova", stock: 32, status: "Active", image: null },
  { id: "7", sku: "PRD-234", title: "Leather Laptop Bag", category: "Apparel", price: "$89.99", vendor: "Urban Threads", stock: 18, status: "Draft", image: null },
  { id: "8", sku: "PRD-567", title: "Ceramic Coffee Mug Set", category: "Home", price: "$34.99", vendor: "Nordic Living", stock: 0, status: "Out of Stock", image: null },
  { id: "9", sku: "PRD-890", title: "Standing Desk Converter", category: "Office", price: "$299.00", vendor: "WorkWell Co.", stock: 5, status: "Flagged", image: null },
  { id: "10", sku: "PRD-123", title: "Smart Watch Pro", category: "Electronics", price: "$299.99", vendor: "PhotoPro HQ", stock: 0, status: "Archived", image: null },
];

const categories = [
  { name: "Electronics", active: 65 },
  { name: "Apparel", active: 20 },
  { name: "Home", active: 10 },
  { name: "Office", active: 5 },
];

const stockStatuses = [
  { label: "Active", percentage: 65, color: "#EFB034" },
  { label: "Draft", percentage: 20, color: "#235E5D" },
  { label: "Flagged", percentage: 10, color: "#DC2626" },
  { label: "Archived", percentage: 5, color: "#9CA3AF" },
];

const AdminProductsManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [stats, setStats] = useState({ total: "0", active: "0", flagged: "0" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(mockProducts);
      setStats({
        total: mockProducts.length.toString(),
        active: mockProducts.filter((p) => p.status === "Active").length.toString(),
        flagged: mockProducts.filter((p) => p.status === "Flagged").length.toString(),
      });
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => { setRefreshing(true); await loadData(); };

  const handleSelectRow = (id) => setSelectedRows((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  const handleSelectAll = (ids, checked) => setSelectedRows(checked ? ids : []);
  const handleArchive = (product) => { console.log("Archive:", product); setSelectedProduct(null); };
  const handleDelete = (product) => { console.log("Delete:", product); setSelectedProduct(null); };
  const handleBulkActivate = () => { console.log("Bulk activate:", selectedRows); setSelectedRows([]); };
  const handleBulkArchive = () => { console.log("Bulk archive:", selectedRows); setSelectedRows([]); };

  const handleBulkExport = () => {
    const selected = products.filter((p) => selectedRows.includes(p.id));
    const headers = ["SKU", "Product Name", "Category", "Price", "Vendor", "Status"];
    const rows = selected.map((p) => [`"${p.sku}"`, `"${p.title}"`, `"${p.category}"`, `"${p.price}"`, `"${p.vendor}"`, `"${p.status}"`].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "selected_products.csv";
    a.click();
    URL.revokeObjectURL(url);
    setSelectedRows([]);
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
            <main className="px-4 py-4 sm:px-6 max-w-7xl mx-auto space-y-5">
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Products Dashboard</h1>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Monitor inventory levels, status changes, and vendor activity across all physical goods.
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

              {/* Stat Cards — 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProductStatCard
                  label="Total Products"
                  value={stats.total}
                  change="+12%"
                  icon={Package}
                  bgColor="bg-[#235E5D]"
                />
                <ProductStatCard
                  label="Active Listings"
                  value={stats.active}
                  icon={CheckCircle}
                  bgColor="bg-[#EFB034]"
                />
                <ProductStatCard
                  label="Flagged Products"
                  value={stats.flagged}
                  icon={Flag}
                  bgColor="bg-red-500"
                />
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <CategoryChart
                  categories={categories}
                  title="Inventory by Category"
                  subtitle="Product distribution across primary marketplace categories"
                />
                <StockStatusChart
                  statuses={stockStatuses}
                  title="Stock Status"
                  subtitle="Global inventory availability overview"
                />
              </div>

              {/* Products Table */}
              {loading ? (
                <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
              ) : (
                <ProductTable
                  products={products}
                  onSelect={setSelectedProduct}
                  selectedId={selectedProduct?.id}
                  selectedRows={selectedRows}
                  onSelectRow={handleSelectRow}
                  onSelectAll={handleSelectAll}
                  onExport={() => console.log("Export all")}
                />
              )}
            </main>

         <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. SellEasy.</div>
              <div>© 2026 Admin Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
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

      {selectedProduct && (
        <ProductProfileModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onArchive={() => handleArchive(selectedProduct)}
          onDelete={() => handleDelete(selectedProduct)}
        />
      )}

      <BulkActionBar
        selectedCount={selectedRows.length}
        onActivate={handleBulkActivate}
        onArchive={handleBulkArchive}
        onExport={handleBulkExport}
      />
    </div>
  );
};

export default AdminProductsManagement;