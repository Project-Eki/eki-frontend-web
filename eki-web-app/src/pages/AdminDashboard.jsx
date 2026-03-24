// ADDED: useEffect for data fetching
import React, { useState, useEffect } from 'react';
import { Users, Box, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import Navbar3 from '../components/adminDashboard/Navbar3';
import Sidebar from '../components/adminDashboard/Sidebar';
import StatCard from '../components/adminDashboard/StatCard';
import ChartCard from '../components/adminDashboard/ChartCard';
import ActivityPanel from '../components/adminDashboard/ActivityPanel';
import DataTable from '../components/adminDashboard/DataTable';

// ADDED: import the API functions we just created
import {
  getAdminDashboard,
  getAdminLogs,
} from '../services/api';

// StatusBadge — unchanged
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
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // UNCHANGED: empty arrays — start with nothing, API fills them
  const [users,         setUsers]         = useState([]);
  const [transactions,  setTransactions]  = useState([]);
  const [moderation,    setModeration]    = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activities,    setActivities]    = useState([]);  // ADDED: for ActivityPanel
  const [chartData,     setChartData]     = useState([]);  // ADDED: for ChartCard

  // UNCHANGED: stats start as dashes
  const [stats, setStats] = useState({
    totalUsers:           "—",
    activeListings:       "—",
    pendingVerifications: "—",
    dailyTransactions:    "—",
  });

  // ADDED: loading and error states
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // ─────────────────────────────────────────
  // ADDED: useEffect — runs once when the page loads
  // This is where we call the API and distribute the data
  // 
  // useEffect(() => {
  //   const loadDashboard = async () => {
  //     setLoading(true);
  //     setError("");

  //     try {
  //       // STEP 1: Call the single dashboard endpoint
  //       // It returns everything in one response object
  //       const dashboard = await getAdminDashboard();

  //       // STEP 2: Pull out the overview section and set stat cards
  //       // The API returns overview.additionalProp1 etc — once backend
  //       // confirms exact field names, replace the keys below
  //       const overview = dashboard.overview || {};
  //       setStats({
  //         totalUsers:           overview.total_users           ?? "—",
  //         activeListings:       overview.active_listings       ?? "—",
  //         pendingVerifications: overview.pending_verifications ?? "—",
  //         dailyTransactions:    overview.daily_transactions    ?? "—",
  //       });

  //       // STEP 3: Pull out the user_management section
  //       // Map the API fields to what your table columns expect
  //       const rawUsers = dashboard.user_management || [];
  //       const mappedUsers = Array.isArray(rawUsers)
  //         ? rawUsers.map(u => ({
  //             id:      u.id       || u.user_id   || "—",
  //             name:    u.name     || u.full_name  || "—",
  //             email:   u.email                   || "—",
  //             role:    u.role                    || "—",
  //             status:  u.status                  || "—",
  //             created: u.created  || u.created_at || "—",
  //           }))
  //         : [];
  //       setUsers(mappedUsers);

  //       // STEP 4: Pull out transactions
  //       const rawTxns = dashboard.transaction_monitoring || [];
  //       const mappedTxns = Array.isArray(rawTxns)
  //         ? rawTxns.map(t => ({
  //             id:     t.id                          || "—",
  //             buyer:  t.buyer  || t.buyer_name      || "—",
  //             amount: t.amount || `$${t.total || 0}`,
  //             status: t.status                      || "—",
  //           }))
  //         : [];
  //       setTransactions(mappedTxns);

  //       // STEP 5: Pull out content moderation
  //       const rawMod = dashboard.content_moderation || [];
  //       const mappedMod = Array.isArray(rawMod)
  //         ? rawMod.map(m => ({
  //             id:     m.id            || "—",
  //             type:   m.type          || m.content_type  || "—",
  //             item:   m.item          || m.content_title || "—",
  //             reason: m.reason        || m.reason_display|| "—",
  //             status: m.status        || "—",
  //           }))
  //         : [];
  //       setModeration(mappedMod);

  //       // STEP 6: Pull out verification workflows
  //       const rawVer = dashboard.verification_workflows || [];
  //       const mappedVer = Array.isArray(rawVer)
  //         ? rawVer.map(v => ({
  //             id:        v.id                               || "—",
  //             applicant: v.applicant || v.vendor_name       || "—",
  //             type:      v.type      || "Seller Account",
  //             status:    v.status                           || "—",
  //             submitted: v.submitted || v.submitted_at      || "—",
  //           }))
  //         : [];
  //       setVerifications(mappedVer);

  //       // STEP 7: Call the logs endpoint separately for ActivityPanel
  //       // Logs are paginated — we just want the first page (most recent)
  //       const logsResponse = await getAdminLogs(1);
  //       const rawLogs = logsResponse.results || [];

  //       // Map log entries to the shape ActivityPanel expects
  //       const mappedActivities = rawLogs.slice(0, 5).map(log => ({
  //         title:       log.action         || "Admin action",
  //         description: log.details        || `${log.vendor_name || log.target_email || ""}`,
  //         time:        log.time_ago       || log.timestamp || "—",
  //         // ActivityPanel will render a generic icon since logs don't carry icons
  //       }));
  //       setActivities(mappedActivities);

  //     } catch (err) {
  //       // If the API call fails, show an error message
  //       const msg = err.response?.data?.detail
  //         || err.response?.data?.message
  //         || "Failed to load dashboard. Please refresh.";
  //       setError(msg);
  //       console.error("Admin dashboard load error:", err);
  //     } finally {
  //       // Whether success or failure, stop showing the loading state
  //       setLoading(false);
  //     }
  //   };

  //   loadDashboard();
  // }, []); // empty array = run once on mount
  // 
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getAdminDashboard();
        // Crucial: Access the .data property from your API response
        const apiData = response.data; 

        // STEP 2: Stats (Mapping to overview.summary_cards)
        const summary = apiData.overview?.summary_cards || {};
        setStats({
          totalUsers:           summary.total_users ?? "—",
          activeListings:       summary.active_listings ?? "—",
          pendingVerifications: summary.pending_verifications ?? "—",
          dailyTransactions:    summary.daily_transactions ?? "—",
        });

        // STEP 3: User Management (Mapping to recent_users)
        const rawUsers = apiData.user_management?.recent_users || [];
        setUsers(rawUsers.map(u => ({
          id:      u.user_id || u.id,
          name:    u.name,
          email:   u.email,
          role:    u.role,
          status:  u.status,
          created: u.created,
        })));

        // STEP 6: Verification (Mapping to pending_verifications)
        const rawVer = apiData.verification_workflows?.pending_verifications || [];
        setVerifications(rawVer.map(v => ({
          id:        v.verification_id || v.id,
          applicant: v.applicant,
          type:      v.type,
          status:    v.status,
          submitted: v.submitted,
        })));

        // STEP 7: Logs
        const logsResponse = await getAdminLogs(1);
        const rawLogs = logsResponse.results || [];
        setActivities(rawLogs.slice(0, 5).map(log => ({
          title:       log.action,
          description: log.details || log.target_email,
          time:        log.time_ago || "Just now",
        })));

      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);


  // Column definitions — UNCHANGED
  const userManagementColumns = [
    { key: 'id',      header: 'User ID' },
    { key: 'name',    header: 'Name'    },
    { key: 'email',   header: 'Email'   },
    { key: 'role',    header: 'Role'    },
    { key: 'status',  header: 'Status',  render: (val) => <StatusBadge status={val} /> },
    { key: 'created', header: 'Created' },
  ];
  const contentModerationColumns = [
    { key: 'id',     header: 'ID'     },
    { key: 'type',   header: 'Type'   },
    { key: 'item',   header: 'Item'   },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];
  const transactionColumns = [
    { key: 'id',     header: 'TXN ID' },
    { key: 'buyer',  header: 'Buyer'  },
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold">{val}</span> },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];
  const verificationWorkflowsColumns = [
    { key: 'id',        header: 'Verification ID' },
    { key: 'applicant', header: 'Applicant'        },
    { key: 'type',      header: 'Type'             },
    { key: 'status',    header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'submitted', header: 'Submitted'         },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      <Navbar3 onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1 p-5 sm:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
              </div>

              {/* ADDED: Show error banner if the API call failed */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              {/* ADDED: Show loading skeleton while data is being fetched */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
                  ))}
                </div>
              ) : (
                // UNCHANGED: stat cards now receive real data from state
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
                  <StatCard title="Active Listings"       number={stats.activeListings}       icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
                  <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
                  <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
                </div>
              )}

              {/* CHANGED: ChartCard and ActivityPanel now receive real data */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* chartData will remain [] until backend provides a chart endpoint */}
                  <ChartCard data={chartData} />
                </div>
                {/* CHANGED: passing real activities from logs API */}
                <ActivityPanel activities={activities} />
              </div>

              {/* Tables — CHANGED: data props now point to real state */}
              <div className="space-y-10 pb-4">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Workflows</h2>
                  <DataTable
                    title="Vendor Verification"
                    columns={verificationWorkflowsColumns}
                    // CHANGED: was verificationWorkflowsData 
                    data={verifications}          
                    tableType="verificationWorkflows"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Management</h2>
                  <DataTable
                    title="Buyers"
                    columns={userManagementColumns}
                    // CHANGED: was userManagementData
                    data={users}                  
                    tableType="userManagement"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Monitoring</h2>
                  <DataTable
                    title="Recent Transactions"
                    columns={transactionColumns}
                    // CHANGED: was transactionData
                    data={transactions}           
                    tableType="transaction"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Moderation</h2>
                  <DataTable
                    title="Flagged Content"
                    columns={contentModerationColumns}
                    // CHANGED: was contentModerationData
                    data={moderation}             
                    tableType="contentModeration"
                  />
                </div>

              </div>
            </div>
          </main>

          {/* Footer — UNCHANGED */}
          <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
            <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
            <div>© 2026 Vendor Portal. All rights reserved.</div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
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
  );
};

