import React from "react";
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

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admindashboard"   },
  { icon: Users,           label: "Vendors",   path: "/admin-management" },
  { icon: Store,           label: "Buyers",    path: "/buyer-management" },
  { icon: Box,             label: "Listings",  path: "/product-dashboard"},
  { icon: CreditCard,      label: "Payments",  path: "/admin-payments"   },
  { icon: ShoppingCart,    label: "Orders",    path: "/order-management" },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/*
        Outer wrapper — provides the gap around the sidebar.
        On desktop it's a fixed-width column; on mobile it slides in as overlay.
        p-3 gives the breathing room from viewport edges + from the navbar above.
      */}
      <div className={`
        fixed top-0 left-0 z-50 h-screen w-[220px] p-3
        flex flex-col
        transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:z-auto md:h-full md:shrink-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        {/*
          Inner sidebar card — the actual visible panel.
          rounded-2xl gives the card feel; the gradient is Eki teal.
          flex-1 makes it fill the vertical space within the padded wrapper.
        */}
        <div className="flex-1 rounded-2xl flex flex-col overflow-hidden shadow-xl"
          style={{
            background: "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
          }}
        >

          {/* ── Logo area ─────────────────────────────────────────────── */}
          <div className="px-5 pt-5 pb-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Eki logo — white version */}
              <img
                src="/src/assets/ekilogo-white.png"
                alt="Eki"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  // Fallback to text if image doesn't load
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              {/* Text fallback (hidden by default) */}
              <span
                className="text-white font-black text-xl tracking-tight hidden"
                style={{ fontFamily: "serif" }}
              >
                eki
              </span>
            </div>

            {/* Mobile close */}
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          {/* Subtle divider */}
          <div className="mx-5 border-t border-white/10 mb-3 shrink-0" />

          {/* ── Nav links ──────────────────────────────────────────────── */}
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

            {/* ── Settings + Logout ─────────────────────────────────── */}
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
                onClick={handleLogout}
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
    </>
  );
};

export default Sidebar;