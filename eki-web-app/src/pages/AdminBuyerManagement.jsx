import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import BuyerProfile from "../components/Buyermanagement/BuyerProfile";
import BuyerList from "../components/Buyermanagement/BuyerList";
// import {
//   getAdminDashboard,
//   getBuyers,
//   updateBuyerStatus,
// } from "../services/api";
import {
  Users, UserCheck, UserX, X, FileText, ExternalLink, AlertTriangle, Loader2, RefreshCw, Ban, CheckCircle
} from "lucide-react";
// import api from "../services/api";

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

// Suspend Modal
const SuspendBuyerModal = ({ buyer, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const canConfirm = confirmText === "SUSPEND" && reason.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-orange-100 bg-orange-50">
          <div className="flex items-center gap-2">
            <Ban size={16} className="text-orange-600" />
            <h2 className="text-sm font-bold text-orange-800">Suspend Buyer</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-orange-100">
            <X size={16} className="text-orange-500" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            This will temporarily suspend <strong>{buyer?.name}</strong>. They will lose access until reinstated.
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason <span className="text-red-400">*</span></label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this buyer is being suspended..."
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
              Suspend Buyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activate Modal (for reinstating suspended buyers)
const ActivateBuyerModal = ({ buyer, onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-green-100 bg-green-50">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-green-600" />
            <h2 className="text-sm font-bold text-green-800">Activate Buyer Account</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-100">
            <X size={16} className="text-green-600" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <p className="text-xs text-gray-600">
            This will activate <strong>{buyer?.name}</strong>'s account. They will regain full access.
          </p>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason (Optional)</label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this buyer being activated?"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 disabled:opacity-40"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Activate Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Terminate Modal
const TerminateBuyerModal = ({ buyer, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const canConfirm = confirmText === "TERMINATE" && reason.trim().length > 0;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            <h2 className="text-sm font-bold text-red-800">Terminate Buyer Account</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-100">
            <X size={16} className="text-red-500" />
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            This will permanently terminate <strong>{buyer?.name}</strong>'s account. This action cannot be undone.
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-gray-700">Reason <span className="text-red-400">*</span></label>
            <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this buyer is being terminated…"
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

// Main Page
const AdminBuyerManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [buyerDetail, setBuyerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: "—", active: "—", suspended: "—" });
  const [showTerminate, setShowTerminate] = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [showActivate, setShowActivate] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResponse, buyersResponse] = await Promise.all([
        getAdminDashboard(),
        getBuyers(), // You'll need to implement this API function
      ]);

      // Get buyer array from response
      const rawBuyers = buyersResponse.data?.data || buyersResponse.data || [];
      const buyerArray = Array.isArray(rawBuyers) ? rawBuyers : [];

      // Calculate stats
      const activeBuyers = buyerArray.filter(b => b.status === "Active").length;
      const suspendedBuyers = buyerArray.filter(b => b.status === "Suspended").length;

      setStats({
        total: buyerArray.length || "—",
        active: activeBuyers || "—",
        suspended: suspendedBuyers || "—",
      });

      // Map buyers from signup form data structure
      setBuyers(
        buyerArray.map((b) => ({
          id: b.id,
          buyerId: b.buyer_id || `BYR${b.id}`,
          name: `${b.first_name || ""} ${b.last_name || ""}`.trim() || b.full_name || "—",
          email: b.email || "",
          phoneNumber: b.phone_number || "",
          dateOfBirth: b.date_of_birth || "",
          status: b.status || "Active",
          joinedDate: b.created_at ? new Date(b.created_at).toLocaleDateString() : "—",
          address: b.address || "",
          city: b.city || "",
          country: b.country || "",
          totalOrders: b.total_orders || 0,
          totalSpent: b.total_spent || 0,
          lastActive: b.last_active ? new Date(b.last_active).toLocaleDateString() : "—",
          profilePicture: resolveUrl(b.profile_picture || null),
        })),
      );
    } catch (err) {
      console.error("AdminBuyerManagement load error:", err);
    } finally {
      setLoading(false);
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

  const handleSelectBuyer = async (buyer) => {
    setSelectedBuyer(buyer);
    setBuyerDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/buyers/${buyer.id}/`);
      const d = response.data?.data || response.data;
      setBuyerDetail({
        ...buyer,
        email: d.email || buyer.email,
        name: `${d.first_name || ""} ${d.last_name || ""}`.trim() || d.full_name || buyer.name,
        profilePicture: resolveUrl(d.profile_picture || null),
        dateOfBirth: d.date_of_birth || buyer.dateOfBirth,
        phoneNumber: d.phone_number || buyer.phoneNumber,
        address: d.address || buyer.address,
        city: d.city || buyer.city,
        country: d.country || buyer.country,
        totalOrders: d.total_orders || buyer.totalOrders,
        totalSpent: d.total_spent || buyer.totalSpent,
        lastActive: d.last_active ? new Date(d.last_active).toLocaleDateString() : buyer.lastActive,
        joinedDate: d.created_at ? new Date(d.created_at).toLocaleDateString() : buyer.joinedDate,
      });
    } catch (err) {
      console.error("Buyer detail load error:", err);
      setBuyerDetail(buyer);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedBuyer(null);
    setBuyerDetail(null);
  };

  const handleSuspend = async (reason) => {
    if (!buyerDetail) return;
    setSuspendLoading(true);
    try {
      await updateBuyerStatus(buyerDetail.id, "suspended", reason);
      const newStatus = "Suspended";
      setBuyers((prev) =>
        prev.map((b) =>
          b.id === buyerDetail.id ? { ...b, status: newStatus } : b,
        ),
      );
      setBuyerDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowSuspend(false);
      alert("Buyer has been suspended successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Suspension failed.");
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleActivate = async (reason) => {
    if (!buyerDetail) return;
    setActivateLoading(true);
    try {
      await updateBuyerStatus(buyerDetail.id, "active", reason);
      const newStatus = "Active";
      setBuyers((prev) =>
        prev.map((b) =>
          b.id === buyerDetail.id ? { ...b, status: newStatus } : b,
        ),
      );
      setBuyerDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowActivate(false);
      alert("Buyer account has been activated successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || "Activation failed.");
    } finally {
      setActivateLoading(false);
    }
  };

  const handleTerminate = async (reason) => {
    if (!buyerDetail) return;
    setTerminateLoading(true);
    try {
      await updateBuyerStatus(buyerDetail.id, "terminated", reason);
      const newStatus = "Inactive";
      setBuyers((prev) =>
        prev.map((b) =>
          b.id === buyerDetail.id ? { ...b, status: newStatus } : b,
        ),
      );
      setBuyerDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setShowTerminate(false);
      alert("Buyer account has been terminated.");
    } catch (err) {
      alert(err?.response?.data?.message || "Termination failed.");
    } finally {
      setTerminateLoading(false);
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
                  Buyer Management
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
              {/* Stats cards - Updated to match dashboard UI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Buyers" 
                  number={stats.total} 
                  icon={Users} 
                  iconBgColor="bg-[#235E5D]" 
                  iconColor="text-white" 
                />
                <StatCard 
                  title="Active Buyers" 
                  number={stats.active} 
                  icon={UserCheck} 
                  iconBgColor="bg-[#EFB034]" 
                  iconColor="text-white" 
                />
                <StatCard 
                  title="Suspended Buyers" 
                  number={stats.suspended} 
                  icon={UserX} 
                  iconBgColor="bg-[#EFB034]" 
                  iconColor="text-white" 
                />
              </div>
              {/* Buyer table */}
              {loading ? (
                <div className="bg-gray-100 rounded-xl h-48 animate-pulse" />
              ) : (
                <BuyerList
                  buyers={buyers}
                  onSelect={handleSelectBuyer}
                  selectedId={selectedBuyer?.id}
                />
              )}
            </main>

            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">
                Buy Smart. Sell Fast. Grow Together...
              </div>
              <div>© 2026 EKI Marketplace. All rights reserved.</div>
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

      {selectedBuyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold text-gray-900">
                Buyer Profile
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
            ) : buyerDetail ? (
              <BuyerProfile
                buyer={buyerDetail}
                onSuspend={() => setShowSuspend(true)}
                onActivate={() => setShowActivate(true)}
                onTerminate={() => setShowTerminate(true)}
                actionLoading={actionLoading}
              />
            ) : null}
          </div>
        </div>
      )}

      {showSuspend && buyerDetail && (
        <SuspendBuyerModal
          buyer={buyerDetail}
          onConfirm={handleSuspend}
          onClose={() => setShowSuspend(false)}
          loading={suspendLoading}
        />
      )}
      {showActivate && buyerDetail && (
        <ActivateBuyerModal
          buyer={buyerDetail}
          onConfirm={handleActivate}
          onClose={() => setShowActivate(false)}
          loading={activateLoading}
        />
      )}
      {showTerminate && buyerDetail && (
        <TerminateBuyerModal
          buyer={buyerDetail}
          onConfirm={handleTerminate}
          onClose={() => setShowTerminate(false)}
          loading={terminateLoading}
        />
      )}
    </div>
  );
};

export default AdminBuyerManagement;