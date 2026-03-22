import React from 'react';
import { LayoutDashboard, ShoppingBag, Briefcase, ClipboardList, CreditCard, Star, Settings, LogOut, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ mobileOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard",  path: "/vendordashboard"   },
    { icon: <ShoppingBag size={20} />,    label: "Products",    path: "/product-dashboard" },
    { icon: <Briefcase size={20} />,      label: "Services",    path: "/servicemanagement" },
    { icon: <ClipboardList size={20} />,  label: "Orders",      path: "/order-management"  },
    { icon: <CreditCard size={20} />,     label: "Payments",    path: "/payments"          },
    { icon: <Star size={20} />,           label: "Reviews",     path: "/reviews"           },
  ];

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0 md:z-auto md:h-screen md:shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile close button — only visible on mobile, aligns with navbar height */}
        <div className="flex items-center justify-end px-4 h-16 border-b border-gray-100 shrink-0 md:hidden">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNav(item.path)}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all text-sm font-medium ${
                location.pathname === item.path
                  ? 'bg-teal-700 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-1 shrink-0">
          <button className="w-full flex items-center space-x-3 p-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium">
            <Settings size={18} />
            <span>Settings</span>
          </button>
          <button className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium">
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;