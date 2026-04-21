import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useVendor } from "../context/useVendor";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/eki-logo2.png";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import LogoutModal from "./LogoutModal";

const VendorSidebar = ({ activePage }) => {
  const navigate = useNavigate();
  const { vendorType, businessCategory, loading: vendorLoading } = useVendor();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Show loading while checking authentication
  if (authLoading || vendorLoading) {
    return (
      <aside
        className="w-56 flex flex-col sticky top-3 h-[calc(100vh-1.5rem)] shadow-sm rounded-2xl font-popins"
        style={{
          background:
            "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
        }}
      >
        <div className="p-4 pt-5 pb-4">
          <img
            src={logo}
            alt="Eki"
            className="h-14 w-auto object-contain mx-auto"
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/60 text-sm">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/60 mx-auto mb-2"></div>
            Loading...
          </div>
        </div>
      </aside>
    );
  }

  // If not authenticated, don't show sidebar (but don't redirect here)
  if (!isAuthenticated) {
    return null;
  }

  // For vendor pages, we still want to show sidebar even if role isn't set yet
  // The vendorType will determine what menu items to show
  // Don't return null for non-vendors on vendor pages - they shouldn't be here anyway

  console.log("[VendorSidebar] vendorType from context:", vendorType);
  console.log("[VendorSidebar] isAuthenticated:", isAuthenticated);
  console.log("[VendorSidebar] user role:", user?.role);

  const menuItems = [
    {
      to: "/vendordashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
      key: "dashboard",
    },
  ];

  // Show Products tab for product vendors OR both vendors
  if (vendorType === "product" || vendorType === "both") {
    menuItems.push({
      to: "/product-dashboard",
      icon: <ShoppingBag size={16} />,
      label: "Products",
      key: "products",
    });
  }

  // Show Services tab for service vendors OR both vendors
  if (vendorType === "service" || vendorType === "both") {
    menuItems.push({
      to: "/services",
      icon: <Package size={16} />,
      label: "Services",
      key: "services",
    });
  }

  // Common menu items
  menuItems.push(
    {
      to: "/order-management",
      icon: <Truck size={16} />,
      label: "Orders",
      key: "orders",
    },
    {
      to: "/payment",
      icon: <CreditCard size={16} />,
      label: "Payments",
      key: "payments",
    },
    {
      to: "/vendor-reviews",
      icon: <MessageSquare size={16} />,
      label: "Reviews",
      key: "reviews",
    },
    {
      to: "/settings",
      icon: <Settings size={16} />,
      label: "Store Settings",
      key: "settings",
    },
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <>
      <aside
        className="w-56 flex flex-col sticky top-3 h-[calc(100vh-1.5rem)] shadow-sm rounded-2xl font-popins"
        style={{
          background:
            "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
        }}
      >
        <div className="p-4 pt-5 pb-4">
          <img
            src={logo}
            alt="Eki"
            className="h-14 w-auto object-contain mx-auto"
          />
        </div>
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive || activePage === item.key
                    ? "bg-[#EFB034FF] text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {item.icon} <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-[11px] font-semibold text-white hover:bg-white/10 transition-all duration-200"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </>
  );
};;

export default VendorSidebar;