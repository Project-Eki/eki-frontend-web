import React, { useState, useEffect, useCallback } from "react";
import Sidebar      from "../components/adminDashboard/Sidebar";
import Navbar3      from "../components/adminDashboard/Navbar3";
import VendorList   from "../components/VendorList";
import VendorProfile from "../components/VendorProfile";
import {
  getAdminDashboard,
  updateVerificationStatus,
} from "../services/api";
import {
  Store, Clock, TrendingUp, X, ChevronLeft, ChevronRight,
  FileText, ExternalLink, AlertTriangle, Loader2, RefreshCw,
} from "lucide-react";
import api from "../services/api";

const GOLD = "#EFB034";

// The base URL for resolving relative media paths (document URLs)
// On localhost Django is :8000, Vite is :5173 — different origins
const DJANGO_BASE = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/api\/v1\/?$/, "");
  return "http://127.0.0.1:8000";
})();

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${DJANGO_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

// Normalise under_review → Pending
const normStatus = (s) => {
  if (!s) return s;
  const l = String(s).toLowerCase();
  if (l === "under_review" || l === "under review") return "Pending";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, type }) => {
  const configs = {
    vendors: { Icon: Store,      bg: "bg-teal-50",  color: "text-teal-600"  },
    pending: { Icon: Clock,      bg: "bg-amber-50", color: "text-amber-600" },
    earners: { Icon: TrendingUp, bg: "bg-green-50", color: "text-green-600" },
  };
  const { Icon, bg, color } = configs[type] || configs.earners;
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-xl ${bg} shrink-0`}>
        <Icon className={color} size={18} />
      </div>
      <div>
        <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">{label}</p>
        <h3 className={`text-xl font-bold mt-0.5 ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

// ── Document Review Modal ────────────────────────────────────────────────────
/**
 * FIX: Was reading response.data instead of response.data.data
 * Also resolves relative URLs to absolute using DJANGO_BASE
 */
const DocumentReviewModal = ({ vendorId, vendorName, onClose }) => {
  const [docs,    setDocs]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/accounts/admin/vendors/${vendorId}/review/`);
        // FIX: unwrap the { success, data, message } envelope
        const detail = response.data?.data || response.data;
        setDocs(detail.documents || {});
      } catch (err) {
        setError("Failed to load documents. Please try again.");
        console.error("Document fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchDocs();
  }, [vendorId]);

  const DOC_LABELS = {
    government_issued_id: "Government Issued ID",
    country_issued_id:    "Country Issued ID",
    business_license:     "Business License",
    tax_certificate:      "Tax Certificate",
    incorporation_cert:   "Incorporation Certificate",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Document Review</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{vendorName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {loading && (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}
          {!loading && !error && docs && (
            <div className="space-y-2.5">
              {Object.keys(DOC_LABELS).map((key) => {
                const doc = docs[key];
                // FIX: resolve relative URL to absolute for localhost compatibility
                const absoluteUrl = resolveUrl(doc?.url);
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-xl border ${
                      doc ? "border-green-100 bg-green-50/40" : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={14} className={doc ? "text-green-600" : "text-gray-300"} />
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{DOC_LABELS[key]}</p>
                        {doc?.filename && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">
                            {doc.filename}
                          </p>
                        )}
                      </div>
                    </div>
                    {absoluteUrl ? (
                      <a
                        href={absoluteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-teal-700 bg-white border border-teal-100 rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        View <ExternalLink size={9} />
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-500 rounded-full">
                        Missing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Terminate Modal ──────────────────────────────────────────────────────────
const TerminateVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason,      setReason]      = useState("");
  const canConfirm = confirmText === "TERMINATE" && reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h2 className="text-sm font-bold text-red-800">Terminate Vendor</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100">
            <X size={16} className="text-red-500" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            This will permanently suspend <strong>{vendor?.name}</strong>. They lose access immediately.
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason <span className="text-red-400">*</span></label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this vendor is being terminated..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">
              Type <span className="font-black text-red-600 tracking-wider">TERMINATE</span> to confirm
            </label>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="TERMINATE"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-400" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={() => onConfirm(reason)} disabled={!canConfirm || loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Vendor list with filter + 4-per-page pagination ──────────────────────────
const VendorListWithFilters = ({ vendors, onSelect, selectedId, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [refreshing,   setRefreshing]   = useState(false);

  const PER_PAGE = 4; // Requirement: 4 per page

  // Status options — "Under Review" removed per requirements
  const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Suspended"];

  const filtered = vendors
    .filter((v) => statusFilter === "All" || v.status === statusFilter)
    .filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.name?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.businessName?.toLowerCase().includes(q) ||
        v.businessCategory?.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleRefreshClick = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-400">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</p>
          <input
            type="text"
            placeholder="Search vendors…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-44"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap items-center">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors"
              style={{
                background:  statusFilter === s ? GOLD : "white",
                color:       statusFilter === s ? "white" : "#6b7280",
                borderColor: statusFilter === s ? GOLD : "#e5e7eb",
              }}
            >
              {s}
            </button>
          ))}
          {/* Refresh button */}
          <button
            onClick={handleRefreshClick}
            title="Refresh vendor list"
            className="p-1.5 border rounded-lg transition-colors hover:opacity-90"
            style={{ borderColor: GOLD, color: GOLD }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <VendorList vendors={slice} onSelect={onSelect} selectedId={selectedId} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
          <span>Page {safePage} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const AdminManagement = () => {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [vendors,          setVendors]          = useState([]);
  const [selectedVendor,   setSelectedVendor]   = useState(null);
  const [vendorDetail,     setVendorDetail]     = useState(null);
  const [detailLoading,    setDetailLoading]    = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [stats,            setStats]            = useState({ total: "—", pending: "—", approved: "—" });
  const [showDocReview,    setShowDocReview]    = useState(false);
  const [showTerminate,    setShowTerminate]    = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);

  /**
   * FIX: Data not showing (business_category, documents, days)
   * Root cause: /admin/dashboard/ pending_verifications only has summary fields.
   * Solution: Call GET /accounts/admin/vendors/ which returns ALL vendor fields
   * including business_category, has_government_issued_id, etc.
   * We merge dashboard stats with the full vendor list.
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResponse, vendorsResponse] = await Promise.all([
        getAdminDashboard(),
        api.get("/accounts/admin/vendors/"),
      ]);

      const dashData = dashResponse.data;
      const pipeline = dashData.verification_workflows?.pipeline || {};

      const totalVendors = Object.values(pipeline).reduce(
        (sum, v) => sum + (Number(v) || 0), 0
      );
      setStats({
        total:    totalVendors || "—",
        pending:  pipeline.pending  || "—",
        approved: pipeline.approved || "—",
      });

      // FIX: use the full vendor list endpoint (has all fields including business_category)
      const rawVendors = vendorsResponse.data?.data || vendorsResponse.data || [];
      const vendorArray = Array.isArray(rawVendors) ? rawVendors : [];

      setVendors(
        vendorArray.map((v) => ({
          id:               v.id,
          name:             v.owner_full_name   || v.user_name || "—",
          email:            v.user_email        || v.business_email || "",
          status:           normStatus(v.verification_status),
          submitted:        v.created_at ? new Date(v.created_at).toLocaleDateString() : "—",
          daysPending:      null, // not in list view — loaded on detail click
          docsCount:        [
            v.has_government_issued_id,
            v.has_country_issued_id,
            v.has_business_license,
            v.has_tax_certificate,
            v.has_incorporation_cert,
          ].filter(Boolean).length,
          businessName:     v.business_name     || "—",
          businessType:     v.business_type     || "—",
          businessCategory: v.business_category || "—", // FIX: now available from /admin/vendors/
        }))
      );
    } catch (err) {
      console.error("AdminManagement load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Select vendor → load detail ──────────────────────────────────────────
  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
      // FIX: unwrap envelope
      const d = response.data?.data || response.data;
      setVendorDetail({
        ...vendor,
        email:            d.user_email            || d.business_email || "—",
        name:             d.user_name             || d.owner_full_name || vendor.name,
        profilePicture:   d.profile_picture       || null,
        businessName:     d.business_name         || "—",
        businessType:     d.business_type         || "—",
        businessCategory: d.business_category     || "—",
        businessPhone:    d.business_phone        || "—",
        businessEmail:    d.business_email        || "—",
        address:          d.address               || "—",
        city:             d.city                  || "—",
        country:          d.country               || "—",
        registrationNo:   d.registration_number   || "—",
        taxId:            d.tax_id                || "—",
        openingTime:      d.opening_time          || "—",
        closingTime:      d.closing_time          || "—",
        verifiedAt:       d.verified_at           || "—",
        hasGovId:         d.has_government_issued_id || false,
        hasCountryId:     d.has_country_issued_id    || false,
        hasLicense:       d.has_business_license     || false,
        hasTaxCert:       d.has_tax_certificate      || false,
        hasIncCert:       d.has_incorporation_cert   || false,
        daysPending:      d.created_at
          ? Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000)
          : null,
      });
    } catch (err) {
      console.error("Vendor detail load error:", err);
      setVendorDetail(vendor);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVendorAction = async (vendorId, action, reason = "") => {
    setActionLoading(true);
    try {
      await updateVerificationStatus(vendorId, action, reason);
      const newStatus = action === "approved" ? "Approved" : normStatus(action);
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, status: newStatus } : v));
      setVendorDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error("Vendor action failed:", err);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async (reason) => {
    if (!vendorDetail) return;
    setTerminateLoading(true);
    try {
      await updateVerificationStatus(vendorDetail.id, "suspended", reason);
      setVendors((prev) => prev.map((v) => v.id === vendorDetail.id ? { ...v, status: "Suspended" } : v));
      setVendorDetail((prev) => prev ? { ...prev, status: "Suspended" } : prev);
      setShowTerminate(false);
    } catch (err) {
      console.error("Terminate failed:", err);
      alert("Termination failed. Please try again.");
    } finally {
      setTerminateLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F3F4F6] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Navbar */}
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 space-y-5">

              {/* Page title + refresh */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">Vendor Management</h1>
                <button
                  onClick={loadData}
                  title="Refresh page data"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Vendors"        value={stats.total}    type="vendors" />
                <StatCard label="Pending Verification" value={stats.pending}  type="pending" />
                <StatCard label="Vendors Approved"     value={stats.approved} type="earners" />
              </div>

              {/* Vendor list */}
              {loading ? (
                <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
              ) : (
                <VendorListWithFilters
                  vendors={vendors}
                  onSelect={handleSelectVendor}
                  selectedId={selectedVendor?.id}
                  onRefresh={loadData}
                />
              )}
            </main>

            {/* Footer */}
            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
              <div>© 2026 Vendor Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {/* Vendor detail modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">Vendor Profile</h2>
              <button
                onClick={() => { setSelectedVendor(null); setVendorDetail(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-100 h-9 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : vendorDetail ? (
              <VendorProfile
                vendor={vendorDetail}
                onApprove={() => handleVendorAction(vendorDetail.id, "approved")}
                onSuspend={() => handleVendorAction(vendorDetail.id, "suspended")}
                onReviewDocuments={() => setShowDocReview(true)}
                onTerminate={() => setShowTerminate(true)}
                actionLoading={actionLoading}
              />
            ) : null}
          </div>
        </div>
      )}

      {showDocReview && vendorDetail && (
        <DocumentReviewModal
          vendorId={vendorDetail.id}
          vendorName={vendorDetail.name}
          onClose={() => setShowDocReview(false)}
        />
      )}

      {showTerminate && vendorDetail && (
        <TerminateVendorModal
          vendor={vendorDetail}
          onConfirm={handleTerminate}
          onClose={() => setShowTerminate(false)}
          loading={terminateLoading}
        />
      )}
    </div>
  );
};

export default AdminManagement;