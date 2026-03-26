import React, { useState, useEffect, useCallback } from 'react';
import { Users, Box, ShieldCheck, ArrowLeftRight, RefreshCw, ChevronLeft, ChevronRight, Filter, ExternalLink } from 'lucide-react';
import Navbar3    from '../components/adminDashboard/Navbar3';
import Sidebar    from '../components/adminDashboard/Sidebar';
import StatCard   from '../components/adminDashboard/StatCard';
import ChartCard  from '../components/adminDashboard/ChartCard';
import ActivityPanel from '../components/adminDashboard/ActivityPanel';
import { getAdminDashboard } from '../services/api';


// STATUS BADGE
const StatusBadge = ({ status }) => {
  const styles = {
    Active:    "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-green-50 text-green-700 border-green-100",
    Pending:   "bg-yellow-50 text-yellow-700 border-yellow-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Resolved:  "bg-teal-50 text-teal-700 border-teal-100",
    Approved:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected:  "bg-rose-50 text-rose-700 border-rose-100",
    Disputed:  "bg-orange-50 text-orange-700 border-orange-100",
    Inactive:  "bg-gray-50 text-gray-500 border-gray-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  );
};

// 
//  DATA TABLE

const EnhancedTable = ({ title, columns, data = [], viewAllHref, filterOptions = [] }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [page,         setPage]         = useState(1);
  const PER_PAGE = 6;

  // Client-side filter — works on whatever slice the API returned
  const filtered = statusFilter === 'All'
    ? data
    : data.filter(row => row.status === statusFilter || row.status?.toLowerCase() === statusFilter.toLowerCase());

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageSlice  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Reset to page 1 when filter changes
  const handleFilter = (val) => { setStatusFilter(val); setPage(1); };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Table header row */}
      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter dropdown */}
          {filterOptions.length > 0 && (
            <div className="relative">
              <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <select
                value={statusFilter}
                onChange={e => handleFilter(e.target.value)}
                className="pl-7 pr-7 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-teal-500"
              >
                <option value="All">All statuses</option>
                {filterOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          )}
          {/* View All button */}
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors"
            >
              View All <ExternalLink size={11}/>
            </a>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-5 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageSlice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              pageSlice.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, j) => (
                    <td key={j} className="px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-50 text-xs text-gray-500">
          <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronLeft size={14}/>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-7 h-7 rounded text-xs font-bold ${p === page ? 'bg-teal-700 text-white' : 'hover:bg-gray-100'}`}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
              <ChevronRight size={14}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ADMIN DASHBOARD

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // All data starts empty — API fills it
  const [users,         setUsers]         = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [moderation,    setModeration]    = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activities,    setActivities]    = useState([]);
  const [chartData,     setChartData]     = useState([]);

  const [stats, setStats] = useState({
    totalUsers:           "—",
    activeListings:       "—",
    // FIX: renamed from "Active Listings" to "Vendors Approved"
    pendingVerifications: "—",
    dailyTransactions:    "—",
  });

  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminDashboard();
      // Backend wraps in { success, data, message } — real data is at response.data.data
      // BUT getAdminDashboard returns response.data from axios, so:
      // axios gives us: { success, data: {...}, message }
      // response.data here = { success, data: {...}, message }
      const apiData = response.data;

      // Summary cards
      const summary = apiData.overview?.summary_cards || {};
      setStats({
        totalUsers:           summary.total_users           ?? "—",
        activeListings:       summary.active_listings       ?? "—",
        pendingVerifications: summary.pending_verifications ?? "—",
        dailyTransactions:    summary.daily_transactions    ?? "—",
      });

      // Chart
      const rawChart = apiData.overview?.weekly_activity || [];
      setChartData(rawChart.map(w => ({
        name:     w.day,
        users:    w.new_users,
        listings: w.orders,
      })));

      // Recent activity
      const rawActivity = apiData.overview?.recent_activity || [];
      setActivities(rawActivity.map(a => ({
        type:        a.action?.toLowerCase().includes('user')    ? 'new_user'
                   : a.action?.toLowerCase().includes('vendor')  ? 'verification_submitted'
                   : a.action?.toLowerCase().includes('flag')    ? 'content_flagged'
                   : a.action?.toLowerCase().includes('txn')     ? 'transaction_updated'
                   : 'listing_approved',
        description: a.description || a.details || '',
        time:        a.time_ago    || a.timestamp || "—",
      })));

      // ── FIX: BUYER TABLE ──
      // BUG WAS: reading apiData.user_management?.recent_users
      // FIX:     backend now returns buyers under buyer_management.buyers
      const rawUsers = apiData.buyer_management?.buyers || [];
      setUsers(rawUsers.map(u => ({
        id:         u.buyer_id || u.id,
        name:       u.name,
        email:      u.email,
        // Buyers don't have a "role" field — show status and join date instead
        status:     u.status   || 'Active',
        created:    u.created  || u.created_at,
        lastLogin:  u.last_login || '—',
      })));

      // Verification table — all statuses (pending, approved, rejected)
      const rawVer = apiData.verification_workflows?.pending_verifications || [];
      setVerifications(rawVer.map(v => ({
        id:        v.verification_id || v.id,
        applicant: v.applicant,
        type:      v.type,
        status:    v.status,
        submitted: v.submitted,
        days:      v.days_pending != null ? `${v.days_pending}d` : '—',
        docs:      v.documents_submitted != null ? `${v.documents_submitted}/5` : '—',
      })));

      // Moderation
      const rawMod = apiData.content_moderation?.flagged_content || [];
      setModeration(rawMod.map(m => ({
        id:        m.id,
        type:      m.content_type   || m.type,
        item:      m.content_title  || m.item,
        reason:    m.reason_display || m.reason,
        status:    m.status_display || m.status,
        submitted: m.submitted      || '—',
      })));

      // Transactions
      const rawTxns = apiData.transaction_monitoring?.recent_transactions || [];
      setTransactions(rawTxns.map(t => ({
        id:     t.transaction_id || t.id,
        buyer:  t.buyer_name     || t.buyer,
        seller: t.seller_name    || t.seller || '—',
        amount: t.amount         || '—',
        status: t.status,
        date:   t.date           || '—',
      })));

    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.message
        || "Failed to load dashboard. Please refresh.";
      setError(msg);
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  // COLUMN DEFINITIONS 

  // Verification Workflows — shows ALL statuses (pending, approved, rejected)
  // FIX: added status filter options for all three statuses
  const verificationColumns = [
    { key: 'id',        header: 'Ref ID'      },
    { key: 'applicant', header: 'Applicant'   },
    { key: 'type',      header: 'Type'        },
    { key: 'docs',      header: 'Docs',       render: (val) => <span className={`text-xs font-bold ${val === '5/5' ? 'text-green-600' : 'text-amber-600'}`}>{val}</span> },
    { key: 'days',      header: 'Days Pending'},
    { key: 'submitted', header: 'Date'        },
    { key: 'status',    header: 'Status',     render: (val) => <StatusBadge status={val}/> },
  ];

  
  const buyerColumns = [
    { key: 'id',        header: 'Buyer ID'   },
    { key: 'name',      header: 'Name'       },
    { key: 'email',     header: 'Email'      },
    { key: 'status',    header: 'Status',    render: (val) => <StatusBadge status={val}/> },
    { key: 'created',   header: 'Joined'     },
    { key: 'lastLogin', header: 'Last Login' },
  ];

  // Transactions — 6 columns, shows seller too
  const transactionColumns = [
    { key: 'id',     header: 'TXN ID'  },
    { key: 'buyer',  header: 'Buyer'   },
    { key: 'seller', header: 'Seller'  },
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold text-gray-900">{val}</span> },
    { key: 'date',   header: 'Date'    },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val}/> },
  ];

  // Content Moderation — 6 columns
  const moderationColumns = [
    { key: 'id',        header: 'ID'        },
    { key: 'type',      header: 'Type'      },
    { key: 'item',      header: 'Item'      },
    { key: 'reason',    header: 'Reason'    },
    { key: 'submitted', header: 'Date'      },
    { key: 'status',    header: 'Status',   render: (val) => <StatusBadge status={val}/> },
  ];

  if (loading) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
        <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-1 min-h-0">
          <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse"/>)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gray-100 rounded-xl h-64 animate-pulse"/>
              <div className="bg-gray-100 rounded-xl h-64 animate-pulse"/>
            </div>
            {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"/>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1 p-5 sm:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

              {/* Header + manual refresh */}
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                <button onClick={loadDashboard}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <RefreshCw size={13}/> Refresh
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Stat cards
                  FIX: "Active Listings" label renamed to "Vendors Approved"
                  to match actual data (active_listings from backend is currently 0 anyway) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
                <StatCard title="Active Listings"      number={stats.activeListings}       icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
                <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
                <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
              </div>

              {/* Chart + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2"><ChartCard data={chartData}/></div>
                <ActivityPanel activities={activities}/>
              </div>

              {/* All 4 tables with pagination + filters */}
              <div className="space-y-8 pb-4">

                {/* 1. Verification Workflows
                    FIX: filter options include Approved + Rejected, not just Pending
                    The dashboard endpoint only returns pending/under_review vendors
                    so this table shows "No records" for Approved/Rejected until i
                    add a separate API call (see AdminManagement.jsx for full fix) */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Verification Workflows</h2>
                  <EnhancedTable
                    title="Vendor Verification"
                    columns={verificationColumns}
                    data={verifications}
                    viewAllHref="/admin/management"
                    filterOptions={['Pending', 'Approved', 'Rejected', 'Suspended']}
                  />
                </div>

                {/* 2. Buyer Management
                    FIX: was reading wrong API key (user_management.recent_users)
                    Now reads buyer_management.buyers which the backend returns */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Buyer Management</h2>
                  <EnhancedTable
                    title="Registered Buyers"
                    columns={buyerColumns}
                    data={users}
                    viewAllHref="/admin/buyers"
                    filterOptions={['Active', 'Pending', 'Suspended', 'Inactive']}
                  />
                </div>

                {/* 3. Transaction Monitoring */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Transaction Monitoring</h2>
                  <EnhancedTable
                    title="Recent Transactions"
                    columns={transactionColumns}
                    data={transactions}
                    viewAllHref="/admin/transactions"
                    filterOptions={['Pending', 'Completed', 'Disputed', 'Refunded', 'Cancelled']}
                  />
                </div>

                {/* 4. Content Moderation */}
                <div>
                  <h2 className="text-base font-semibold text-gray-900 mb-3">Content Moderation</h2>
                  <EnhancedTable
                    title="Flagged Content"
                    columns={moderationColumns}
                    data={moderation}
                    viewAllHref="/admin/moderation"
                    filterOptions={['Pending', 'Resolved', 'Escalated', 'Dismissed']}
                  />
                </div>
              </div>
            </div>
          </main>

          <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
            <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
            <div>© 2026 Vendor Portal. All rights reserved.</div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
              <span className="cursor-pointer hover:underline">Support</span>
              <span className="cursor-pointer hover:underline">Privacy Policy</span>
              <span className="cursor-pointer hover:underline">Terms of Service</span>
              <span className="cursor-pointer hover:underline">Ijoema ltd</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;







// // ADDED: useEffect for data fetching
// import React, { useState, useEffect } from 'react';
// import { Users, Box, ShieldCheck, ArrowLeftRight } from 'lucide-react';
// import Navbar3 from '../components/adminDashboard/Navbar3';
// import Sidebar from '../components/adminDashboard/Sidebar';
// import StatCard from '../components/adminDashboard/StatCard';
// import ChartCard from '../components/adminDashboard/ChartCard';
// import ActivityPanel from '../components/adminDashboard/ActivityPanel';
// import DataTable from '../components/adminDashboard/DataTable';

// // ADDED: import the API functions we just created
// import {
//   getAdminDashboard,
//   // getAdminLogs,
// } from '../services/api';

// // StatusBadge — unchanged
// const StatusBadge = ({ status }) => {
//   const styles = {
//     Active:    "bg-blue-50 text-blue-700 border-blue-100",
//     Completed: "bg-green-50 text-green-700 border-green-100",
//     Pending:   "bg-yellow-50 text-yellow-700 border-yellow-100",
//     Suspended: "bg-red-50 text-red-700 border-red-100",
//     Resolved:  "bg-teal-50 text-teal-700 border-teal-100",
//     Approved:  "bg-emerald-50 text-emerald-700 border-emerald-100",
//     Rejected:  "bg-rose-50 text-rose-700 border-rose-100",
//     Disputed:  "bg-orange-50 text-orange-700 border-orange-100",
//   };
//   return (
//     <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-50 text-gray-600"}`}>
//       {status}
//     </span>
//   );
// };

