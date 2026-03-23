import React from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import adaefe from "../../assets/adaefe.jpg";

const Navbar2 = ({ userName = "Cameron Williamson", userRole = "Vendor", onMenuClick }) => {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-1 bg-white border-b border-gray-100 sticky top-0 z-30 w-full h-16 shrink-0">


      {/* Logo */}
      <div className="flex items-center">
        <img
          src="/ekilogo.png"
          alt="Eki Logo"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Center: Search — hidden on small screens */}
      <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search services, orders..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center space-x-3 sm:space-x-6">
        <button className="relative text-gray-500 hover:text-teal-700 transition-colors">
          <Bell size={22} />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3 border-l pl-3 sm:pl-6 border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-tight">{userName}</p>
            <p className="text-xs text-gray-500 font-medium">{userRole}</p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer shrink-0">
            <img src={adaefe} alt="User" className="w-full h-full object-cover" />
          </div>
          <ChevronDown size={16} className="text-gray-400 cursor-pointer hidden sm:block" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar2;