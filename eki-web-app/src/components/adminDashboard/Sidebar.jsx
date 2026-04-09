import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import ekiLogo from "../../assets/eki-logo2.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admindashboard"   },
  { icon: Users,           label: "Vendors",   path: "/admin-management" },
  { icon: Store,           label: "Buyers",    path: "/buyer-management" },
  { icon: Box,             label: "Listings",  path: "/product-dashboard"},
  { icon: CreditCard,      label: "Payments",  path: "/admin-payments"   },
  { icon: ShoppingCart,    label: "Orders",    path: "/order-management" },
];

// Logout Confirmation Modal Component
const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Confirm Logout</h2>
          <p className="text-[11px] text-gray-500 mt-0.5">Are you sure you want to logout?</p>
        </div>

        {/* Modal Body */}
        <div className="p-5">
          <p className="text-xs text-gray-600">
            You will need to login again to access your account.
          </p>
        </div>

        {/* Modal Footer */}
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setShowLogoutModal(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed top-0 left-0 z-50 h-screen w-56 p-3
        flex flex-col
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto md:h-full md:shrink-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex-1 rounded-2xl flex flex-col overflow-hidden shadow-xl relative"
          style={{
            background: "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
          }}
        >
          {/* Logo area */}
          <div className="p-4 pt-5 pb-4 flex justify-center">
            <img
              src={ekiLogo}
              alt="Eki"
              className="h-14 w-auto object-contain mx-auto"
            />
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-5 right-4 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={17} />
          </button>

          {/* Subtle divider */}
          <div className="mx-5 border-t border-white/10 mb-3 shrink-0" />

          {/* Nav links */}
          <nav className="flex-1 px-3 flex flex-col overflow-y-auto">
            <ul className="space-y-0.5">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <NavLink to={item.path} onClick={() => onClose?.()}>
                    {({ isActive }) => (
                      <div className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-200 cursor-pointer
                        ${isActive
                          ? "bg-[#EFB034] text-white shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                        }
                      `}>
                        <item.icon
                          size={17}
                          strokeWidth={isActive ? 2.5 : 1.8}
                        />
                        <span className="text-[13px]">{item.label}</span>
                      </div>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Settings + Logout */}
            <div className="mt-auto pb-2 pt-4 border-t border-white/10 space-y-0.5">
              <NavLink
                to="/settings"
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Settings size={17} strokeWidth={1.8} />
                <span>Settings</span>
              </NavLink>

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold
                           text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                <LogOut size={17} strokeWidth={1.8} />
                <span>Log out</span>
              </button>
            </div>
          </nav> 
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default Sidebar;