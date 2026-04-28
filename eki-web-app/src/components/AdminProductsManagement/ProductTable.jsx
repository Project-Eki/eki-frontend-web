// ProductTable.js (updated with loading prop)
import React from "react";
import { Package, ChevronLeft, ChevronRight, Loader } from "lucide-react";
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

export const ProductTable = ({ 
  products, 
  onSelect, 
  selectedId, 
  selectedRows, 
  onSelectRow, 
  onSelectAll, 
  onExport,
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  currentStatus,
  currentCategory,
  pagination,
  onPageChange,
  loading = false
}) => {
  const allSelected = products.length > 0 && products.every((p) => selectedRows.includes(p.id));

  const handleExport = () => {
    const headers = ["SKU", "Product Name", "Category", "Price", "Vendor", "Status"];
    const rows = products.map((p) =>
      [`"${p.sku || ""}"`, `"${p.title || ""}"`, `"${p.category || ""}"`, `"${p.price || ""}"`, `"${p.vendor || ""}"`, `"${p.status || ""}"`].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_export_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-gray-900">Products</h3>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {pagination?.totalItems || products.length} product{products.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ProductSearchBar 
              search={currentStatus === 'All' ? '' : undefined} 
              onSearchChange={(e) => onSearch(e.target.value)} 
              onExport={handleExport} 
            />
            <CategoryFilterDropdown 
              options={CATEGORY_OPTIONS} 
              currentFilter={currentCategory} 
              onFilterChange={onCategoryFilter} 
            />
            <StatusFilterDropdown 
              options={STATUS_OPTIONS} 
              currentFilter={currentStatus} 
              onFilterChange={onStatusFilter} 
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <Loader className="animate-spin text-[#EFB034]" size={32} />
          </div>
        )}
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-3 py-3 w-8">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(products.map((p) => p.id), e.target.checked)}
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
            {products.length === 0 && !loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                  No products match your search.
                </td>
              </tr>
            ) : (
              products.map((product) => (
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
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Showing {((pagination.currentPage - 1) * 10) + 1}–{Math.min(pagination.currentPage * 10, pagination.totalItems)} of {pagination.totalItems} results
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 py-1 text-xs text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
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