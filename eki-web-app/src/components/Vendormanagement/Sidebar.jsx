import React from 'react';
import { LayoutDashboard, ShoppingBag, Briefcase, ClipboardList, CreditCard, Star, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/vendordashboard" },
    { icon: <ShoppingBag size={20} />, label: "Products", path: "/product-dashboard" },
    { icon: <Briefcase size={20} />, label: "Services", path: "/servicemanagement" },
    { icon: <ClipboardList size={20} />, label: "Orders", path: "/order-management" },
    { icon: <CreditCard size={20} />, label: "Payments", path: "/payments" },
    { icon: <Star size={20} />, label: "Reviews", path: "/reviews" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-64px)] sticky top-16 hidden md:flex">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
              location.pathname === item.path 
                ? 'bg-teal-700 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {item.icon}
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        <button className="w-full flex items-center space-x-3 p-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <LogOut size={18} />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;