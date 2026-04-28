import React, { useState, useEffect, useCallback, useMemo } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { Package, CheckCircle, RefreshCw, Flag } from "lucide-react";
import { ProductStatCard } from "../components/AdminProductsManagement/ProductStatCard";
import { ProductTable } from "../components/AdminProductsManagement/ProductTable";
import { ProductProfileModal } from "../components/AdminProductsManagement/ProductProfileModal";
import { BulkActionBar } from "../components/AdminProductsManagement/BulkActionBar";
import { CategoryChart } from "../components/AdminProductsManagement/CategoryChart";
import { StockStatusChart } from "../components/AdminProductsManagement/StockStatusChart";
import api from "../services/api"; 

const GOLD = "#EFB034";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a raw listing from the backend into the shape the UI components
 * expect.  The backend returns ListingReadSerializer output.
 *
 * Mapping:
 *   id              → id
 *   title           → title
 *   business_category → category  (human-readable via CATEGORY_LABELS)
 *   price           → price  (formatted as "$X,XXX.XX")
 *   vendor_name     → vendor
 *   status          → status  (published → "Active", draft → "Draft",
 *                              archived → "Archived")
 *   images[0].image → image
 *   availability    → availability  (used for "Out of Stock" mapping)
 *   detail.stock /
 *   detail.total_stock → stock
 */
const CATEGORY_LABELS = {
  retail:      "Retail",
  fashion:     "Apparel",
  electronics: "Electronics",
  food:        "Food",
  beauty:      "Beauty",
  home:        "Home",
  sports:      "Sports",
  automotive:  "Automotive",
  other:       "Other",
};

const STATUS_MAP = {
  published: "Active",
  draft:     "Draft",
  archived:  "Archived",
};

const formatPrice = (price) => {
  if (price == null) return "—";
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const normaliseListing = (raw) => ({
  id:           String(raw.id),
  sku:          raw.id ? `PRD-${String(raw.id).slice(0, 6).toUpperCase()}` : "—",
  title:        raw.title || "Untitled",
  category:     CATEGORY_LABELS[raw.business_category] || raw.business_category || "—",
  price:        formatPrice(raw.price),
  vendor:       raw.vendor_name || "—",
  stock:        raw.detail?.total_stock ?? raw.detail?.stock ?? 0,
  availability: raw.availability,
  // Map backend statuses → UI statuses
  status:       raw.availability === "fully_booked"
                  ? "Out of Stock"
                  : (STATUS_MAP[raw.status] || raw.status || "Draft"),
  image:        raw.images?.[0]?.image || null,
  // Keep raw for the modal
  _raw:         raw,
});

/**
 * Derive category distribution data for CategoryChart.
 * Groups listings by their category label and returns percentage of total.
 */
const deriveCategoryData = (listings) => {
  if (!listings.length) return [];
  const counts = {};
  listings.forEach((l) => {
    counts[l.category] = (counts[l.category] || 0) + 1;
  });
  const total = listings.length;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8) // max 8 bars for readability
    .map(([name, count]) => ({
      name,
      active: Math.round((count / total) * 100),
    }));
};

/**
 * Derive status distribution data for StockStatusChart.
 * Uses the normalised UI status labels.
 */
const deriveStockStatusData = (listings) => {
  if (!listings.length) return [];
  const counts = { Active: 0, Draft: 0, Flagged: 0, Archived: 0 };
  listings.forEach((l) => {
    if (counts[l.status] !== undefined) counts[l.status]++;
  });
  const total = listings.length;
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([label, count]) => ({
      label,
      percentage: Math.round((count / total) * 100),
    }));
};

// ─── Component ────────────────────────────────────────────────────────────────

