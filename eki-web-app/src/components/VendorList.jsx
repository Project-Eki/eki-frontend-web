import React, { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from 'lucide-react';

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Suspended"];
const GOLD = "#EFB034";

const VendorList = ({ vendors, onSelect, selectedId, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const PER_PAGE = 4;

  // Filter vendors based on status and search
  const filtered = vendors
    .filter((v) => statusFilter === "All" || v.status === statusFilter)
    .filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.name?.toLowerCase().includes(q) ||
        v.email?.toLowerCase().includes(q) ||
        v.businessName?.toLowerCase().includes(q) ||
        v.businessCategory?.toLowerCase().includes(q) ||
        v.businessType?.toLowerCase().includes(q)
      );
    });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilter = (s) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleRefreshClick = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  // Export current filtered list as CSV
  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["Name", "Email", "Business Name", "Type", "Category", "Status", "Docs", "Submitted"];
    const rows = filtered.map((v) => [
      `"${v.name || ""}"`,
      `"${v.email || ""}"`,
      `"${v.businessName || ""}"`,
      `"${v.businessType || ""}"`,
      `"${v.businessCategory || ""}"`,
      `"${v.status || ""}"`,
      `"${v.docsCount ?? 0}/5"`,
      `"${v.submitted || ""}"`,
    ].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vendors.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with filters */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-gray-800">Registered Vendors</h3>
            <p className="text-xs text-gray-500">Monitor and manage seller accounts and verification states.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefreshClick}
              title="Refresh"
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-gray-400 shrink-0">
              {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors…"
                value={search}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-44"
              />
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap items-center">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleFilter(s)}
                className="px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors"
                style={{
                  background: statusFilter === s ? GOLD : "white",
                  color: statusFilter === s ? "white" : "#6b7280",
                  borderColor: statusFilter === s ? GOLD : "#e5e7eb",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-5 py-3">Applicant</th>
              <th className="px-5 py-3">Business Name</th>
              <th className="px-5 py-3">Business Type</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3">Days Pending</th>
              <th className="px-5 py-3">Docs</th>
              <th className="px-5 py-3">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">
                  {search.trim() || statusFilter !== "All"
                    ? "No vendors match your search."
                    : "No vendors to display."}
                </td>
              </tr>
            ) : (
              slice.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => onSelect(vendor)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === vendor.id ? "bg-teal-50/40" : ""}`}
                >
                  {/* Applicant name */}
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{vendor.name}</p>
                      <p className="text-[10px] text-gray-400">{vendor.email || "—"}</p>
                    </div>
                  </td>
                  {/* Business name */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.businessName || "—"}
                  </td>
                  {/* Business type */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessType || "—"}
                  </td>
                  {/* Business category */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessCategory || "—"}
                  </td>
                  {/* Status badge */}
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                      vendor.status === "Approved" ? "bg-green-50 text-green-600" :
                      vendor.status === "Pending" ? "bg-yellow-50 text-yellow-600" :
                      vendor.status === "Rejected" ? "bg-rose-50 text-rose-500" :
                      vendor.status === "Suspended" ? "bg-red-50 text-red-500" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  {/* Submitted date */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.submitted || "—"}
                  </td>
                  {/* Days pending */}
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold ${(vendor.daysPending ?? 0) > 2 ? "text-red-500" : "text-gray-600"}`}>
                      {vendor.daysPending != null ? `${vendor.daysPending}d` : "—"}
                    </span>
                  </td>
                  {/* Document count */}
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold ${(vendor.docsCount ?? 0) === 0 ? "text-red-400" : "text-green-600"}`}>
                      {vendor.docsCount ?? 0}/5
                    </span>
                  </td>
                  {/* View button */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelect(vendor); }}
                      className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                      style={{ color: GOLD }}
                    >
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Page {safePage} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorList;