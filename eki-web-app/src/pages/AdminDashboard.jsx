import React from 'react';
import { Users, Box, ShieldCheck, ArrowLeftRight } from 'lucide-react';
import Navbar3 from '../components/adminDashboard/Navbar3';
import Footer from '../components/Footer';
import Sidebar from '../components/adminDashboard/Sidebar';
import StatCard from '../components/adminDashboard/StatCard';
import ChartCard from '../components/adminDashboard/ChartCard';
import ActivityPanel from '../components/adminDashboard/ActivityPanel';
import DataTable from '../components/adminDashboard/DataTable';

// Helper component for colorful table badges
const StatusBadge = ({ status }) => {
  const styles = {
    Active: "bg-blue-50 text-blue-700 border-blue-100",
    Completed: "bg-green-50 text-green-700 border-green-100",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    Suspended: "bg-red-50 text-red-700 border-red-100",
    Resolved: "bg-teal-50 text-teal-700 border-teal-100",
    Approved: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Rejected: "bg-rose-50 text-rose-700 border-rose-100",
    Disputed: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  );
};

// --- DATA ARRAYS ---
const userManagementData = [
  { id: 'USR-001', name: 'John Doe', email: 'john@example.com', role: 'Buyer', status: 'Active', created: '2026-01-15' },
  { id: 'USR-002', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Seller', status: 'Active', created: '2026-01-18' },
  { id: 'USR-003', name: 'Mike Johnson', email: 'mike@example.com', role: 'Buyer', status: 'Pending', created: '2026-02-01' },
];

const contentModerationData = [
  { id: 'MOD-001', type: 'Listing', item: 'iPhone 15 Pro', reason: 'Prohibited Item', status: 'Pending', submitted: '2026-03-05' },
  { id: 'MOD-003', type: 'Listing', item: 'Designer Bag', reason: 'Counterfeit', status: 'Resolved', submitted: '2026-03-01' },
];

const transactionData = [
  { id: 'TXN-001', date: '2026-03-06', buyer: 'John Doe', seller: 'Sarah Store', amount: '$450.00', status: 'Completed' },
  { id: 'TXN-003', date: '2026-03-04', buyer: 'Emily Brown', seller: 'Fashion Hub', amount: '$89.99', status: 'Disputed' },
];
const verificationWorkflowsData = [
  {id: 'VER001', applicant: 'Tech Solutions', type: 'Seller Account', status: 'Pending', submitted: '2026-01-02'}
]

const AdminDashboard = () => {
  // --- COLUMN DEFINITIONS ---
  const userManagementColumns = [
    { key: 'id', header: 'User ID' },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'created', header: 'Created' },
  ];

  const contentModerationColumns = [
    { key: 'id', header: 'ID' },
    { key: 'type', header: 'Type' },
    { key: 'item', header: 'Item' },
    { key: 'reason', header: 'Reason' },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const transactionColumns = [
    { key: 'id', header: 'TXN ID' },
    { key: 'buyer', header: 'Buyer' },
    { key: 'amount', header: 'Amount', render: (val) => <span className="font-bold">{val}</span> },
    { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
  ];

  const verificationWorkflowsColumns = [
    {key: 'id', header: 'Verification ID'},
    {key: 'applicant', header: 'Applicant'},
    {key: 'type', header: 'Type'},
    {key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} />},
    {key: 'submitted', header: 'Submitted'},
  ];


  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] overflow-hidden">
      
      {/* 1. SIDEBAR: Spans full vertical height */}
      <Sidebar />

      {/* 2. RIGHT COLUMN: Navbar + Content */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        <Navbar3 />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" number="12,458" icon={Users} iconBgColor="bg-blue-50" iconColor="text-blue-600" />
              <StatCard title="Active Listings" number="3,847" icon={Box} iconBgColor="bg-indigo-50" iconColor="text-indigo-600" />
              <StatCard title="Pending Verifications" number="156" icon={ShieldCheck} iconBgColor="bg-orange-50" iconColor="text-orange-600" />
              <StatCard title="Daily Transactions" number="892" icon={ArrowLeftRight} iconBgColor="bg-emerald-50" iconColor="text-emerald-600" />
            </div>

            {/* Visuals: Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ChartCard title="Weekly Activity" />
              </div>
              <ActivityPanel title="Recent Activity" />
            </div>

            {/* Tables: Multiple Sections */}
          <div className="space-y-10 pb-10">

  {/* User Management */}
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      User Management
    </h2>
{/* Props  */}
    <DataTable
      title="Recent Users"
      columns={userManagementColumns}
      data={userManagementData}
      tableType="userManagement"
    />
  </div>

  {/* Content Moderation */}
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Content Moderation
    </h2>

    <DataTable
      title="Flagged Content"
      columns={contentModerationColumns}
      data={contentModerationData}
      tableType="contentModeration"
    />
  </div>

  {/* Transaction Monitoring */}
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Transaction Monitoring
    </h2>

    <DataTable
      title="Recent Transactions"
      columns={transactionColumns}
      data={transactionData}
      tableType="transaction"
    />
  </div>

   {/*verificationWorkflows */}
  <div>
    <h2 className="text-lg font-semibold text-gray-900 mb-4">
      Verification Workflows 
    </h2>
{/* Props  */}
    <DataTable
      title="Vendor Verification"
      columns={verificationWorkflowsColumns}
      data={verificationWorkflowsData}
      tableType="verificationWorkflows"
    />
  </div>

</div>

            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;