const AdminProductsManagement = () => {
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [products, setProducts]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRows, setSelectedRows]   = useState([]);

  // ── Pagination state ────────────────────────────────────────────────────────
  // The backend paginates at 20 results/page (WebPagination).
  // We fetch ALL pages on load so charts and stat cards reflect the full dataset.
  const [totalCount, setTotalCount]       = useState(0);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setError(null);
    try {
      // Fetch page 1 first to get the total count
      const firstPage = await api.get("/listings/admin/products/", { params: { page: 1 } });
      const payload   = firstPage.data;

      // Backend shape: { success, data: { results: [...], count, next, previous } }
      // or sometimes: { success, data: [...] }  (non-paginated fallback)
      let results = [];
      let count   = 0;

      if (Array.isArray(payload.data)) {
        results = payload.data;
        count   = payload.data.length;
      } else if (payload.data?.results) {
        results = payload.data.results;
        count   = payload.data.count || results.length;
      } else if (Array.isArray(payload)) {
        results = payload;
        count   = payload.length;
      }

      // If there are more pages, fetch them all (for accurate chart data)
      const pageSize = 20;
      const totalPages = Math.ceil(count / pageSize);

      if (totalPages > 1) {
        const pagePromises = [];
        for (let p = 2; p <= Math.min(totalPages, 10); p++) {
          // cap at 10 pages (200 products) to avoid hammering the API
          pagePromises.push(
            api.get("/listings/admin/products/", { params: { page: p } })
          );
        }
        const extraPages = await Promise.all(pagePromises);
        extraPages.forEach((res) => {
          const d = res.data;
          if (Array.isArray(d.data)) {
            results = [...results, ...d.data];
          } else if (d.data?.results) {
            results = [...results, ...d.data.results];
          }
        });
      }

      setTotalCount(count);
      setProducts(results.map(normaliseListing));
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load products. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRefresh = async () => { setRefreshing(true); setLoading(true); await loadData(); };

  // ── Derived chart data ─────────────────────────────────────────────────────
  const categories   = useMemo(() => deriveCategoryData(products),    [products]);
  const stockStatuses = useMemo(() => deriveStockStatusData(products), [products]);

  // ── Stat card values ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   String(totalCount || products.length),
    active:  String(products.filter((p) => p.status === "Active").length),
    flagged: String(products.filter((p) => p.status === "Flagged").length),
  }), [products, totalCount]);

  // ── Row selection ──────────────────────────────────────────────────────────
  const handleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  const handleSelectAll = (ids, checked) =>
    setSelectedRows(checked ? ids : []);

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleArchive = async (product) => {
    try {
      await api.patch(`/listings/${product.id}/status/`, { status: "archived" });
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, status: "Archived" } : p)
      );
    } catch (err) {
      console.error("Archive failed:", err);
    }
    setSelectedProduct(null);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/listings/${product.id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
      setTotalCount((c) => c - 1);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setSelectedProduct(null);
  };

  const handleBulkActivate = async () => {
    await Promise.allSettled(
      selectedRows.map((id) => api.patch(`/listings/${id}/status/`, { status: "published" }))
    );
    setProducts((prev) =>
      prev.map((p) => selectedRows.includes(p.id) ? { ...p, status: "Active" } : p)
    );
    setSelectedRows([]);
  };

  const handleBulkArchive = async () => {
    await Promise.allSettled(
      selectedRows.map((id) => api.patch(`/listings/${id}/status/`, { status: "archived" }))
    );
    setProducts((prev) =>
      prev.map((p) => selectedRows.includes(p.id) ? { ...p, status: "Archived" } : p)
    );
    setSelectedRows([]);
  };

  const handleBulkExport = () => {
    const selected = products.filter((p) => selectedRows.includes(p.id));
    const headers  = ["SKU", "Product Name", "Category", "Price", "Vendor", "Status"];
    const rows     = selected.map((p) =>
      [`"${p.sku}"`, `"${p.title}"`, `"${p.category}"`, `"${p.price}"`, `"${p.vendor}"`, `"${p.status}"`].join(",")
    );
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "selected_products.csv";
    a.click();
    URL.revokeObjectURL(url);
    setSelectedRows([]);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
                  disabled={refreshing || loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3 flex items-start gap-2">
                  <span className="font-semibold">Error:</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProductStatCard
                  label="Total Products"
                  value={loading ? "—" : stats.total}
                  change="+12%"
                  icon={Package}
                  bgColor="bg-[#235E5D]"
                />
                <ProductStatCard
                  label="Active Listings"
                  value={loading ? "—" : stats.active}
                  icon={CheckCircle}
                  bgColor="bg-[#EFB034]"
                />
                <ProductStatCard
                  label="Flagged Products"
                  value={loading ? "—" : stats.flagged}
                  icon={Flag}
                  bgColor="bg-red-500"
                />
              </div>

              {/* Charts */}
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                  <div className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <CategoryChart
                    categories={categories}
                    title="Inventory by Category"
                    subtitle="Product distribution across primary marketplace categories"
                  />
                  <StockStatusChart
                    statuses={stockStatuses}
                    title="Listing Status"
                    subtitle="Distribution of listing statuses across all products"
                  />
                </div>
              ) : null}

              {/* Products Table */}
              {loading ? (
                <div className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />
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

      {/* Product detail modal */}
      {selectedProduct && (
        <ProductProfileModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onArchive={() => handleArchive(selectedProduct)}
          onDelete={() => handleDelete(selectedProduct)}
        />
      )}

      {/* Bulk action bar */}
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