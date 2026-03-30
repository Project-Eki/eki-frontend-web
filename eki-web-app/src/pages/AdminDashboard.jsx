import React, { useState, useEffect, useCallback } from "react";
import { Users, Box, ShieldCheck, ArrowLeftRight, RefreshCw } from "lucide-react";
import Navbar3      from "../components/adminDashboard/Navbar3";
import Sidebar      from "../components/adminDashboard/Sidebar";
import StatCard     from "../components/adminDashboard/StatCard";
import ChartCard    from "../components/adminDashboard/ChartCard";
import ActivityPanel from "../components/adminDashboard/ActivityPanel";
import DataTable    from "../components/adminDashboard/DataTable";
import { getAdminDashboard, getAdminLogs } from "../services/api";

// Gold accent for buttons
const GOLD = "#EFB034";

// Normalise "under_review" / "Under Review" → "Pending"
const normStatus = (s) => {
  if (!s) return s;
  const l = String(s).toLowerCase();
  if (l === "under_review" || l === "under review") return "Pending";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

// StatusBadge — compact version
const StatusBadge = ({ status }) => {
  const norm = normStatus(status);
  const styles = {
    Active:    "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-green-50 text-green-700 border-green-100",
    Pending:   "bg-yellow-50 text-yellow-700 border-yellow-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Resolved:  "bg-teal-50 text-teal-700 border-teal-100",
    Approved:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected:  "bg-rose-50 text-rose-700 border-rose-100",
    Disputed:  "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${styles[norm] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
      {norm}
    </span>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [users,         setUsers]         = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [moderation,    setModeration]    = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activities,    setActivities]    = useState([]);
  const [chartData,     setChartData]     = useState([]);
  const [stats, setStats] = useState({
    totalUsers: "—", activeListings: "—", pendingVerifications: "—", dailyTransactions: "—",
  });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // ── Main data loader ─────────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      // Fetch dashboard + logs in parallel for speed
      const [dashResponse, logsResponse] = await Promise.all([
        getAdminDashboard(),
        getAdminLogs(1).catch(() => ({ data: { results: [] } })), // don't fail if logs error
      ]);

      const apiData = dashResponse.data;

      // ── Stats ────────────────────────────────────────────────────────────
      const summary = apiData.overview?.summary_cards || {};
      setStats({
        totalUsers:           summary.total_users           ?? "—",
        activeListings:       summary.active_listings       ?? "—",
        pendingVerifications: summary.pending_verifications ?? "—",
        dailyTransactions:    summary.daily_transactions    ?? "—",
      });

      //  Monthly chart data 
      // Backend returns: [{ month, date, new_users, listings, value }, ...]
      const monthly = apiData.overview?.weekly_activity || [];
      setChartData(monthly); // ChartCard uses month + new_users + listings keys

      //  Buyers table
      // Only show users with role="buyer"; status normalised
      const rawUsers = apiData.user_management?.recent_users || [];
      setUsers(
        rawUsers
          .filter((u) => !u.role || u.role === "buyer") // filter to buyers only
          .map((u) => ({
            id:      u.id      || u.user_id || "—",
            name:    u.name    || "—",
            email:   u.email   || "—",
            role:    u.role    || "buyer",
            status:  normStatus(u.status),
            created: u.created || "—",
          }))
      );

      // Verification table 
      const rawVer = apiData.verification_workflows?.pending_verifications || [];
      setVerifications(
        rawVer.map((v) => ({
          id:        v.id            || v.ref_id    || "—",
          applicant: v.applicant     || "—",
          type:      v.type          || "—",
          docs:      v.docs          || "—",          // e.g. "3/5"
          days:      v.days_pending  != null ? `${v.days_pending}d` : "—",
          status:    normStatus(v.status),
          submitted: v.submitted     || "—",
        }))
      );

      // ── Transactions table ────────────────────────────────────────────────
      const rawTxns = apiData.transaction_monitoring?.recent_transactions || [];
      setTransactions(
        rawTxns.map((t) => ({
          id:     t.transaction_id || t.id     || "—",
          buyer:  t.buyer          || "—",
          seller: t.seller         || "—",
          amount: t.amount         || "—",
          status: normStatus(t.status),
          date:   t.date           || "—",
        }))
      );

      // ── Moderation table ──────────────────────────────────────────────────
      const rawMod = apiData.content_moderation?.flagged_content || [];
      setModeration(
        rawMod.map((m) => ({
          id:     m.id     || m.flag_id || "—",
          type:   m.type   || "—",
          item:   m.item   || "—",
          reason: m.reason || "—",
          status: normStatus(m.status),
          date:   m.submitted || "—",
        }))
      );

      // ── Activity panel ────────────────────────────────────────────────────
      const rawLogs = logsResponse?.data?.results || logsResponse?.results || [];
      setActivities(
        rawLogs.slice(0, 5).map((log) => ({
          type:        log.action || "",
          description: log.details || log.target_email || "",
          time:        log.time_ago || "—",
        }))
      );
    } catch (err) {
      console.error("AdminDashboard load error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to load dashboard data. Please refresh."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  // ── Column definitions ────────────────────────────────────────────────────
  const userCols = [
    { key: "id",      header: "ID"      },
    { key: "name",    header: "Name"    },
    { key: "email",   header: "Email"   },
    { key: "status",  header: "Status",  render: (v) => <StatusBadge status={v} /> },
    { key: "created", header: "Joined"  },
  ];

  const moderationCols = [
    { key: "id",     header: "ID"     },
    { key: "type",   header: "Type"   },
    { key: "item",   header: "Item"   },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
  ];

  const transactionCols = [
    { key: "id",     header: "TXN ID" },
    { key: "buyer",  header: "Buyer"  },
    { key: "amount", header: "Amount", render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "date",   header: "Date"   },
  ];

  const verificationCols = [
    { key: "id",        header: "Ref ID"    },
    { key: "applicant", header: "Applicant" },
    { key: "type",      header: "Type"      },
    { key: "docs",      header: "Docs"      },
    { key: "days",      header: "Pending"   },
    { key: "status",    header: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "submitted", header: "Submitted" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F3F4F6]">

      {/* ── Top bar: sidebar + navbar side by side ───────────────────────── */}
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* Navbar — fixed, starts right of sidebar */}
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6">
              <div className="max-w-[1400px] mx-auto space-y-5">

                {/* Page title + global refresh */}
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900">Dashboard Overview</h1>
                  <button
                    onClick={handleRefresh}
                    title="Refresh all data"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                {/* Error banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                {/* ── Stat Cards ──────────────────────────────────────── */}
                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
                    <StatCard title="Active Listings"       number={stats.activeListings}       icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
                    <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
                    <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
                  </div>
                )}

                {/* ── Chart + Activity ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <ChartCard data={chartData} />
                  </div>
                  <ActivityPanel activities={activities} />
                </div>

                {/* ── Tables ──────────────────────────────────────────── */}
                <div className="space-y-5 pb-4">

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Verification Workflows</h2>
                    <DataTable
                      title="Vendor Verification"
                      columns={verificationCols}
                      data={verifications}
                      tableType="verificationWorkflows"
                      onRefresh={handleRefresh}
                      hideActions={false}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Buyer Management</h2>
                    <DataTable
                      title="Buyers"
                      columns={userCols}
                      data={users}
                      tableType="userManagement"
                      onRefresh={handleRefresh}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Transaction Monitoring</h2>
                    <DataTable
                      title="Recent Transactions"
                      columns={transactionCols}
                      data={transactions}
                      tableType="transaction"
                      onRefresh={handleRefresh}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Content Moderation</h2>
                    <DataTable
                      title="Flagged Content"
                      columns={moderationCols}
                      data={moderation}
                      tableType="contentModeration"
                      onRefresh={handleRefresh}
                    />
                  </div>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
              <div>© 2026 Vendor Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;