// const AdminDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // UNCHANGED: empty arrays — start with nothing, API fills them
//   const [users,         setUsers]         = useState([]);
//   const [transactions,  setTransactions]  = useState([]);
//   const [moderation,    setModeration]    = useState([]);
//   const [verifications, setVerifications] = useState([]);
//   const [activities,    setActivities]    = useState([]);  // ADDED: for ActivityPanel
//   const [chartData,     setChartData]     = useState([]);  // ADDED: for ChartCard

//   // UNCHANGED: stats start as dashes
//   const [stats, setStats] = useState({
//     totalUsers:           "—",
//     activeListings:       "—",
//     pendingVerifications: "—",
//     dailyTransactions:    "—",
//   });

//   // ADDED: loading and error states
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState("");

//   // ADDED: useEffect — runs once when the page loads
//   // This is where we call the API and distribute the data
//   useEffect(() => {
//     const loadDashboard = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const response = await getAdminDashboard();
//         // Api wraps everthing in response.data
//         const apiData = response.data; 

//         // STEP 2: Stats (Mapping to overview.summary_cards)
//         const summary = apiData.overview?.summary_cards || {};
//         setStats({
//           totalUsers:           summary.total_users ?? "—",
//           activeListings:       summary.active_listings ?? "—",
//           pendingVerifications: summary.pending_verifications ?? "—",
//           dailyTransactions:    summary.daily_transactions ?? "—",
//         });

