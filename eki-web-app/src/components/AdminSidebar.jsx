import React from 'react';
import { LayoutDashboard, Users, ShoppingBag, CreditCard, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
  const menuItems = [
    { name: 'Users', icon: <Users size={18} /> },
    { name: 'Vendors', icon: <LayoutDashboard size={18} />, active: true },
    { name: 'Listings', icon: <ShoppingBag size={18} /> },
    { name: 'Payments', icon: <CreditCard size={18} /> },
    { name: 'Orders', icon: <ShoppingBag size={18} /> },
    { name: 'Analytics', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo Area */}
      <div className="p-6">
        <img src="/src/assets/logo.jpeg" alt="Logo" className="h-8 w-auto" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-[#234E4D] text-white shadow-md' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-100 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 rounded-lg">
          <Settings size={18} /> Settings
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-lg">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;