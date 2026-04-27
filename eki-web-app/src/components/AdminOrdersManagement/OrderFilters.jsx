import React from 'react';
import { Search, X, Calendar } from 'lucide-react';

const GOLD = "#EFB034";

const StatusFilterDropdown = ({ currentFilter, onFilterChange }) => {
  const statusOptions = ['All', 'Pending', 'Confirmed', 'Processing', 'Completed', 'Cancelled'];
  
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
        {statusOptions.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const VendorFilterDropdown = ({ options, currentFilter, onFilterChange }) => {
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0"
        style={{ paddingRight: "1.75rem" }}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
};

const DateRangeFilter = ({ currentFilter, onFilterChange }) => {
  const options = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];
  
  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white text-gray-600 border border-gray-200 hover:border-amber-400 appearance-none cursor-pointer transition-all outline-none focus:outline-none focus:ring-0"
        style={{ paddingRight: "1.75rem" }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};

export const OrderFilters = ({ 
  filters, 
  onFilterChange, 
  vendorOptions, 
  searchQuery, 
  onSearchChange, 
  onClearSearch 
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order ID, buyer name, or vendor..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-[11px] border border-gray-200 rounded-lg outline-none focus:border-amber-400 bg-white"
        />
        {searchQuery && (
          <button onClick={onClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={12} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      {/* Status Filter */}
      <StatusFilterDropdown 
        currentFilter={filters.status} 
        onFilterChange={(val) => onFilterChange('status', val)} 
      />
      
      {/* Vendor Filter */}
      <VendorFilterDropdown 
        options={vendorOptions} 
        currentFilter={filters.vendor} 
        onFilterChange={(val) => onFilterChange('vendor', val)} 
      />
      
      {/* Date Range Filter */}
      <DateRangeFilter 
        currentFilter={filters.dateRange} 
        onFilterChange={(val) => onFilterChange('dateRange', val)} 
      />
    </div>
  );
};