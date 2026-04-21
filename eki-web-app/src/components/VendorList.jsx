import React, { useState } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected", "Suspended"];
const GOLD = "#EFB034";

// Status Filter Dropdown Component
const StatusFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0 ${
          currentFilter !== "All"
            ? "bg-[#EFB034] text-white"
            : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400"
        }`}
        style={{ 
          paddingRight: "1.75rem",
          border: currentFilter !== "All" ? "none" : "1px solid #e5e7eb"
        }}
      >
        {options.map((option) => (
          <option key={option} value={option} className="text-gray-700 bg-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronLeft
        size={12}
        className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-[-90deg] ${
          currentFilter !== "All" ? "text-white" : "text-gray-400"
        }`}
      />
    </div>
  );
};

const VendorList = ({ vendors, onSelect, selectedId }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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

  // Export current filtered list as CSV
  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["Name", "Email", "Business Name", "Type", "Category", "Status", "Submitted"];
    const rows = filtered.map((v) => [
      `"${v.name || ""}"`,
      `"${v.email || ""}"`,
      `"${v.businessName || ""}"`,
      `"${v.businessType || ""}"`,
      `"${v.businessCategory || ""}"`,
      `"${v.status || ""}"`,
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
      {/* Header with title, count, search, export, and status dropdown */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left side - Title and count */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Vendor Records</h3>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} vendor{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right side - Search, Export, Status dropdown */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search input */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors…"
                value={search}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-44"
              />
            </div>

            {/* Export button */}
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <Download size={12} /> Export
            </button>

            {/* Status dropdown - replaces buttons */}
            <StatusFilterDropdown
              options={STATUS_OPTIONS}
              currentFilter={statusFilter}
              onFilterChange={handleFilter}
            />
          </div>
        </div>
      </div>

      {/* Vendor table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">Business Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
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
                  {/* Applicant name and email */}
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{vendor.name}</p>
                      <p className="text-[10px] text-gray-400">{vendor.email || "—"}</p>
                    </div>
                  </td>
                  
                  {/* Business name */}
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.businessName || "—"}
                  </td>
                  
                  {/* Business type */}
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessType || "—"}
                  </td>
                  
                  {/* Business category */}
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessCategory || "—"}
                  </td>
                  
                  {/* Status badge */}
                  <td className="px-4 py-3">
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
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.submitted || "—"}
                  </td>
                  
                  {/* View button */}
                  <td className="px-4 py-3">
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
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
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