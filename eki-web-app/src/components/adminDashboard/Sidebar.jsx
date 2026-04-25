import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Store,
  Box,
  CreditCard,
  ShoppingCart,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Receipt,
  History,
  Banknote,
  Package,
  Wrench,
} from "lucide-react";
import ekiLogo from "../../assets/eki-logo2.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admindashboard" },
  { icon: Users, label: "Vendors", path: "/admin-management" },
  { icon: Store, label: "Buyers", path: "/admin-buyer-management" },
  {
    icon: Box,
    label: "Listings",
    path: "#",
    submenu: [
      { icon: Package, label: "Products", path: "/admin-products-management" },
      { icon: Wrench, label: "Services", path: "/admin-services-management" },
    ],
  },
  {
    icon: CreditCard,
    label: "Payments",
    path: "#",
    submenu: [
      { icon: Receipt, label: "Transactions", path: "/admin-transactions" },
      { icon: History, label: "Wallet Transactions", path: "/admin-wallet-transactions" },
      { icon: Banknote, label: "Withdrawals", path: "/admin-withdrawals" },
    ],
  },
  { icon: ShoppingCart, label: "Orders", path: "/order-management" },
];

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Confirm Logout</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Are you sure you want to logout?</p>
        </div>
        <div className="p-5">
          <p className="text-xs text-gray-600">You will need to login again to access your account.</p>
        </div>
        <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[11px] font-bold border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[11px] font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Determine which submenu should be open based on current path
  const getInitialOpenSubmenu = () => {
    for (const item of menuItems) {
      if (item.submenu) {
        const isChildActive = item.submenu.some((sub) => location.pathname === sub.path);
        if (isChildActive) return item.label;
      }
    }
    return null;
  };

  const [openSubmenu, setOpenSubmenu] = useState(getInitialOpenSubmenu);

  const handleLogoutClick = () => setShowLogoutModal(true);
  const handleConfirmLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setShowLogoutModal(false);
  };
  const handleCancelLogout = () => setShowLogoutModal(false);

  const toggleSubmenu = (label) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  const isSubmenuActive = (item) =>
    item.submenu?.some((sub) => location.pathname === sub.path);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={onClose} />
      )}

      <div
        className={`
          fixed top-0 left-0 z-50 h-screen w-52 p-3
          flex flex-col
          transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:z-auto md:h-full md:shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div
          className="flex-1 rounded-2xl flex flex-col overflow-hidden shadow-xl relative"
          style={{
            background: "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
          }}
        >
          {/* Logo */}
          <div className="p-4 pt-5 pb-3 flex justify-center">
            <img src={ekiLogo} alt="Eki" className="h-12 w-auto object-contain mx-auto" />
          </div>

          {/* Mobile close */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-5 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>

          {/* Nav */}
          <nav className="flex-1 px-2.5 flex flex-col overflow-y-auto pt-1">
            <ul className="space-y-0.5">
              {menuItems.map((item) => {
                const childActive = isSubmenuActive(item);
                const isOpen = openSubmenu === item.label;

                return (
                  <li key={item.label}>
                    {item.submenu ? (
                      <>
                        <button
                          onClick={() => toggleSubmenu(item.label)}
                          className={`
                            w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl
                            transition-all duration-200 cursor-pointer
                            ${childActive
                              ? "bg-white/10 text-white"
                              : "text-white/65 hover:bg-white/8 hover:text-white"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon
                              size={15}
                              strokeWidth={childActive ? 2.2 : 1.7}
                              className={childActive ? "text-[#EFB034]" : ""}
                            />
                            <span className="text-[12px] font-semibold">{item.label}</span>
                          </div>
                          <ChevronRight
                            size={12}
                            className={`transition-transform duration-200 opacity-60 ${isOpen ? "rotate-90" : ""}`}
                          />
                        </button>

                        {/* Submenu */}
                        <div
                          className={`
                            overflow-hidden transition-all duration-200 ease-in-out
                            ${isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
                          `}
                        >
                          <div className="ml-3 mt-0.5 mb-0.5 pl-3 border-l border-white/10 space-y-0.5">
                            {item.submenu.map((subItem) => (
                              <NavLink
                                key={subItem.label}
                                to={subItem.path}
                                onClick={() => onClose?.()}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all ${
                                    isActive
                                      ? "bg-[#EFB034]/20 text-[#EFB034]"
                                      : "text-white/55 hover:bg-white/8 hover:text-white"
                                  }`
                                }
                              >
                                {({ isActive }) => (
                                  <>
                                    <subItem.icon
                                      size={13}
                                      strokeWidth={isActive ? 2.2 : 1.6}
                                    />
                                    <span>{subItem.label}</span>
                                    {isActive && (
                                      <span className="ml-auto w-1 h-1 rounded-full bg-[#EFB034]" />
                                    )}
                                  </>
                                )}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <NavLink to={item.path} onClick={() => onClose?.()}>
                        {({ isActive }) => (
                          <div
                            className={`
                              flex items-center gap-2.5 px-2.5 py-2 rounded-xl
                              transition-all duration-200 cursor-pointer
                              ${isActive
                                ? "bg-[#EFB034] text-white shadow-sm"
                                : "text-white/65 hover:bg-white/8 hover:text-white"
                              }
                            `}
                          >
                            <item.icon size={15} strokeWidth={isActive ? 2.2 : 1.7} />
                            <span className="text-[12px] font-semibold">{item.label}</span>
                          </div>
                        )}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Settings + Logout */}
            <div className="mt-auto pb-2 pt-3 space-y-0.5">
              <NavLink
                to="/settings"
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/55 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                <Settings size={15} strokeWidth={1.7} />
                <span>Settings</span>
              </NavLink>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-semibold
                           text-white/55 hover:bg-white/8 hover:text-white transition-all"
              >
                <LogOut size={15} strokeWidth={1.7} />
                <span>Log out</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;