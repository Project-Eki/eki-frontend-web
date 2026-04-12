import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
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

const VendorSidebar = ({ activePage, vendorType, businessCategory }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Define service categories
  const serviceCategories = [
    "beauty",
    "transport",
    "tailoring",
    "airlines",
    "hotels",
    "other",
  ];

  // Determine vendor type - prioritize vendorType prop, then use businessCategory
  let finalVendorType = vendorType;

  if (!finalVendorType && businessCategory) {
    finalVendorType = serviceCategories.includes(businessCategory)
      ? "service"
      : "product";
  }

  // Default to 'product' if still not determined
  if (!finalVendorType) {
    finalVendorType = "product";
  }

  console.log("[VendorSidebar] vendorType prop:", vendorType);
  console.log("[VendorSidebar] businessCategory prop:", businessCategory);
  console.log("[VendorSidebar] finalVendorType:", finalVendorType);

  const menuItems = [
    {
      to: "/vendordashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
      key: "dashboard",
    },
  ];

  // Only show Products tab for product vendors
  if (finalVendorType === "product") {
    menuItems.push({
      to: "/product-dashboard",
      icon: <ShoppingBag size={16} />,
      label: "Products",
      key: "products",
    });
  }

  // Only show Services tab for service vendors
  if (finalVendorType === "service") {
    menuItems.push({
      to: "/servicemanagement",
      icon: <Package size={16} />,
      label: "Services",
      key: "services",
    });
  }

  // menu items
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
};

export default VendorSidebar;
