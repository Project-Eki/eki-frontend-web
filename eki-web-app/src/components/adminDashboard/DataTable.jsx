/**
 * DataTable.jsx
 *
 * Changes:
 *  - Export button REMOVED
 *  - Refresh button REMOVED from table header
 *  - "Actions" column REMOVED entirely
 *  - Single "View" column added with FaEye icon (gold #EFB034) as last column
 *    Routing per tableType:
 *      verificationWorkflows → /admin-management
 *      userManagement        → /buyer-management
 *      transaction / contentModeration → opens ViewDetailsModal
 *  - Search scoped per tableType:
 *      userManagement        → searches email + created (joined date)
 *      verificationWorkflows → searches applicant + submitted + type
 *      others                → searches all string fields
 *  - externalSearch prop added: navbar global search overrides local search
 *  - Status filter pills (gold when active), 4 rows per page pagination
 *  - "Under Review" normalised → "Pending"
 */

import React, { useState, useMemo, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ViewDetailsModal from "./ViewDetailsModal";

const GOLD = "#EFB034";

const statusStyles = {
  Active:         "bg-blue-100 text-blue-700",
  Pending:        "bg-yellow-100 text-yellow-700",
  Suspended:      "bg-red-100 text-red-700",
  Reviewing:      "bg-purple-100 text-purple-700",
  Resolved:       "bg-green-100 text-green-700",
  Completed:      "bg-green-100 text-green-700",
  Disputed:       "bg-red-100 text-red-700",
  Approved:       "bg-green-100 text-green-700",
  Rejected:       "bg-red-100 text-red-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
};

const normaliseStatus = (val) => {
  if (!val) return val;
  const l = String(val).toLowerCase();
  if (l === "under_review" || l === "under review") return "Pending";
  return val;
};

const ROWS_PER_PAGE = 4;

// Which row keys to search for each tableType
const SEARCH_KEYS_MAP = {
  userManagement:        ["email", "created"],              // email + joined date
  verificationWorkflows: ["applicant", "submitted", "type"], // applicant + date + type
};

const DataTable = ({
  title,
  columns,
  data = [],
  onView,
  onEdit,
  onDelete,
  tableType  = "default",
  hideActions = false,
  externalSearch = "",   // from Navbar global search — overrides local search
}) => {
  const navigate = useNavigate();

  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [selectedRow,  setSelectedRow]  = useState(null);
  const [localSearch,  setLocalSearch]  = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage,  setCurrentPage]  = useState(1);

  // Sync external search into local state (navbar global search)
  useEffect(() => {
    setLocalSearch(externalSearch || "");
    setCurrentPage(1);
  }, [externalSearch]);

  // The active search: external (global) takes priority over local
  const activeSearch = externalSearch?.trim() ? externalSearch : localSearch;

  // ── Status options per table type ─────────────────────────────────────────
  const statusOptions = useMemo(() => {
    if (tableType === "userManagement")        return ["All", "Active", "Inactive"];
    if (tableType === "verificationWorkflows") return ["All", "Pending", "Approved", "Rejected", "Suspended"];
    if (tableType === "transaction")           return ["All", "Pending", "Completed", "Disputed", "Refunded", "Cancelled"];
    if (tableType === "contentModeration")     return ["All", "Pending", "Resolved", "Dismissed", "Escalated"];
    return ["All"];
  }, [tableType]);

  // ── Filtered + searched rows ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = data.map((r) => ({ ...r, status: normaliseStatus(r.status) }));

    // Status filter
    if (statusFilter !== "All") {
      if (tableType === "userManagement" && statusFilter === "Inactive") {
        rows = rows.filter((r) => r.status !== "Active");
      } else if (tableType === "userManagement" && statusFilter === "Active") {
        rows = rows.filter((r) => r.status === "Active");
      } else {
        rows = rows.filter((r) => r.status === statusFilter);
      }
    }

    // Search — scoped by tableType
    if (activeSearch.trim()) {
      const q    = activeSearch.toLowerCase();
      const keys = SEARCH_KEYS_MAP[tableType]; // undefined → search all fields

      rows = rows.filter((r) => {
        if (keys) {
          return keys.some((k) => r[k] && String(r[k]).toLowerCase().includes(q));
        }
        return Object.values(r).some((v) => v && String(v).toLowerCase().includes(q));
      });
    }

    return rows;
  }, [data, statusFilter, activeSearch, tableType]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage   = Math.min(currentPage, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

  const handleSearch = (e) => { setLocalSearch(e.target.value); setCurrentPage(1); };
  const handleFilter = (s)  => { setStatusFilter(s); setCurrentPage(1); };

  // ── View icon routing ─────────────────────────────────────────────────────
  const handleView = (row) => {
    if (tableType === "verificationWorkflows") { navigate("/admin-management"); return; }
    if (tableType === "userManagement")        { navigate("/buyer-management"); return; }
    // All other tables open the detail modal
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

  // Contextual placeholder for local search input
  const placeholder = useMemo(() => {
    if (tableType === "userManagement")        return "Search email or date…";
    if (tableType === "verificationWorkflows") return "Applicant, date or type…";
    return "Search…";
  }, [tableType]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">

        {/* ── Header ── */}
        <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap items-center gap-2 justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Local search (also reflects global if external is empty) */}
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={placeholder}
                value={localSearch}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-40"
              />
            </div>

            {/* Status filter pills */}
            {statusOptions.length > 1 && (
              <div className="flex gap-1 flex-wrap">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilter(s)}
                    className="px-2 py-1 text-[10px] font-semibold rounded-full border transition-colors"
                    style={{
                      background:  statusFilter === s ? GOLD : "white",
                      color:       statusFilter === s ? "white" : "#6b7280",
                      borderColor: statusFilter === s ? GOLD : "#e5e7eb",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {/* Export & Refresh REMOVED per requirements */}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {col.header}
                  </th>
                ))}
                {/* "Actions" column replaced by single "View" column */}
                <th className="px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  View
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {pageSlice.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-10 text-center text-xs text-gray-400"
                  >
                    {activeSearch.trim() || statusFilter !== "All"
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
                          <span className={
                            statusStyles[row[col.key]]
                              ? `px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyles[row[col.key]]}`
                              : "text-gray-700"
                          }>
                            {row[col.key] ?? "—"}
                          </span>
                        )}
                      </td>
                    ))}

                    {/* View icon — gold, routes based on tableType */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleView(row)}
                        className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                        style={{ color: GOLD }}
                        title="View details"
                      >
                        <FaEye size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
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