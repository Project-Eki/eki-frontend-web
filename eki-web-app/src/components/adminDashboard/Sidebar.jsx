import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Users, Store, Box,
  CreditCard, ShoppingCart, Settings, LogOut, X
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admindashboard"    },
  { icon: Users,           label: "Vendors",   path: "/admin-management"  },
  { icon: Store,           label: "Buyers",    path: "/buyer-management"  },
  { icon: Box,             label: "Listings",  path: "/product-dashboard" },
  { icon: CreditCard,      label: "Payments",  path: "/admin-payments"    },
  { icon: ShoppingCart,    label: "Orders",    path: "/order-management"  },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleNav = (path) => {
    navigate(path);
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed top-0 left-0 z-50 h-screen w-[240px] bg-white border-r border-gray-100
        flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto md:h-full md:shrink-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>

        {/* Mobile close button — same height as navbar, desktop hidden */}
        <div className="flex items-center justify-end px-4 h-16 border-b border-gray-100 shrink-0 md:hidden">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 flex flex-col overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.path}>
                  {({ isActive }) => (
                    <div className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#FFF8ED] text-[#F2B53D]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}>
                      <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                      <span>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Settings + Logout — pinned to bottom */}
          <div className="mt-auto pt-6 border-t border-gray-100 space-y-1">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-50"
                }`
              }
            >
              <Settings size={20} strokeWidth={1.5} />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;