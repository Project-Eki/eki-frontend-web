import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // adjust path if needed
import { LayoutDashboard, ShoppingBag, Briefcase, ClipboardList, CreditCard, Star, Settings, LogOut, X } from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/vendordashboard"   },
  { icon: ShoppingBag,     label: "Products",  path: "/product-dashboard" },
  { icon: Briefcase,       label: "Services",  path: "/servicemanagement" },
  { icon: ClipboardList,   label: "Orders",    path: "/order-management"  },
  { icon: CreditCard,      label: "Payments",  path: "/payments"          },
  { icon: Star,            label: "Reviews",   path: "/reviews"           },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
        flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:sticky md:top-0 md:z-auto md:h-full md:shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile close button */}
        <div className="flex items-center justify-end px-4 h-16 border-b border-gray-100 shrink-0 md:hidden">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-5 flex flex-col overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.path} onClick={onClose}>
                  {({ isActive }) => (
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Settings + Logout pinned to bottom */}
          <div className="mt-auto pt-4 border-t border-gray-100 space-y-1">
            <NavLink to="/settings" onClick={onClose}>
              {({ isActive }) => (
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
                }`}>
                  <Settings size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span>Settings</span>
                </div>
              )}
            </NavLink>

            {/* Logout stays a button — needs to call logout() before navigating */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={18} strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;