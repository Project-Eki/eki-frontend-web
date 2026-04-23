import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import DataTable from "../components/adminDashboard/DataTable";
import { getPaymentTransactions } from "../services/api";

const GOLD = "#EFB034";

const normStatus = (s) => {
  if (!s) return s;
  const l = String(s).toLowerCase();
  if (l === "success") return "Completed";
  if (l === "failed") return "Failed";
  if (l === "refunded") return "Refunded";
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
};

const StatusBadge = ({ status }) => {
  const norm = normStatus(status);
  const map = {
    Completed: "bg-green-50 text-green-700 border-green-100",
    Pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
    Failed: "bg-red-50 text-red-700 border-red-100",
    Refunded: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${map[norm] || "bg-gray-50 text-gray-600 border-gray-100"}`}>
      {norm}
    </span>
  );
};

const AdminTransactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPaymentTransactions({ limit: 50, offset: 0 });
      
      const mappedTransactions = (response.transactions || []).map((t, index) => ({
        id: t.reference,
        reference: t.reference,
        order_reference: t.order_reference,
        amount: `${t.currency === 'NGN' ? '₦' : '$'}${parseFloat(t.amount).toLocaleString()}`,
        status: normStatus(t.status),
        customer_email: t.customer_email,
        payment_method: t.payment_method || '—',
        initiated_at: t.initiated_at ? new Date(t.initiated_at).toLocaleString() : '—',
      }));
      
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };

  const columns = [
    { key: "reference", header: "Reference" },
    { key: "order_reference", header: "Order Ref" },
    { key: "customer_email", header: "Customer" },
    { key: "amount", header: "Amount", render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
    { key: "payment_method", header: "Method" },
    { key: "status", header: "Status", render: (v) => <StatusBadge status={v} /> },
    { key: "initiated_at", header: "Date" },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#ecece7]">
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <div className="shrink-0 pr-3 pt-3">
            <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 py-4 sm:px-6">
              <div className="max-w-[1400px] mx-auto space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Payment Transactions</h1>
                    <p className="text-xs text-gray-500 mt-1">View all payment transactions</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors hover:opacity-90"
                    style={{ borderColor: GOLD, color: GOLD }}
                  >
                    <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />
                ) : (
                  <DataTable
                    title="All Transactions"
                    columns={columns}
                    data={transactions}
                    tableType="transaction"
                  />
                )}
              </div>
            </main>

            <footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. SellEasy.</div>
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

export default AdminTransactions;