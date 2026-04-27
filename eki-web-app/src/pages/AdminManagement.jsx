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
  Store, Clock, CheckCircle, X, FileText, AlertTriangle, Loader2, RefreshCw, Ban, Eye
} from "lucide-react";
import api from "../services/api";

const GOLD = "#EFB034";

// Django base URL for resolving relative media paths
const DJANGO_BASE = (() => {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) {
    // If it's an absolute URL (http/https), strip /api/v1
    if (env.startsWith("http://") || env.startsWith("https://")) {
      return env.replace(/\/api\/v1\/?$/, "");
    }
    // If it's a relative URL like '/api/v1', Django is on the same origin
    return window.location.origin;
  }
  return window.location.origin;
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

// StatCard component - matching Dashboard UI
const StatCard = ({ title, number, icon: Icon, iconBgColor = 'bg-[#235E5D]', iconColor = 'text-white' }) => {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between border border-gray-100">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <h3 className={`text-3xl font-bold mt-1 ${number === "—" ? "text-gray-300" : "text-gray-900"}`}>
          {number}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center`}>
        <Icon size={22} strokeWidth={1.8} />
      </div>
    </div>
  );
};

// Document Viewer Modal - Same pattern as Business Settings
const DocumentViewerModal = ({ url, label, onClose }) => {
  const [loaded, setLoaded] = useState(false);
  const absoluteUrl = resolveUrl(url);
  const isPDF = absoluteUrl?.split("?")[0].toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={17} className="text-slate-500" />
          </button>
        </div>

        {/* Loading spinner */}
        {!loaded && (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-[#EFB034]" />
              <p className="text-xs text-slate-400">Loading document…</p>
            </div>
          </div>
        )}

        {/* Document */}
        <div className={`flex-1 overflow-auto ${loaded ? "block" : "hidden"}`}>
          {isPDF ? (
            <iframe src={absoluteUrl} title={label} className="w-full h-[75vh]" onLoad={() => setLoaded(true)} />
          ) : (
            <img src={absoluteUrl} alt={label} className="w-full h-auto object-contain p-4" onLoad={() => setLoaded(true)} onError={() => setLoaded(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

// Document Review Modal 
const DocumentReviewModal = ({ vendorId, vendorName, onClose }) => {
  const [docs, setDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewerDoc, setViewerDoc] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/accounts/admin/vendors/${vendorId}/review/`);
        console.log("=== FULL API RESPONSE ===");
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);
        console.log("Data:", response.data);
        
        const detail = response.data?.data || response.data;
        
        console.log("=== PARSED DETAIL ===");
        console.log("Detail object:", detail);
        console.log("Documents object:", detail.documents);
        console.log("Document keys:", Object.keys(detail.documents || {}));
        
        // Log each document's URL
        if (detail.documents) {
          Object.entries(detail.documents).forEach(([key, doc]) => {
            console.log(`Document ${key}:`, {
              url: doc?.url,
              absoluteUrl: resolveUrl(doc?.url),
              filename: doc?.filename,
              expiry: doc?.expiry_date
            });
          });
        }
        
        setDocs(detail.documents || {});
      } catch (err) {
        console.error("Document fetch error:", err);
        console.error("Error response:", err.response?.data);
        setError(`Failed to load documents: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchDocs();
  }, [vendorId]);

  // Document labels matching the OperationCompliance component exactly
  const DOC_LABELS = {
    government_issued_id: "Government Issued ID",
    business_license: "Business License",
    tax_certificate: "Tax Certificate",
    incorporation_cert: "Incorporation Certificate",
    professional_body_certification: "Professional Certification",
  };

const openDocumentViewer = (url, label) => {
  if (url) {
    const fullUrl = resolveUrl(url);
    console.log(`Opening document viewer for ${label}:`, fullUrl);
    // Add cache-busting parameter to prevent caching issues
    const urlWithCache = `${fullUrl}?t=${Date.now()}`;
    setViewerDoc({ url: urlWithCache, label });
  } else {
    console.warn(`No URL for document: ${label}`);
  }
};

  return (
    <>
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
          <div className="p-5 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="space-y-2.5">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                <p className="font-bold mb-1">Error loading documents:</p>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 text-xs underline"
                >
                  Refresh page
                </button>
              </div>
            )}
            {!loading && !error && docs && (
              <div className="space-y-2.5">
                {Object.entries(DOC_LABELS).map(([key, label]) => {
                  const doc = docs[key];
                  const absoluteUrl = doc?.url ? resolveUrl(doc.url) : null;
                  const isRequired = key !== 'professional_body_certification';
                  const isMissing = !doc || !doc.url;
                  
                  console.log(`Rendering ${key}:`, {
                    hasDoc: !!doc,
                    url: doc?.url,
                    absoluteUrl,
                    isMissing
                  });
                  
                  return (
                    <div key={key}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        !isMissing ? "border-green-100 bg-green-50/40" : 
                        isRequired ? "border-red-100 bg-red-50/40" : "border-gray-100 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <FileText size={14} className={!isMissing ? "text-green-600" : isRequired ? "text-red-400" : "text-gray-400"} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">
                            {label}
                            {!isRequired && <span className="text-[9px] text-gray-400 ml-1">(Optional)</span>}
                          </p>
                          {doc?.filename && (
                            <p className="text-[10px] text-gray-400 mt-0.5 truncate">{doc.filename}</p>
                          )}
                          {doc?.uploaded_at && (
                            <p className="text-[9px] text-gray-400 mt-0.5">
                              Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                          {doc?.expiry_date && key !== 'incorporation_cert' && (
                            <p className="text-[9px] text-amber-600 mt-0.5 flex items-center gap-1">
                              <Clock size={8} /> Expires: {new Date(doc.expiry_date).toLocaleDateString()}
                            </p>
                          )}
                          {key === 'incorporation_cert' && doc && (
                            <p className="text-[9px] text-green-600 mt-0.5 flex items-center gap-1">
                              <CheckCircle size={8} /> No expiry date required
                            </p>
                          )}
                          {!isRequired && !doc && (
                            <p className="text-[9px] text-gray-400 mt-0.5 italic">Optional document</p>
                          )}
                        </div>
                      </div>
                      {absoluteUrl ? (
                        <button
                          onClick={() => openDocumentViewer(absoluteUrl, label)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-teal-700 bg-white border border-teal-100 rounded-lg hover:bg-teal-50 transition-colors shrink-0 ml-2"
                        >
                          <Eye size={9} /> View
                        </button>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                          isRequired ? "bg-red-50 text-red-500" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isRequired ? "Missing" : "Not uploaded"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!loading && !error && !docs && (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-xs text-gray-500">No documents found for this vendor.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewerDoc && (
        <DocumentViewerModal 
          url={viewerDoc.url} 
          label={viewerDoc.label} 
          onClose={() => setViewerDoc(null)} 
        />
      )}
    </>
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

      const rawVendors = vendorsResponse.data?.data || vendorsResponse.data || [];
      const vendorArray = Array.isArray(rawVendors) ? rawVendors : [];

      const dashboardData = dashResponse.data?.data || dashResponse.data || {};
      const summaryCards = dashboardData.overview?.summary_cards || {};

      const pendingVendors = vendorArray.filter(
        (v) =>
          v.verification_status === "pending" ||
          v.verification_status === "under_review",
      ).length;
      const approvedVendors = vendorArray.filter(
        (v) => v.verification_status === "approved",
      ).length;

      setStats({
        total: summaryCards.total_vendors || approvedVendors || vendorArray.length || "—",
        pending: pendingVendors || "—",
        approved: approvedVendors || "—",
      });

      setVendors(
        vendorArray.map((v) => ({
          id: v.id,
          name: v.business_name || v.owner_full_name || v.user_name || "—",
          email: v.user_email || v.business_email || "",
          status: normStatus(v.verification_status),
          submitted: v.created_at
            ? new Date(v.created_at).toLocaleDateString()
            : "—",
          businessName: v.business_name || "—",
          businessType: v.business_type || "—",
          businessCategory: v.business_category || "—",
        })),
      );
    } catch (err) {
      console.error("AdminManagement load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
    
    // Debug the profile picture
    console.log("Profile picture from API:", {
      profile_picture_url: d.profile_picture_url,
      profile_picture: d.profile_picture,
      resolved: resolveUrl(d.profile_picture_url || d.profile_picture || null)
    });
    
    setVendorDetail({
      ...vendor,
      email: d.user_email || d.business_email || "—",
      name: d.user_name || d.owner_full_name || vendor.name,
      // Make sure this is correctly resolving the URL
      profilePicture: resolveUrl(d.profile_picture_url || d.profile_picture || null),
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
       // Documents matching OperationCompliance exactly
      hasGovId: d.has_government_issued_id || false,
      hasLicense: d.has_business_license || false,
      hasTaxCert: d.has_tax_certificate || false,
      hasIncCert: d.has_incorporation_cert || false,
      hasProfCert: d.has_professional_body_certification || false,
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
                  title="Total Vendors" 
                  number={stats.total} 
                  icon={Store} 
                  iconBgColor="bg-[#235E5D]" 
                  iconColor="text-white" 
                />
                <StatCard 
                  title="Pending Verification" 
                  number={stats.pending} 
                  icon={Clock} 
                  iconBgColor="bg-[#EFB034]" 
                  iconColor="text-white" 
                />
                <StatCard 
                  title="Vendors Approved" 
                  number={stats.approved} 
                  icon={CheckCircle} 
                  iconBgColor="bg-[#EFB034]" 
                  iconColor="text-white" 
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