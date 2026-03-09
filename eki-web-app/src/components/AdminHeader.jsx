import React from 'react';
import { Search, Bell } from 'lucide-react';

const AdminHeader = () => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-gray-600">Vendor Oversight</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-1.5 bg-gray-100 border-none rounded-full text-xs focus:ring-1 focus:ring-[#234E4D] w-64"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-gray-500 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 border-l pl-6">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800 leading-tight">Admin User</p>
            <p className="text-[10px] text-gray-500">Super Admin</p>
          </div>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            alt="Admin" 
            className="h-8 w-8 rounded-full object-cover border border-gray-200"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;