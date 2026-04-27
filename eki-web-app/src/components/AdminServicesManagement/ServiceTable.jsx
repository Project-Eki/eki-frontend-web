import React, { useState } from "react";
import { Layers, ChevronLeft, ChevronRight, Search, Download } from "lucide-react";

const GOLD = "#EFB034";

const STATUS_OPTIONS = ["All", "Active", "Flagged", "Draft", "Archived"];
const CATEGORY_OPTIONS = ["All Categories", "Technology", "Home Services", "Creative", "Business", "Health", "Education"];
const ALLOWED_STATUSES = ["Active", "Flagged", "Draft", "Archived"];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Active":   return "bg-green-50 text-green-600 border-green-100";
    case "Draft":    return "bg-gray-100 text-gray-600 border-gray-100";
    case "Flagged":  return "bg-red-50 text-red-500 border-red-100";
    case "Archived": return "bg-gray-100 text-gray-400 border-gray-100";
    default:         return "bg-gray-100 text-gray-500";
  }
};

const StatusFilterDropdown = ({ options, currentFilter, onFilterChange }) => (
  <div className="relative">
    <select
      value={currentFilter}
      onChange={(e) => onFilterChange(e.target.value)}
      className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg appearance-none cursor-pointer transition-all outline-none ${
        currentFilter !== "All"
          ? "bg-[#EFB034] text-white"
          : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400"
      }`}
      style={{ paddingRight: "1.75rem", border: currentFilter !== "All" ? "none" : "1px solid #e5e7eb" }}
    >
      {options.map((o) => (
        <option key={o} value={o} className="text-gray-700 bg-white">{o}</option>
      ))}
    </select>
    <ChevronLeft size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-[-90deg] ${currentFilter !== "All" ? "text-white" : "text-gray-400"}`} />
  </div>
);

const CategoryFilterDropdown = ({ options, currentFilter, onFilterChange }) => (
  <div className="relative">
    <select
      value={currentFilter}
      onChange={(e) => onFilterChange(e.target.value)}
      className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none"
      style={{ paddingRight: "1.75rem" }}
    >
      {options.map((o) => (
        <option key={o} value={o} className="text-gray-700 bg-white">{o}</option>
      ))}
    </select>
    <ChevronLeft size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-[-90deg] text-gray-400" />
  </div>
);

export const ServiceTable = ({ services, onSelect, selectedId, selectedRows, onSelectRow, onSelectAll }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  const filtered = services
    .filter((s) => ALLOWED_STATUSES.includes(s.status))
    .filter((s) => statusFilter === "All" || s.status === statusFilter)
    .filter((s) => categoryFilter === "All Categories" || s.category === categoryFilter)
    .filter((s) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        s.title?.toLowerCase().includes(q) ||
        s.serviceId?.toLowerCase().includes(q) ||
        s.vendor?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["Service ID", "Title", "Category", "Billing Model", "Vendor", "Recent Buyer", "Status"];
    const rows = filtered.map((s) =>
      [`"${s.serviceId || ""}"`, `"${s.title || ""}"`, `"${s.category || ""}"`, `"${s.billingModel || ""}"`, `"${s.vendor || ""}"`, `"${s.buyer || ""}"`, `"${s.status || ""}"`].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "services.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const allSelected = slice.length > 0 && slice.every((s) => selectedRows.includes(s.id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Services</h3>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} service{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, ID, vendor..."
                value={search}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-48"
              />
            </div>
            <CategoryFilterDropdown options={CATEGORY_OPTIONS} currentFilter={categoryFilter} onFilterChange={setCategoryFilter} />
            <StatusFilterDropdown options={STATUS_OPTIONS} currentFilter={statusFilter} onFilterChange={setStatusFilter} />
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <Download size={12} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(slice.map((s) => s.id), e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3">Service Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Billing Model</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Recent Buyer</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                  No services match your search.
                </td>
              </tr>
            ) : (
              slice.map((service) => (
                <tr
                  key={service.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === service.id ? "bg-teal-50/40" : ""}`}
                  onClick={() => onSelect(service)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(service.id)}
                      onChange={() => onSelectRow(service.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {service.thumbnail ? (
                          <img src={service.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <Layers size={15} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{service.title}</p>
                        <p className="text-[10px] text-gray-400">{service.serviceId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{service.category}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">{service.billingModel}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{service.vendor}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{service.buyer || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap border ${getStatusBadgeClass(service.status)}`}>
                      {service.status}
                    </span>
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
            Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} results
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronLeft size={14} />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};