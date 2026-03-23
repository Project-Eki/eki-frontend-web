import React, { useState } from 'react';
import { Users, Box, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import Navbar3 from '../components/adminDashboard/Navbar3';
import Sidebar from '../components/adminDashboard/Sidebar';
import StatCard from '../components/adminDashboard/StatCard';
import ChartCard from '../components/adminDashboard/ChartCard';
import ActivityPanel from '../components/adminDashboard/ActivityPanel';
import DataTable from '../components/adminDashboard/DataTable';

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

const userManagementData = [
  { id: 'USR-001/03/26', name: 'John Doe',      email: 'john@example.com',  role: 'Buyer',  status: 'Active',  created: '2026-01-15' },
  { id: 'USR-002/03/26', name: 'Sarah Wilson',  email: 'sarah@example.com', role: 'Seller', status: 'Active',  created: '2026-01-18' },
  { id: 'USR-003/03/26', name: 'Mike Johnson',  email: 'mike@example.com',  role: 'Buyer',  status: 'Pending', created: '2026-02-01' },
];
const contentModerationData = [
  { id: 'MOD-001/03/26', type: 'Listing', item: 'iPhone 15 Pro', reason: 'Prohibited Item', status: 'Pending',  submitted: '2026-03-05' },
  { id: 'MOD-003/03/26', type: 'Listing', item: 'Designer Bag',  reason: 'Counterfeit',     status: 'Resolved', submitted: '2026-03-01' },
];
const transactionData = [
  { id: 'TXN-001/03/26', date: '2026-03-06', buyer: 'John Doe',     seller: 'Sarah Store', amount: '$450.00', status: 'Completed' },
  { id: 'TXN-003/03/26', date: '2026-03-04', buyer: 'Emily Brown',  seller: 'Fashion Hub', amount: '$89.99',  status: 'Disputed'  },
];
const verificationWorkflowsData = [
  { id: 'VER001/03/26', applicant: 'Tech Solutions', type: 'Seller Account', status: 'Pending', submitted: '2026-01-02' },
];

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Outer shell — viewport locked, nothing here scrolls
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">

      {/* Navbar — fixed height, never scrolls */}
      <Navbar3 onMenuClick={() => setSidebarOpen(true)} />

      {/* Middle row — sidebar + right column */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — never scrolls as a unit */}
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right column — this is the ONLY thing that scrolls */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

          <main className="flex-1 p-5 sm:p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard title="Total Users"             number="12,458" icon={Users}          iconBgColor="bg-blue-50"    iconColor="text-blue-600"    />
                <StatCard title="Active Listings"         number="3,847"  icon={Box}            iconBgColor="bg-indigo-50"  iconColor="text-indigo-600"  />
                <StatCard title="Pending Verifications"   number="156"    icon={ShieldCheck}    iconBgColor="bg-orange-50"  iconColor="text-orange-600"  />
                <StatCard title="Daily Transactions"      number="892"    icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
              </div>

              {/* Charts + Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ChartCard title="Weekly Activity" />
                </div>
                <ActivityPanel title="Recent Activity" />
              </div>

              {/* Tables */}
              <div className="space-y-10 pb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification Workflows</h2>
                  <DataTable title="Vendor Verification" columns={verificationWorkflowsColumns} data={verificationWorkflowsData} tableType="verificationWorkflows" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Management</h2>
                  <DataTable title="Buyers" columns={userManagementColumns} data={userManagementData} tableType="userManagement" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Monitoring</h2>
                  <DataTable title="Recent Transactions" columns={transactionColumns} data={transactionData} tableType="transaction" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Moderation</h2>
                  <DataTable title="Flagged Content" columns={contentModerationColumns} data={contentModerationData} tableType="contentModeration" />
                </div>
              </div>

            </div>
          </main>

          {/* Footer — sits naturally at the bottom of scrollable content */}
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