//                 // ── CHART DATA ──
//         // Path: data.overview.weekly_activity
//         // API gives: { day, date, new_users, orders, value }
//         // ChartCard expects: { name, users, listings }
//         const rawChart = apiData.overview?.weekly_activity || [];
//         setChartData(rawChart.map(w => ({
//           name:     w.day,        // "Mon", "Tue" etc — used as X axis label
//           users:    w.new_users,  // amber bar — new user registrations
//           listings: w.orders,     // teal bar  — orders that day
//         })));

//         // ── RECENT ACTIVITY ──
//         // Path: data.overview.recent_activity
//         // This is an empty array right now from the server (no activity yet)
//         // When there IS data, each item will have: { title, description, time_ago }
//         const rawActivity = apiData.overview?.recent_activity || [];
//         setActivities(rawActivity.map(a => ({
//           title:       a.title       || a.action      || "Platform event",
//           description: a.description || a.details     || "",
//           time:        a.time_ago    || a.timestamp    || "—",
//         })));


//         // USER TABLE 
//         //  User Management (Mapping to recent_users)
//         // Path: data.user_management.recent_users
//         const rawUsers = apiData.user_management?.recent_users || [];
//         setUsers(rawUsers.map(u => ({
//           id:      u.user_id || u.id,
//           name:    u.name,
//           email:   u.email,
//           role:    u.role,
//           status:  u.status,
//           created: u.created,
//         })));


