import React, { useState, useEffect, useCallback } from "react";
import { Users, Box, ShieldCheck, ArrowLeftRight, RefreshCw } from "lucide-react";
import Navbar3       from "../components/adminDashboard/Navbar3";
import Sidebar       from "../components/adminDashboard/Sidebar";
import StatCard      from "../components/adminDashboard/StatCard";
import ChartCard     from "../components/adminDashboard/ChartCard";
import ActivityPanel from "../components/adminDashboard/ActivityPanel";
import DataTable     from "../components/adminDashboard/DataTable";
import { getAdminDashboard, getAdminLogs } from "../services/api";

const GOLD = "#EFB034";


const normStatus = (s) => {
  if (!s) return s;
  const l = String(s).toLowerCase();
  if (l === "under_review" || l === "under review") return "Pending";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

const StatusBadge = ({ status }) => {
  const norm = normStatus(status);
  const map = {
    Active:     "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-green-50 text-green-700 border-green-100",
    Pending:    "bg-yellow-50 text-yellow-700 border-yellow-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Resolved:   "bg-teal-50 text-teal-700 border-teal-100",
    Approved:   "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected:   "bg-rose-50 text-rose-700 border-rose-100",
    Disputed:   "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[norm] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
      {norm}
    </span>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [users,         setUsers]         = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [moderation,     setModeration]    = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activities,     setActivities]    = useState([]);
  const [chartData,     setChartData]     = useState([]);
  const [stats, setStats] = useState({
    totalUsers: "—", activeListings: "—", pendingVerifications: "—", dailyTransactions: "—",
  });
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    try {
      const [dashResponse, logsResponse] = await Promise.all([
        getAdminDashboard(),
        getAdminLogs(1).catch(() => ({ data: { results: [] } })),
      ]);

      const apiData = dashResponse.data;
      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });

      // 1. Stats
      const summary = apiData.overview?.summary_cards || {};
      setStats({
        totalUsers:           summary.total_users           ?? "—",
        activeListings:       summary.active_listings       ?? "—",
        pendingVerifications: summary.pending_verifications ?? "—",
        dailyTransactions:    summary.daily_transactions    ?? "—",
      });

      setChartData(apiData.overview?.weekly_activity || []);

      // 2. User Management (Buyers) - FIXING IDs
      const rawUsers = apiData.user_management?.recent_users || [];
      setUsers(
        rawUsers
          .filter((u) => !u.role || u.role === "buyer")
          .map((u, index) => ({
            id: `BYR${String(index + 1).padStart(3, '0')}/${currentMonthYear}`,
            db_id: u.id || u.user_id, // Keep original for backend reference
            name:    u.name    || "—",
            email:   u.email   || "—",
            status:  normStatus(u.status),
            created: u.created || "—",
          }))
      );

      // 3. Verification workflows - FIXING IDs
      const rawVer = apiData.verification_workflows?.pending_verifications || [];
      setVerifications(
        rawVer.map((v, index) => ({
          id:        `VER${String(index + 1).padStart(3, '0')}/${currentMonthYear}`,
          applicant: v.applicant || "—",
          type:      v.type      || "—",
          docs:      v.docs      || "—",
          days:      v.days_pending != null ? `${v.days_pending}d` : "—",
          status:    normStatus(v.status),
          submitted: v.submitted || "—",
        }))
      );

      // 4. Transactions - FIXING IDs
      const rawTxns = apiData.transaction_monitoring?.recent_transactions || [];
      setTransactions(
        rawTxns.map((t, index) => ({
          id:     `TRN${String(index + 1).padStart(3, '0')}/${currentMonthYear}`,
          buyer:  t.buyer  || "—",
          seller: t.seller || "—",
          amount: t.amount || "—",
          status: normStatus(t.status),
          date:   t.date   || "—",
        }))
      );

      // 5. Content moderation - FIXING IDs
      const rawMod = apiData.content_moderation?.flagged_content || [];
      setModeration(
        rawMod.map((m, index) => ({
          id:     `MOD${String(index + 1).padStart(3, '0')}/${currentMonthYear}`,
          type:   m.type   || "—",
          item:   m.item   || "—",
          reason: m.reason || "—",
          status: normStatus(m.status),
          date:   m.submitted || "—",
        }))
      );

      // 6. Activity panel
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
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const handleRefresh = async () => { setRefreshing(true); await loadDashboard(); };

  // ── Updated Column definitions to match new ID keys ──────────────────────────

  const userCols = [
    { key: "id",      header: "Buyer ID" }, 
    { key: "name",    header: "Name"     },
    { key: "email",   header: "Email"    },
    { key: "status",  header: "Status",  render: (v) => <StatusBadge status={v} /> },
    { key: "created", header: "Joined"   },
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

  const moderationCols = [
    { key: "id",     header: "Mod ID" },
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

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7]">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3
              onMenuClick={() => setSidebarOpen(true)}
              onSearch={(val) => setGlobalSearch(val)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6">
              <div className="max-w-[1400px] mx-auto space-y-5">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-gray-900">Dashboard Overview</h1>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-medium">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}           iconBgColor="bg-[#235E5D]" iconColor="text-white" />
                    <StatCard title="Active Listings"       number={stats.activeListings}       icon={Box}             iconBgColor="bg-[#EFB034]" iconColor="text-white" />
                    <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}     iconBgColor="bg-[#EFB034]" iconColor="text-white" />
                    <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight}  iconBgColor="bg-[#235E5D]" iconColor="text-white"  />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <ChartCard data={chartData} />
                  </div>
                  <ActivityPanel activities={activities} />
                </div>

                <div className="space-y-5 pb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Verification Workflows</h2>
                    <DataTable
                      title="Vendor Verification"
                      columns={verificationCols}
                      data={verifications}
                      tableType="verificationWorkflows"
                      externalSearch={globalSearch}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Buyer Management</h2>
                    <DataTable
                      title="Buyers"
                      columns={userCols}
                      data={users}
                      tableType="userManagement"
                      externalSearch={globalSearch}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Transaction Monitoring</h2>
                    <DataTable
                      title="Recent Transactions"
                      columns={transactionCols}
                      data={transactions}
                      tableType="transaction"
                      externalSearch={globalSearch}
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-700 mb-2">Content Moderation</h2>
                    <DataTable
                      title="Flagged Content"
                      columns={moderationCols}
                      data={moderation}
                      tableType="contentModeration"
                      externalSearch={globalSearch}
                    />
                  </div>
                </div>
              </div>
            </main>

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
    </div>
  );
};

export default AdminDashboard;