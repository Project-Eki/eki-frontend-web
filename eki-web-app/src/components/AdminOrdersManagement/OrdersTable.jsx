import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  X,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const GOLD = "#EFB034";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const formatOrderId = (raw) => {
  if (!raw) return "—";
  return String(raw).toUpperCase();
};

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "Confirmed",
  "Processing",
  "Completed",
  "Cancelled",
];

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

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
          border: currentFilter !== "All" ? "none" : "1px solid #e5e7eb",
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

// Vendor Filter Dropdown
const VendorFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) && options.length > 0 ? options : ["All Vendors"];
  
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0"
        style={{ paddingRight: "1.75rem" }}
      >
        {safeOptions.map((option) => (
          <option key={option} value={option} className="text-gray-700 bg-white">
            {option}
          </option>
        ))}
      </select>
      <ChevronLeft
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-[-90deg] text-gray-400"
      />
    </div>
  );
};

// Date Range Filter
const DateRangeFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0"
        style={{ paddingRight: "1.75rem" }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 bg-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <ChevronLeft
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none rotate-[-90deg] text-gray-400"
      />
    </div>
  );
};

// Loading Skeleton
const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="h-8 bg-gray-100 rounded w-48 animate-pulse"></div>
    </div>
    <div className="p-8 text-center">
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/4 mx-auto"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
        <div className="h-10 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
);

// Empty State
const EmptyState = ({ hasFilters }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
    <div className="px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-gray-900">Order Records</h3>
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">0 orders</span>
      </div>
    </div>
    <div className="py-16 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Search size={32} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-900">No orders found</p>
      <p className="text-[11px] text-gray-400 mt-1">
        {hasFilters ? "Try adjusting your filters or search query." : "No orders to display."}
      </p>
    </div>
  </div>
);

// Export CSV function
const exportToCSV = (orders, onExport) => {
  if (!orders || orders.length === 0) return;
  const headers = ["Order ID", "Vendor", "Buyer", "Date", "Items", "Total", "Status"];
  const rows = orders.map((order) => [
    `"${formatOrderId(order.orderNumber || order.id)}"`,
    `"${order.vendor?.name || ""}"`,
    `"${order.buyer?.name || ""}"`,
    `"${formatDate(order.createdAt)}"`,
    `"${order.items?.length || 0}"`,
    `"$${(order.total || 0).toLocaleString()}"`,
    `"${order.status || ""}"`,
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "orders.csv";
  a.click();
  URL.revokeObjectURL(url);
  if (onExport) onExport();
};

export const OrdersTable = ({
  orders = [],
  loading = false,
  onSelectOrder,
  currentPage = 1,
  totalPages = 1,
  totalOrders = 0,
  startIndex = 0,
  onPageChange,
  filters = { status: "All", vendor: "All Vendors", dateRange: "all" },
  onFilterChange,
  vendorOptions = ["All Vendors"],
  searchQuery = "",
  onSearchChange,
  onClearSearch,
  onExport,
}) => {
  const [search, setSearch] = useState(searchQuery || "");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearch("");
    if (onClearSearch) onClearSearch();
  };

  const handleExportClick = () => {
    exportToCSV(orders, onExport);
  };

  const handlePageChange = (newPage) => {
    if (onPageChange) onPageChange(newPage);
  };

  const handleFilterChange = (key, value) => {
    if (onFilterChange) onFilterChange(key, value);
  };

  const hasActiveFilters = search !== "" || filters.status !== "All" || filters.vendor !== "All Vendors" || filters.dateRange !== "all";

  // Show loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Show empty state
  if (!orders || orders.length === 0) {
    return <EmptyState hasFilters={hasActiveFilters} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with title, count, search, export, and filters */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Left side - Title and count */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Order Records
            </h3>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {totalOrders} order{totalOrders !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Right side - Search, Export, and Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search input */}
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search orders…"
                value={search}
                onChange={handleSearch}
                className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-44"
              />
              {search && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <X size={10} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Export button */}
            <button
              onClick={handleExportClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <Download size={12} /> Export
            </button>

            {/* Status dropdown */}
            <StatusFilterDropdown
              options={STATUS_OPTIONS}
              currentFilter={filters.status}
              onFilterChange={(val) => handleFilterChange("status", val)}
            />

            {/* Vendor dropdown */}
            <VendorFilterDropdown
              options={vendorOptions}
              currentFilter={filters.vendor}
              onFilterChange={(val) => handleFilterChange("vendor", val)}
            />

            {/* Date Range dropdown */}
            <DateRangeFilterDropdown
              options={DATE_RANGE_OPTIONS}
              currentFilter={filters.dateRange}
              onFilterChange={(val) => handleFilterChange("dateRange", val)}
            />
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => onSelectOrder && onSelectOrder(order)}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Order ID */}
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold text-gray-800">
                    {formatOrderId(order.orderNumber || order.id)}
                  </p>
                 </td>

                {/* Vendor */}
                <td className="px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {order.vendor?.name || "—"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {order.vendor?.email || ""}
                    </p>
                  </div>
                </td>

                {/* Buyer */}
                <td className="px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">
                      {order.buyer?.name || "—"}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {order.buyer?.email || ""}
                    </p>
                  </div>
                </td>

                {/* Date */}
                <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                  {formatDate(order.createdAt)}
                </td>

                {/* Items count */}
                <td className="px-4 py-3 text-xs text-gray-600">
                  {order.items?.length || 0} item(s)
                </td>

                {/* Total */}
                <td className="px-4 py-3 text-xs font-bold text-gray-800">
                  ${(order.total || 0).toLocaleString()}
                </td>

                {/* Status badge */}
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>

                {/* View button */}
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder && onSelectOrder(order);
                    }}
                    className="p-1.5 rounded-lg transition-colors hover:opacity-70"
                    style={{ color: GOLD }}
                  >
                    <ExternalLink size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Showing {startIndex + 1}-
            {Math.min(startIndex + orders.length, totalOrders)} of {totalOrders} orders
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
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