//         // VERIFICATION TABLE
//         // Path: data.verification_workflows.pending_verifications
//         //Verification (Mapping to pending_verifications)
//         const rawVer = apiData.verification_workflows?.pending_verifications || [];
//         setVerifications(rawVer.map(v => ({
//           id:        v.verification_id || v.id,
//           applicant: v.applicant,
//           type:      v.type,
//           status:    v.status,
//           submitted: v.submitted,
//         })));

//              // ── MODERATION TABLE ──
//         // Path: data.content_moderation.flagged_content
//         const rawMod = apiData.content_moderation?.flagged_content || [];
//         setModeration(rawMod.map(m => ({
//           id:     m.id,
//           type:   m.content_type   || m.type,
//           item:   m.content_title  || m.item,
//           reason: m.reason_display || m.reason,
//           status: m.status_display || m.status,
//         })));

//               // ── TRANSACTIONS TABLE ──
//         // Path: data.transaction_monitoring.recent_transactions
//         const rawTxns = apiData.transaction_monitoring?.recent_transactions || [];
//         setTransactions(rawTxns.map(t => ({
//           id:     t.id,
//           buyer:  t.buyer_name || t.buyer,
//           amount: t.amount ? `$${t.amount}` : "—",
//           status: t.status,
//         })));

//       } catch (err) {
//         const msg = err.response?.data?.detail
//           || err.response?.data?.message
//           || "Failed to load dashboard. Please refresh.";
//         setError(msg);
//         console.error("Admin dashboard error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);


