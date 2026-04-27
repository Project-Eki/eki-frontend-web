import React from "react";
import { Search, ChevronLeft, Download } from "lucide-react";

const GOLD = "#EFB034";

export const StatusFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
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

export const CategoryFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0"
        style={{ paddingRight: "1.75rem" }}
      >
        {options.map((option) => (
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

export const ProductSearchBar = ({ search, onSearchChange, onExport }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search SKU, name, or vendor..."
          value={search}
          onChange={onSearchChange}
          className="pl-7 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 w-48"
        />
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border rounded-lg transition-colors hover:opacity-90"
        style={{ borderColor: GOLD, color: GOLD }}
      >
        <Download size={12} /> Export
      </button>
    </div>
  );
};