export default AdminDashboard;




// import React, { useState } from 'react';
// import { Users, Box, ShieldCheck, ArrowLeftRight } from 'lucide-react';
// import Navbar3 from '../components/adminDashboard/Navbar3';
// import Sidebar from '../components/adminDashboard/Sidebar';
// import StatCard from '../components/adminDashboard/StatCard';
// import ChartCard from '../components/adminDashboard/ChartCard';
// import ActivityPanel from '../components/adminDashboard/ActivityPanel';
// import DataTable from '../components/adminDashboard/DataTable';

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
//  const [chartData, setChartData] = useState([]);

// const AdminDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   // using useState
//   // Real data state — starts empty, will be filled from API
//   const [users,         setUsers]         = useState([]);
//   const [transactions,  setTransactions]  = useState([]);
//   const [moderation,    setModeration]    = useState([]);
//   const [verifications, setVerifications] = useState([]);

//   // Stats state
//   const [stats, setStats] = useState({
//     totalUsers:           "—",
//     activeListings:       "—",
//     pendingVerifications: "—",
//     dailyTransactions:    "—",
//   });

//   // Loading and error per section
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState("");

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

//   return (
//     // Outer shell — viewport locked, nothing here scrolls
//     <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">

//       {/* Navbar — fixed height, never scrolls */}
//       <Navbar3 onMenuClick={() => setSidebarOpen(true)} />