//   // Column definitions — UNCHANGED
//   const userManagementColumns = [
//     { key: 'id',      header: 'User ID' },
//     { key: 'name',    header: 'Name'    },
//     { key: 'email',   header: 'Email'   },
//     { key: 'role',    header: 'Role'    },
//     { key: 'status',  header: 'Status',  render: (val) => <StatusBadge status={val} /> },
//     { key: 'created', header: 'Created' },
//   ];
//   const contentModerationColumns = [
//     { key: 'id',     header: 'ID'     },
//     { key: 'type',   header: 'Type'   },
//     { key: 'item',   header: 'Item'   },
//     { key: 'reason', header: 'Reason' },
//     { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
//   ];
//   const transactionColumns = [
//     { key: 'id',     header: 'TXN ID' },
//     { key: 'buyer',  header: 'Buyer'  },
//     { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold">{val}</span> },
//     { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
//   ];
//   const verificationWorkflowsColumns = [
//     { key: 'id',        header: 'Verification ID' },
//     { key: 'applicant', header: 'Applicant'        },
//     { key: 'type',      header: 'Type'             },
//     { key: 'status',    header: 'Status', render: (val) => <StatusBadge status={val} /> },
//     { key: 'submitted', header: 'Submitted'         },
//   ];

//    // Full-page loading skeleton — covers everything until data arrives
//   if (loading) {
//     return (
//       <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
//         <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
//         <div className="flex flex-1 min-h-0">
//           <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//           <div className="flex-1 p-5 sm:p-8 space-y-6 overflow-y-auto">
//             {/* Stat card skeletons */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//               {[1,2,3,4].map(i => (
//                 <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
//               ))}
//             </div>
//             {/* Chart + activity skeletons */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               <div className="lg:col-span-2 bg-gray-100 rounded-xl h-64 animate-pulse" />
//               <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
//             </div>
//             {/* Table skeletons */}
//             {[1,2,3,4].map(i => (
//               <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
//       <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
//       <div className="flex flex-1 min-h-0">
//         <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//         <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
//           <main className="flex-1 p-5 sm:p-8">
//             <div className="max-w-[1600px] mx-auto space-y-8">
//               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
//                   {error}
//                 </div>
//               )}

//               {/* Stat cards — data is ready by this point */}
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//                 <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
//                 <StatCard title="Active Listings"       number={stats.activeListings}       icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
//                 <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
//                 <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
//               </div>

//               {/* Chart now receives real weekly_activity data */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2">
//                   <ChartCard data={chartData} />
//                 </div>
//                 {/* Activity now receives real recent_activity data */}
//                 <ActivityPanel activities={activities} />
//               </div>

//               <div className="space-y-10 pb-4">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Workflows</h2>
//                   <DataTable title="Vendor Verification" columns={verificationWorkflowsColumns} data={verifications} tableType="verificationWorkflows"  hideActions={true} />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Management</h2>
//                   <DataTable title="Buyers" columns={userManagementColumns} data={users} tableType="userManagement" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Monitoring</h2>
//                   <DataTable title="Recent Transactions" columns={transactionColumns} data={transactions} tableType="transaction" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Moderation</h2>
//                   <DataTable title="Flagged Content" columns={contentModerationColumns} data={moderation} tableType="contentModeration" />
//                 </div>
//               </div>
//             </div>
//           </main>

//           <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
//             <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
//             <div>© 2026 Vendor Portal. All rights reserved.</div>
//             <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
//               <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
//               <span className="cursor-pointer hover:underline">Support</span>
//               <span className="cursor-pointer hover:underline">Privacy Policy</span>
//               <span className="cursor-pointer hover:underline">Terms of Service</span>
//               <span className="cursor-pointer hover:underline">Ijoema ltd</span>
//             </div>
//           </footer>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;




