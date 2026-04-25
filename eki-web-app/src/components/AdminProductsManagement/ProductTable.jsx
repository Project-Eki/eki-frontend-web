import React, { useState } from "react";
import { Package, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusFilterDropdown, CategoryFilterDropdown, ProductSearchBar } from "./ProductFilters";

const STATUS_OPTIONS = ["All", "Active", "Flagged", "Draft", "Archived"];
const CATEGORY_OPTIONS = ["All Categories", "Electronics", "Apparel", "Home", "Office", "Sports", "Automotive"];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "Active": return "bg-green-50 text-green-600 border-green-100";
    case "Draft": return "bg-gray-100 text-gray-600 border-gray-100";
    case "Flagged": return "bg-red-50 text-red-500 border-red-100";
    case "Archived": return "bg-gray-100 text-gray-400 border-gray-100";
    default: return "bg-gray-100 text-gray-500";
  }
};

export const ProductTable = ({ products, onSelect, selectedId, selectedRows, onSelectRow, onSelectAll, onExport }) => {
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 5;

  // Only show products with the 4 allowed statuses
  const ALLOWED_STATUSES = ["Active", "Flagged", "Draft", "Archived"];

  const filtered = products
    .filter((p) => ALLOWED_STATUSES.includes(p.status))
    .filter((p) => statusFilter === "All" || p.status === statusFilter)
    .filter((p) => categoryFilter === "All Categories" || p.category === categoryFilter)
    .filter((p) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.vendor?.toLowerCase().includes(q)
      );
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleExport = () => {
    if (filtered.length === 0) return;
    const headers = ["SKU", "Product Name", "Category", "Price", "Vendor", "Status"];
    const rows = filtered.map((p) =>
      [`"${p.sku || ""}"`, `"${p.title || ""}"`, `"${p.category || ""}"`, `"${p.price || ""}"`, `"${p.vendor || ""}"`, `"${p.status || ""}"`].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  const allSelected = slice.length > 0 && slice.every((p) => selectedRows.includes(p.id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ProductSearchBar search={search} onSearchChange={handleSearch} onExport={handleExport} />
            <CategoryFilterDropdown options={CATEGORY_OPTIONS} currentFilter={categoryFilter} onFilterChange={setCategoryFilter} />
            <StatusFilterDropdown options={STATUS_OPTIONS} currentFilter={statusFilter} onFilterChange={setStatusFilter} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(slice.map((p) => p.id), e.target.checked)}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-3">Product Details</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No products match your search.
                </td>
              </tr>
            ) : (
              slice.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === product.id ? "bg-teal-50/40" : ""}`}
                  onClick={() => onSelect(product)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(product.id)}
                      onChange={() => onSelectRow(product.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        ) : (
                          <Package size={15} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{product.title}</p>
                        <p className="text-[10px] text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-xs font-medium text-gray-800">{product.price}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{product.vendor}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap border ${getStatusBadgeClass(product.status)}`}>
                      {product.status}
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