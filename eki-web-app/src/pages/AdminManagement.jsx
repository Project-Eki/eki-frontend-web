import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import VendorProfile from "../components/VendorProfile";
import VendorList from "../components/VendorList"; 
import {
  getAdminDashboard,
  updateVerificationStatus,
  updateVendorStatus,
} from "../services/api";
import {
  Store, Clock, TrendingUp, X, FileText, ExternalLink, AlertTriangle, Loader2, RefreshCw, Ban
} from "lucide-react";
import api from "../services/api";

const GOLD = "#EFB034";

// Django base URL for resolving relative media paths
const DJANGO_BASE = (() => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env.replace(/\/api\/v1\/?$/, "");
  return "http://134.122.22.45";
})();

const resolveUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${DJANGO_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
};

const normStatus = (s) => {
  if (!s) return "Pending";
  const l = String(s).toLowerCase();
  if (l === "under_review" || l === "under review" || l === "pending_review") return "Pending";
  if (l === "verified" || l === "active") return "Approved";
  if (l === "suspended" || l === "banned") return "Suspended";
  if (l === "rejected" || l === "denied") return "Rejected";
  if (l === "terminated") return "Terminated";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

// Stat card with custom colors per card type
const StatCard = ({ label, value, type }) => {
  const icons = {
    vendors: Store,
    pending: Clock,
    earners: TrendingUp,
  };
  const Icon = icons[type] || TrendingUp;

  const getCardColors = () => {
    switch (type) {
      case 'vendors':
        return { bg: 'bg-[#235E5D]', text: 'text-white' };
      case 'pending':
        return { bg: 'bg-[#EFB034]', text: 'text-white' };
      case 'earners':
        return { bg: 'bg-[#EFB034]', text: 'text-white' };
      default:
        return { bg: 'bg-[#235E5D]', text: 'text-white' };
    }
  };

  const colors = getCardColors();

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className={`p-2 rounded-xl ${colors.bg} shrink-0`}>
        <Icon className={colors.text} size={18} />
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

// Document Review Modal
const DocumentReviewModal = ({ vendorId, vendorName, onClose }) => {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/accounts/admin/vendors/${vendorId}/review/`);
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
    country_issued_id: "Country Issued ID",
    business_license: "Business License",
    tax_certificate: "Tax Certificate",
    incorporation_cert: "Incorporation Certificate",
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
                const absoluteUrl = resolveUrl(doc?.url);
                return (
                  <div key={key}
                    className={`flex items-center justify-between p-3 rounded-xl border ${doc ? "border-green-100 bg-green-50/40" : "border-gray-100 bg-gray-50"}`}
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
                      <a href={absoluteUrl} target="_blank" rel="noopener noreferrer"
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

// Reject Modal
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
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this application is being rejected…"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={!reason.trim() || loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl hover:bg-yellow-600 disabled:opacity-40"
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

// Suspend Modal
const SuspendVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const canConfirm = confirmText === "SUSPEND" && reason.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2">
            <Ban size={16} className="text-orange-600" />
            <h2 className="text-sm font-bold text-orange-800">Suspend Vendor</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100">
            <X size={16} className="text-orange-500" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            This will temporarily suspend <strong>{vendor?.name}</strong>. They will lose access until reinstated.
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason <span className="text-red-400">*</span></label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this vendor is being suspended..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">
              Type <span className="font-black text-orange-600 tracking-wider">SUSPEND</span> to confirm
            </label>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUSPEND"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={!canConfirm || loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 disabled:opacity-40"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
              Suspend Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terminate Modal
const TerminateVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
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
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">
              Type <span className="font-black text-red-600 tracking-wider">TERMINATE</span> to confirm
            </label>
            <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
              placeholder="TERMINATE"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={!canConfirm || loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reinstate Modal
const ReinstateVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-green-100 bg-green-50">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-green-600" />
            <h2 className="text-sm font-bold text-green-800">Reinstate Vendor</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-100">
            <X size={16} className="text-green-600" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-gray-600">
            This will reinstate <strong>{vendor?.name}</strong>. They will regain access to their account.
          </p>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason (Optional)</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this vendor being reinstated?"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Reinstate Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Page
const AdminManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: "—", pending: "—", approved: "—" });
  const [showDocReview, setShowDocReview] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showReinstate, setShowReinstate] = useState(false);
  const [reinstateLoading, setReinstateLoading] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResponse, vendorsResponse] = await Promise.all([
        getAdminDashboard(),
        api.get("/accounts/admin/vendors/"),
      ]);

      // Get vendor array from response
      const rawVendors = vendorsResponse.data?.data || vendorsResponse.data || [];
      const vendorArray = Array.isArray(rawVendors) ? rawVendors : [];

      // Calculate stats from actual vendor data
      const totalVendors = vendorArray.length;
      const pendingVendors = vendorArray.filter(v =>
        v.verification_status === "pending" || v.verification_status === "under_review"
      ).length;
      const approvedVendors = vendorArray.filter(v =>
        v.verification_status === "approved"
      ).length;

      setStats({
        total: totalVendors || "—",
        pending: pendingVendors || "—",
        approved: approvedVendors || "—",
      });

      // Map vendors with all fields 
      setVendors(
        vendorArray.map((v) => ({
          id: v.id,
          name: v.business_name || v.owner_full_name || v.user_name || "—",
          email: v.user_email || v.business_email || "",
          status: normStatus(v.verification_status),
          submitted: v.created_at ? new Date(v.created_at).toLocaleDateString() : "—",
          businessName: v.business_name || "—",
          businessType: v.business_type || "—",
          businessCategory: v.business_category || "—",
        }))
      );
    } catch (err) {
      console.error("AdminManagement load error:", err);
    } finally {
      setLoading(false);
      // The refresh button shows a spinning animation and becomes disabled
      setRefreshing(false);   
    }
  }, []);

  
  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
      const d = response.data?.data || response.data;
      setVendorDetail({
        ...vendor,
        email: d.user_email || d.business_email || "—",
        name: d.user_name || d.owner_full_name || vendor.name,
        profilePicture: resolveUrl(d.profile_picture || null),
        businessName: d.business_name || "—",
        businessType: d.business_type || "—",
        businessCategory: d.business_category || "—",
        businessPhone: d.business_phone || "—",
        businessEmail: d.business_email || "—",
        address: d.address || "—",
        city: d.city || "—",
        country: d.country || "—",
        registrationNo: d.registration_number || "—",
        taxId: d.tax_id || "—",
        openingTime: d.opening_time || "—",
        closingTime: d.closing_time || "—",
        verifiedAt: d.verified_at || "—",
        hasGovId: d.has_government_issued_id || false,
        hasCountryId: d.has_country_issued_id || false,
        hasLicense: d.has_business_license || false,
        hasTaxCert: d.has_tax_certificate || false,
        hasIncCert: d.has_incorporation_cert || false,
      });
    } catch (err) {
      console.error("Vendor detail load error:", err);
      setVendorDetail(vendor);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedVendor(null);
    setVendorDetail(null);
  };

  const handleApprove = async (vendorId) => {
    setActionLoading(true);
    try {
      await updateVerificationStatus(vendorId, "approved");
      const newStatus = "Approved";
      setVendors((prev) => prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v)));
      setVendorDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
      console.error("Approve failed:", err);
      alert(err?.response?.data?.message || "Approval failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (reason) => {
    if (!vendorDetail) return;
    setSuspendLoading(true);
    try {
      await updateVendorStatus(vendorDetail.id, "suspended", reason);
      const newStatus = "Suspended";
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorDetail.id ? { ...v, status: newStatus } : v,
        ),
      );
      setVendorDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowSuspend(false);
      alert("Vendor has been suspended successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Suspension failed.");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleTerminate = async (reason) => {
    if (!vendorDetail) return;
    setTerminateLoading(true);
    try {
      await updateVendorStatus(vendorDetail.id, "terminated", reason);
      const newStatus = "Terminated";
      setVendors((prev) => prev.map((v) => (v.id === vendorDetail.id ? { ...v, status: newStatus } : v)));
      setVendorDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowTerminate(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Termination failed.");
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
      setVendors((prev) => prev.map((v) => (v.id === vendorDetail.id ? { ...v, status: newStatus } : v)));
      setVendorDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowReject(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Rejection failed.");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleReinstate = async (reason) => {
    if (!vendorDetail) return;
    setReinstateLoading(true);
    try {
      await updateVendorStatus(vendorDetail.id, "approved", reason || "Reinstated by admin");
      const newStatus = "Approved";
      setVendors((prev) => prev.map((v) => (v.id === vendorDetail.id ? { ...v, status: newStatus } : v)));
      setVendorDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowReinstate(false);
      alert("Vendor has been reinstated successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Reinstatement failed.");
    } finally {
      setReinstateLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7] font-sans">
      <div className="flex flex-1 min-h-0">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6 space-y-5">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-bold text-gray-900">
                  Vendor Management
                </h1>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                  style={{ borderColor: GOLD, color: GOLD }}
                >
                  <RefreshCw
                    size={12}
                    className={refreshing ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  label="Total Vendors"
                  value={stats.total}
                  type="vendors"
                />
                <StatCard
                  label="Pending Verification"
                  value={stats.pending}
                  type="pending"
                />
                <StatCard
                  label="Vendors Approved"
                  value={stats.approved}
                  type="earners"
                />
              </div>
              {/* Vendor table */}
              {loading ? (
                <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
              ) : (
                <VendorList
                  vendors={vendors}
                  onSelect={handleSelectVendor}
                  selectedId={selectedVendor?.id}
                />
              )}
            </main>

            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">
                Buy Smart. Sell Fast. Grow Together...
              </div>
              <div>© 2026 Vendor Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki
                  <span className="absolute text-[5px] -bottom-0 -right-2">
                    TM
                  </span>
                </span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">
                  Privacy Policy
                </span>
                <span className="cursor-pointer hover:underline">
                  Terms of Service
                </span>
                <span className="cursor-pointer hover:underline">
                  Ijoema ltd
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">
                Vendor Profile
              </h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            {detailLoading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 h-9 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : vendorDetail ? (
              <VendorProfile
                vendor={vendorDetail}
                onApprove={() => handleApprove(vendorDetail.id)}
                onSuspend={() => setShowSuspend(true)}
                onReject={() => setShowReject(true)}
                onReviewDocuments={() => setShowDocReview(true)}
                onTerminate={() => setShowTerminate(true)}
                onReinstate={() => setShowReinstate(true)}
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
      {showReject && vendorDetail && (
        <RejectVendorModal
          vendor={vendorDetail}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
          loading={rejectLoading}
        />
      )}
      {showSuspend && vendorDetail && (
        <SuspendVendorModal
          vendor={vendorDetail}
          onConfirm={handleSuspend}
          onClose={() => setShowSuspend(false)}
          loading={suspendLoading}
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
      {showReinstate && vendorDetail && (
        <ReinstateVendorModal
          vendor={vendorDetail}
          onConfirm={handleReinstate}
          onClose={() => setShowReinstate(false)}
          loading={reinstateLoading}
        />
      )}
    </div>
  );
};

export default AdminManagement;