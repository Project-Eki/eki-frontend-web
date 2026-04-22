import React, { useState, useEffect } from "react";
import { RefreshCw, Wallet } from "lucide-react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import DataTable from "../components/adminDashboard/DataTable";
import { getWalletTransactions } from "../services/api";

const GOLD = "#EFB034";

const AdminWalletTransactions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ total_credit: 0, total_debit: 0 });

  const loadWalletTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getWalletTransactions({ limit: 100 });
      
      const mappedTransactions = (response.transactions || []).map(t => ({
        id: t.id,
        vendor: t.vendor_email,
        vendor_name: t.vendor_name,
        amount: `₦${parseFloat(t.amount).toLocaleString()}`,
        raw_amount: parseFloat(t.amount),
        type: t.type,
        status: t.status,
        description: t.description,
        order_reference: t.order_reference || '—',
        date: new Date(t.created_at).toLocaleString(),
      }));

      // Calculate summary
      const credits = response.transactions?.filter(t => t.type === 'credit') || [];
      const debits = response.transactions?.filter(t => t.type === 'debit') || [];
      
      setSummary({
        total_credit: credits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
        total_debit: debits.reduce((sum, t) => sum + parseFloat(t.amount), 0),
      });
      
      setTransactions(mappedTransactions);
    } catch (err) {
      console.error("Failed to load wallet transactions:", err);
      setError("Failed to load wallet transactions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWalletTransactions();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletTransactions();
  };

  const columns = [
    { key: "vendor", header: "Vendor" },
    { key: "amount", header: "Amount", render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
    { key: "type", header: "Type", render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
        v === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {v.toUpperCase()}
      </span>
    )},
    { key: "status", header: "Status" },
    { key: "description", header: "Description" },
    { key: "order_reference", header: "Order Ref" },
    { key: "date", header: "Date" },
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
                    <h1 className="text-lg font-bold text-gray-900">Wallet Transactions</h1>
                    <p className="text-xs text-gray-500 mt-1">Track vendor wallet activity</p>
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

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium">Total Credits</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          ₦{summary.total_credit.toLocaleString()}
                        </p>
                      </div>
                      <Wallet size={32} className="text-green-500 opacity-50" />
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-red-600 font-medium">Total Debits</p>
                        <p className="text-2xl font-bold text-red-700 mt-1">
                          ₦{summary.total_debit.toLocaleString()}
                        </p>
                      </div>
                      <Wallet size={32} className="text-red-500 opacity-50" />
                    </div>
                  </div>
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
                    title="Wallet Activity"
                    columns={columns}
                    data={transactions}
                    tableType="default"
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

export default AdminWalletTransactions;