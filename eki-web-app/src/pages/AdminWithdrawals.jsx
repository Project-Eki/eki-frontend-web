import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";
import Sidebar from "../components/adminDashboard/Sidebar";
import Navbar3 from "../components/adminDashboard/Navbar3";
import { getWithdrawalRequests, processWithdrawal } from "../services/api";

const GOLD = "#EFB034";

const AdminWithdrawals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);

  const loadWithdrawals = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getWithdrawalRequests({ 
        status: statusFilter,
        limit: 100 
      });
      setWithdrawals(response.withdrawals || []);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
      setError("Failed to load withdrawal requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter]);

  const handleProcess = async (withdrawalId, action, rejectionReason = '') => {
    setProcessingId(withdrawalId);
    try {
      await processWithdrawal(withdrawalId, action, rejectionReason);
      await loadWithdrawals();
      alert(`Withdrawal ${action}ed successfully`);
    } catch (err) {
      alert(`Failed to ${action} withdrawal: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} className="text-green-600" />;
      case 'failed': return <XCircle size={14} className="text-red-600" />;
      case 'pending': return <Clock size={14} className="text-yellow-600" />;
      default: return null;
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'cancelled', label: 'Cancelled' },
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
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Withdrawal Requests</h1>
                    <p className="text-xs text-gray-500 mt-1">Manage vendor payout requests</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-amber-400"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
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
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="bg-gray-100 rounded-xl h-96 animate-pulse" />
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3">Vendor</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Bank</th>
                            <th className="px-4 py-3">Account</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Requested</th>
                            <th className="px-4 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {withdrawals.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                                No withdrawal requests found
                               </td>
                            </tr>
                          ) : (
                            withdrawals.map((w) => (
                              <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div>
                                    <p className="text-xs font-semibold text-gray-800">{w.vendor_name}</p>
                                    <p className="text-[10px] text-gray-400">{w.vendor_email}</p>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs font-bold text-gray-900">
                                    ₦{parseFloat(w.amount).toLocaleString()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">{w.bank_name}</td>
                                <td className="px-4 py-3 text-xs text-gray-600">{w.account_number}</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    {getStatusIcon(w.status)}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(w.status)}`}>
                                      {w.status}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-600">
                                  {new Date(w.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  {w.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleProcess(w.id, 'approve')}
                                        disabled={processingId === w.id}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => {
                                          const reason = prompt('Enter rejection reason:');
                                          if (reason) handleProcess(w.id, 'reject', reason);
                                        }}
                                        disabled={processingId === w.id}
                                        className="px-2.5 py-1 text-[10px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                  {w.status === 'processing' && (
                                    <span className="text-[10px] text-blue-600">Processing...</span>
                                  )}
                                  {w.status === 'completed' && (
                                    <span className="text-[10px] text-green-600 flex items-center gap-1">
                                      <CheckCircle size={12} /> Completed
                                    </span>
                                  )}
                                </td>
                               </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
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

export default AdminWithdrawals;