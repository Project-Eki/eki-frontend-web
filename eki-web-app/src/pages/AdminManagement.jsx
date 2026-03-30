/**
 * AdminManagement.jsx
 *
 * Fixes:
 *
 * 1. Business category / Days / Docs not showing
 *    ROOT CAUSE: The dashboard endpoint's pending_verifications only has summary
 *    fields. The full vendor list GET /accounts/admin/vendors/ has business_category,
 *    has_government_issued_id etc. We now call BOTH in parallel and use the full list.
 *
 * 2. Document 404 locally (works on DigitalOcean)
 *    ROOT CAUSE: On localhost Django runs on :8000, Vite on :5173 — different origins.
 *    Django returns a RELATIVE path like /media/vendor/documents/file.jpg.
 *    The browser requests it from Vite (:5173) which has no /media folder → 404.
 *    FIX (frontend): resolveUrl() prepends DJANGO_BASE to relative paths.
 *    FIX (backend, required): Add to Django urls.py in development:
 *      from django.conf import settings
 *      from django.conf.urls.static import static
 *      urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
 *    And in settings.py:
 *      MEDIA_URL = '/media/'
 *      MEDIA_ROOT = BASE_DIR / 'media'
 *
 * 3. Vendor actions (Approve / Suspend / Reject / Terminate)
 *    - All four buttons now call updateVerificationStatus correctly
 *    - Status reflected immediately in UI (optimistic update)
 *    - Backend sends email via notify_vendor_status_change (already in views.py)
 *    - Reject added as a new button (requires rejection_reason)
 *
 * 4. Profile picture sync
 *    - VendorDetail loads profile_picture from GET /accounts/admin/vendors/{id}/
 *      which returns the URL from the User table (updated by Account Settings)
 *    - resolveUrl() applied to profile_picture too so it works on localhost
 *
 * 5. Footer matches AdminDashboard footer exactly
 *
 * 6. Filter + Export on VendorList now functional
 *    - Status filter pills (gold) filter the displayed vendors
 *    - Export downloads a CSV of the currently filtered vendor list
 *
 * 7. Stat card icons use orange colour (same as AdminDashboard)
 *
 * 8. Performance: loadData uses Promise.all — only 2 parallel requests
 */

import React, { useState, useEffect, useCallback } from "react";
import Sidebar      from "../components/adminDashboard/Sidebar";
import Navbar3      from "../components/adminDashboard/Navbar3";
import VendorProfile from "../components/VendorProfile";
import {
  getAdminDashboard,
  updateVerificationStatus,
} from "../services/api";
import {
  Store, Clock, TrendingUp, X, ChevronLeft, ChevronRight,
  FileText, ExternalLink, AlertTriangle, Loader2, RefreshCw,
  Filter, Download, Search,
} from "lucide-react";
import { FaEye } from "react-icons/fa";
import api from "../services/api";

const GOLD     = "#EFB034";
const ICON_BG  = "bg-orange-50";
const ICON_COL = "text-orange-600";