//       {/* Middle row — sidebar + right column */}
//       <div className="flex flex-1 min-h-0">

//         {/* Sidebar — never scrolls as a unit */}
//         <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//         {/* Right column — this is the ONLY thing that scrolls */}
//         <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

//           <main className="flex-1 p-5 sm:p-8">
//             <div className="max-w-[1600px] mx-auto space-y-8">

//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
//               </div>

//               {/* Stat Cards -passing stats state to the stat cardcomponents */}
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
//                 <StatCard title="Total Users"           number={stats.totalUsers}           icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
//                 <StatCard title="Active Listings"       number={stats.activeListings}       icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
//                 <StatCard title="Pending Verifications" number={stats.pendingVerifications} icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
//                 <StatCard title="Daily Transactions"    number={stats.dailyTransactions}    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
//               </div>

//               {/* Charts + Activity */}
//               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                 <div className="lg:col-span-2">
//                   <ChartCard title="Weekly Activity" />
//                 </div>
//                 <ActivityPanel title="Recent Activity" />
//               </div>

//               {/* Tables */}
//               {/* passing state arrays to the datatable component */}
//               <div className="space-y-10 pb-4">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Workflows</h2>
//                   <DataTable title="Vendor Verification" columns={verificationWorkflowsColumns} data={verifications} tableType="verificationWorkflows" />
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

//           {/* Footer — sits naturally at the bottom of scrollable content */}
//           <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
//             <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
//             <div>© 2026 Vendor Portal. All rights reserved.</div>
//             <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
//               <span className="relative inline-block cursor-pointer hover:underline">
//                 eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
//               </span>
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