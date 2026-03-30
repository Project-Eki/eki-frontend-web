/**
 * DataTable.jsx
 *
 * Changes:
 *  - Search input added per table
 *  - Status filter for buyers: "Active" | "Inactive" (replaces generic filter)
 *  - Status filter for verifications: Pending | Approved | Rejected | Suspended
 *  - "Under Review" removed — mapped to "Pending" in display
 *  - Filter + Export + Refresh buttons styled with #EFB034
 *  - Pagination: 4 rows per page
 *  - Eye icon in Actions redirects to /admin-management for vendor tables
 *  - Compact sizing (smaller text, tighter padding) for 100% zoom
 *  - Empty state preserved
 */

import React, { useState, useMemo } from "react";
import { FaEye } from "react-icons/fa";
import { Search, RefreshCw, Download, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewDetailsModal from "./ViewDetailsModal";

const GOLD = "#EFB034";

// Status badge colours
const statusStyles = {
  Active:    "bg-blue-100 text-blue-700",
  Pending:   "bg-yellow-100 text-yellow-700",
  Suspended: "bg-red-100 text-red-700",
  Reviewing: "bg-purple-100 text-purple-700",
  Resolved:  "bg-green-100 text-green-700",
  Completed: "bg-green-100 text-green-700",
  Disputed:  "bg-red-100 text-red-700",
  Approved:  "bg-green-100 text-green-700",
  Rejected:  "bg-red-100 text-red-700",
  // "Under Review" normalised to Pending
  "Under Review": "bg-yellow-100 text-yellow-700",
};

// Normalise "under_review" / "Under Review" → "Pending" per requirements
const normaliseStatus = (val) => {
  if (!val) return val;
  const lower = String(val).toLowerCase();
  if (lower === "under_review" || lower === "under review") return "Pending";
  return val;
};

const ROWS_PER_PAGE = 4; // Requirement: 4 entries per page

const DataTable = ({
  title,
  columns,
  data = [],
  onView,
  onEdit,
  onDelete,
  tableType = "default",
  hideActions = false,
  onRefresh,          // optional callback — parent passes a reload function
}) => {
  const navigate = useNavigate();

  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [selectedRow,   setSelectedRow]   = useState(null);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [currentPage,   setCurrentPage]   = useState(1);
  const [refreshing,    setRefreshing]    = useState(false);

  // ── Status filter options per table type ───────────────────────────────
  const statusOptions = useMemo(() => {
    if (tableType === "userManagement") {
      return ["All", "Active", "Inactive"]; // buyers only need active/inactive
    }
    if (tableType === "verificationWorkflows") {
      // "Under Review" removed — only show these four
      return ["All", "Pending", "Approved", "Rejected", "Suspended"];
    }
    if (tableType === "transaction") {
      return ["All", "Pending", "Completed", "Disputed", "Refunded", "Cancelled"];
    }
    if (tableType === "contentModeration") {
      return ["All", "Pending", "Resolved", "Dismissed", "Escalated"];
    }
    return ["All"];
  }, [tableType]);

  // ── Filtered + searched data ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = data;

    // 1. Normalise statuses (remove "Under Review")
    rows = rows.map((r) => ({ ...r, status: normaliseStatus(r.status) }));

    // 2. Status filter
    if (statusFilter !== "All") {
      // For buyers: Active = is_active+verified, Inactive = everything else
      if (tableType === "userManagement" && statusFilter === "Inactive") {
        rows = rows.filter((r) => r.status !== "Active");
      } else if (tableType === "userManagement" && statusFilter === "Active") {
        rows = rows.filter((r) => r.status === "Active");
      } else {
        rows = rows.filter((r) => r.status === statusFilter);
      }
    }

    // 3. Search (searches all string values in the row)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) =>
        Object.values(r).some(
          (v) => v && String(v).toLowerCase().includes(q)
        )
      );
    }

    return rows;
  }, [data, statusFilter, searchQuery, tableType]);

  // ── Pagination ──────────────────────────────────────────────────────────
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage    = Math.min(currentPage, totalPages);
  const pageSlice   = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearch = (e) => { setSearchQuery(e.target.value); setCurrentPage(1); };
  const handleFilter = (s)  => { setStatusFilter(s); setCurrentPage(1); };

  // ── Refresh ─────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  };

  // ── Row actions ─────────────────────────────────────────────────────────
  const handleView = (row) => {
    // For vendor/verification tables, navigate to admin management
    if (tableType === "verificationWorkflows" && row.id) {
      navigate("/admin-management");
      return;
    }
    setSelectedRow(row);
    setIsModalOpen(true);
    if (onView) onView(row);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedRow(null); };

  const getModalTitle = () => ({
    userManagement:        "User Details",
    contentModeration:     "Content Details",
    transaction:           "Transaction Details",
    verificationWorkflows: "Verification Details",
    default:               "Details",
  }[tableType] || "Details");

  // ── Export (CSV) ─────────────────────────────────────────────────────────
  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = columns.map((c) => c.header).join(",");
    const rows    = filtered.map((r) => columns.map((c) => `"${r[c.key] ?? ""}"`).join(","));
    const csv     = [headers, ...rows].join("\n");
    const blob    = new Blob([csv], { type: "text/csv" });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `${title.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-36"
              />
            </div>

            {/* Status filter pills — only show if we have meaningful options */}
            {statusOptions.length > 1 && (
              <div className="flex gap-1 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilter(s)}
                    className="px-2 py-1 text-[10px] font-semibold rounded-full border transition-colors"
                    style={{
                      background:   statusFilter === s ? GOLD : "white",
                      color:        statusFilter === s ? "white" : "#6b7280",
                      borderColor:  statusFilter === s ? GOLD : "#e5e7eb",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Export */}
            <button
              onClick={handleExport}
              title="Export CSV"
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <Download size={11} /> Export
            </button>

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                title="Refresh"
                className="p-1.5 border rounded-lg transition-colors hover:opacity-90"
                style={{ borderColor: GOLD, color: GOLD }}
              >
                <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                {!hideActions && (
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {pageSlice.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hideActions ? 0 : 1)}
                    className="px-4 py-10 text-center text-xs text-gray-400"
                  >
                    {searchQuery || statusFilter !== "All"
                      ? "No records match your search."
                      : "No records to display."}
                  </td>
                </tr>
              ) : (
                pageSlice.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50/60 transition-colors">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-3 text-xs">
                        {col.render ? (
                          col.render(row[col.key], row)
                        ) : (
                          <span className={`${statusStyles[row[col.key]] ? `px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[row[col.key]]}` : "text-gray-700"}`}>
                            {row[col.key] ?? "—"}
                          </span>
                        )}
                      </td>
                    ))}
                    {!hideActions && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleView(row)}
                          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                          style={{ color: GOLD }}
                          title="View"
                        >
                          <FaEye size={13} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ───────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              Page {safePage} of {totalPages} · {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="px-2.5 py-1 text-[11px] border border-gray-200 rounded-lg disabled:opacity-30 hover:border-amber-400 transition-colors"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="px-2.5 py-1 text-[11px] border border-gray-200 rounded-lg disabled:opacity-30 hover:border-amber-400 transition-colors"
              >
                Next ›
              </button>
            </div>
          </div>
        )}
      </div>

      <ViewDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={selectedRow}
        title={getModalTitle()}
        onEdit={(d) => { handleCloseModal(); onEdit?.(d); }}
        onDelete={(d) => { handleCloseModal(); onDelete?.(d); }}
        hideActions={hideActions}
      />
    </>
  );
};

export default DataTable;