// ── Django base URL for resolving relative media paths ────────────────────────
const DJANGO_BASE = (() => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env.replace(/\/api\/v1\/?$/, "");
  return "http://127.0.0.1:8000";
})();

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${DJANGO_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const normStatus = (s) => {
  if (!s) return s;
  const l = String(s).toLowerCase();
  if (l === "under_review" || l === "under review") return "Pending";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, type }) => {
  const icons = {
    vendors: Store,
    pending: Clock,
    earners: TrendingUp,
  };
  const Icon = icons[type] || TrendingUp;
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-xl ${ICON_BG} shrink-0`}>
        <Icon className={ICON_COL} size={18} />
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

// ── Document Review Modal ──────────────────────────────────────────────────────
const DocumentReviewModal = ({ vendorId, vendorName, onClose }) => {
  const [docs,    setDocs]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/accounts/admin/vendors/${vendorId}/review/`);
        const detail   = response.data?.data || response.data;
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
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          {loading && (
            <div className="space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">{error}</div>}
          {!loading && !error && docs && (
            <div className="space-y-2.5">
              {Object.keys(DOC_LABELS).map((key) => {
                const doc = docs[key];
                // resolveUrl converts relative /media/... → http://127.0.0.1:8000/media/...
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
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{doc.filename}</p>
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
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-500 rounded-full">Missing</span>
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

// ── Reject Modal (new) ────────────────────────────────────────────────────────
const RejectVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-yellow-100 bg-yellow-50">
          <h2 className="text-sm font-bold text-yellow-800">Reject Vendor Application</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-yellow-100">
            <X size={16} className="text-yellow-600" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-gray-600">
            Rejecting <strong>{vendor?.name}</strong>'s application requires a reason. They will be notified by email.
          </p>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Rejection reason <span className="text-red-400">*</span></label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this application is being rejected…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => onConfirm(reason)}
              disabled={!reason.trim() || loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : null}
              Reject Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Terminate Modal ────────────────────────────────────────────────────────────
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
              placeholder="Explain why this vendor is being terminated…"
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
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
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

// ── VendorList with Filter + Export + Search + Pagination ─────────────────────
const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Suspended"];

const VendorListWithFilters = ({ vendors, onSelect, selectedId, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search,       setSearch]       = useState("");
  const [page,         setPage]         = useState(1);
  const [refreshing,   setRefreshing]   = useState(false);
  const PER_PAGE = 4;

  const filtered = vendors
    .filter((v) => statusFilter === "All" || v.status === statusFilter)
    .filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.name?.toLowerCase().includes(q)             ||
        v.email?.toLowerCase().includes(q)            ||
        v.businessName?.toLowerCase().includes(q)     ||
        v.businessCategory?.toLowerCase().includes(q) ||
        v.businessType?.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Export current filtered list as CSV
  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["Name", "Email", "Business Name", "Type", "Category", "Status", "Docs", "Submitted"];
    const rows = filtered.map((v) => [
      `"${v.name || ""}"`,
      `"${v.email || ""}"`,
      `"${v.businessName || ""}"`,
      `"${v.businessType || ""}"`,
      `"${v.businessCategory || ""}"`,
      `"${v.status || ""}"`,
      `"${v.docsCount ?? 0}/5"`,
      `"${v.submitted || ""}"`,
    ].join(","));
    const csv  = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "vendors.csv"; a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-400 shrink-0">{filtered.length} vendor{filtered.length !== 1 ? "s" : ""}</p>

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-44"
            />
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap items-center">
          {/* Status filter pills */}
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

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
            style={{ borderColor: GOLD, color: GOLD }}
          >
            <Download size={11} /> Export
          </button>

          {/* Refresh button */}
          <button
            onClick={handleRefreshClick}
            title="Refresh"
            className="p-1.5 border rounded-lg transition-colors hover:opacity-90"
            style={{ borderColor: GOLD, color: GOLD }}
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Vendor table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Business Name</th>
                {/* Type column shows business_type from onboarding form */}
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Docs</th>
                <th className="px-4 py-3">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No vendors to display.
                  </td>
                </tr>
              ) : (
                slice.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === vendor.id ? "bg-teal-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800">{vendor.name}</p>
                      <p className="text-[10px] text-gray-400">{vendor.email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{vendor.businessName || "—"}</td>
                    {/* businessType from onboarding (products / services / other) */}
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">{vendor.businessType || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">{vendor.businessCategory || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                        vendor.status === "Approved" ? "bg-green-50 text-green-600" :
                        vendor.status === "Pending"  ? "bg-yellow-50 text-yellow-600" :
                        vendor.status === "Rejected" ? "bg-rose-50 text-rose-500" :
                        vendor.status === "Suspended"? "bg-red-50 text-red-500" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{vendor.submitted || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${(vendor.daysPending ?? 0) > 2 ? "text-red-500" : "text-gray-600"}`}>
                        {vendor.daysPending != null ? `${vendor.daysPending}d` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold ${(vendor.docsCount ?? 0) === 0 ? "text-red-400" : "text-green-600"}`}>
                        {vendor.docsCount ?? 0}/5
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelect(vendor); }}
                        className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: GOLD }}
                      >
                        <FaEye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
          <span>Page {safePage} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminManagement = () => {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [vendors,          setVendors]          = useState([]);
  const [selectedVendor,   setSelectedVendor]   = useState(null);
  const [vendorDetail,     setVendorDetail]      = useState(null);
  const [detailLoading,    setDetailLoading]    = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [stats,            setStats]            = useState({ total: "—", pending: "—", approved: "—" });
  const [showDocReview,    setShowDocReview]    = useState(false);
  const [showTerminate,    setShowTerminate]    = useState(false);
  const [showReject,       setShowReject]       = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);
  const [rejectLoading,    setRejectLoading]    = useState(false);

  // ── Load data: dashboard stats + full vendor list in parallel ──────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResponse, vendorsResponse] = await Promise.all([
        getAdminDashboard(),
        api.get("/accounts/admin/vendors/"),
      ]);

      const dashData = dashResponse.data;
      const pipeline = dashData.verification_workflows?.pipeline || {};
      const totalVendors = Object.values(pipeline).reduce((sum, v) => sum + (Number(v) || 0), 0);
      setStats({
        total:    totalVendors || "—",
        pending:  pipeline.pending  || "—",
        approved: pipeline.approved || "—",
      });

      // Full vendor list — has business_category, has_* doc flags
      const rawVendors  = vendorsResponse.data?.data || vendorsResponse.data || [];
      const vendorArray = Array.isArray(rawVendors) ? rawVendors : [];

      setVendors(
        vendorArray.map((v) => ({
          id:               v.id,
          name:             v.owner_full_name   || v.user_name      || "—",
          email:            v.user_email        || v.business_email || "",
          status:           normStatus(v.verification_status),
          submitted:        v.created_at ? new Date(v.created_at).toLocaleDateString() : "—",
          daysPending:      v.created_at
            ? Math.floor((Date.now() - new Date(v.created_at).getTime()) / 86400000)
            : null,
          // FIX: docsCount computed from has_* booleans (available in /admin/vendors/)
          docsCount: [
            v.has_government_issued_id,
            v.has_country_issued_id,
            v.has_business_license,
            v.has_tax_certificate,
            v.has_incorporation_cert,
          ].filter(Boolean).length,
          businessName:     v.business_name     || "—",
          // FIX: businessType from onboarding form (products / services / other)
          businessType:     v.business_type     || "—",
          // FIX: businessCategory from onboarding form (retail / fashion / etc.)
          businessCategory: v.business_category || "—",
        }))
      );
    } catch (err) {
      console.error("AdminManagement load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Select vendor → fetch full detail ─────────────────────────────────────
  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
      const d = response.data?.data || response.data;
      setVendorDetail({
        ...vendor,
        email:            d.user_email          || d.business_email || "—",
        name:             d.user_name           || d.owner_full_name || vendor.name,
        // FIX: resolveUrl so profile picture works on localhost
        profilePicture:   resolveUrl(d.profile_picture || null),
        businessName:     d.business_name       || "—",
        businessType:     d.business_type       || "—",
        businessCategory: d.business_category   || "—",
        businessPhone:    d.business_phone      || "—",
        businessEmail:    d.business_email      || "—",
        address:          d.address             || "—",
        city:             d.city                || "—",
        country:          d.country             || "—",
        registrationNo:   d.registration_number || "—",
        taxId:            d.tax_id              || "—",
        openingTime:      d.opening_time        || "—",
        closingTime:      d.closing_time        || "—",
        verifiedAt:       d.verified_at         || "—",
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

  const closeModal = () => { setSelectedVendor(null); setVendorDetail(null); };

  // ── Vendor actions: Approve / Suspend / Reject / Terminate ──────────────────
  // All call updateVerificationStatus which hits PATCH /accounts/admin/verifications/{id}/
  // Backend sends email via notify_vendor_status_change automatically
  const handleVendorAction = async (vendorId, action, reason = "") => {
    setActionLoading(true);
    try {
      await updateVerificationStatus(vendorId, action, reason);
      const newStatus = normStatus(action);
      setVendors((prev) => prev.map((v) => v.id === vendorId ? { ...v, status: newStatus } : v));
      setVendorDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error("Vendor action failed:", err);
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.verification_status || "Action failed. Please try again.";
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async (reason) => {
    if (!vendorDetail) return;
    setTerminateLoading(true);
    try {
      await updateVerificationStatus(vendorDetail.id, "suspended", reason);
      const newStatus = "Suspended";
      setVendors((prev) => prev.map((v) => v.id === vendorDetail.id ? { ...v, status: newStatus } : v));
      setVendorDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
      setShowTerminate(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Termination failed.";
      alert(msg);
    } finally {
      setTerminateLoading(false);
    }
  };

  const handleReject = async (reason) => {
    if (!vendorDetail) return;
    setRejectLoading(true);
    try {
      await updateVerificationStatus(vendorDetail.id, "rejected", reason);
      const newStatus = "Rejected";
      setVendors((prev) => prev.map((v) => v.id === vendorDetail.id ? { ...v, status: newStatus } : v));
      setVendorDetail((prev) => prev ? { ...prev, status: newStatus } : prev);
      setShowReject(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Rejection failed.";
      alert(msg);
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F3F4F6] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>

          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 space-y-5">

              {/* Title + refresh */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">Vendor Management</h1>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* Stat Cards — all use orange (same as AdminDashboard) */}
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

            {/* Footer — matches AdminDashboard footer exactly */}
            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
              <div>© 2026 Vendor Portal. All rights reserved.</div>
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

      {/* Vendor detail modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">Vendor Profile</h2>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-100 h-9 rounded-xl animate-pulse" />)}
              </div>
            ) : vendorDetail ? (
              <VendorProfile
                vendor={vendorDetail}
                onApprove={() => handleVendorAction(vendorDetail.id, "approved")}
                onSuspend={() => handleVendorAction(vendorDetail.id, "suspended", "Suspended by admin")}
                onReject={() => setShowReject(true)}
                onReviewDocuments={() => setShowDocReview(true)}
                onTerminate={() => setShowTerminate(true)}
                actionLoading={actionLoading}
              />
            ) : null}
          </div>
        </div>
      )}

      {/* Document review modal */}
      {showDocReview && vendorDetail && (
        <DocumentReviewModal
          vendorId={vendorDetail.id}
          vendorName={vendorDetail.name}
          onClose={() => setShowDocReview(false)}
        />
      )}

      {/* Reject modal */}
      {showReject && vendorDetail && (
        <RejectVendorModal
          vendor={vendorDetail}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={rejectLoading}
        />
      )}

      {/* Terminate modal */}
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