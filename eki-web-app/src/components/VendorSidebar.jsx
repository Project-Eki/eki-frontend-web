import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/eki-logo2.png';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Truck, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut 
} from 'lucide-react';
import LogoutModal from './LogoutModal'; // Import your modal component

const VendorSidebar = ({ activePage, isProductVendor, isServiceVendor }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      to: "/vendordashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
      key: "dashboard",
    },
  ];
  // Only show Products tab for product vendors
  if (isProductVendor) {
    menuItems.push({
      to: "/product-dashboard",
      icon: <ShoppingBag size={16} />,
      label: "Products",
      key: "products",
    });
  }

  // Only show Services tab for service vendors
  if (isServiceVendor) {
    menuItems.push({
      to: "/servicemanagement",
      icon: <Package size={16} />,
      label: "Services",
      key: "services",
    });
  }
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
      to: "/reviews",
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
    // Add your logout logic here
    console.log("Logout clicked");

    // Clear any authentication tokens/storage
    localStorage.removeItem("authToken");
    sessionStorage.clear();

    // Redirect to login page
    navigate("/login");
  };

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const confirmLogout = () => {
    handleLogout();
    closeLogoutModal();
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
        {/* Logo */}
        <div className="p-4 pt-5 pb-4">
          <img
            src={logo}
            alt="Eki"
            className="h-14 w-auto object-contain mx-auto"
          />
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {menuItems.map((item) => (
            <SidebarNavLink
              key={item.key}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={activePage === item.key}
            />
          ))}
        </nav>

        <div className="p-3">
          <button
            onClick={openLogoutModal}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-[11px] font-semibold text-white hover:bg-white/10 transition-all duration-200"
          >
            <LogOut size={14} strokeWidth={1.5} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
      />
    </>
  );
};

const SidebarNavLink = ({ to, icon, label, active = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${
        isActive || active
          ? 'bg-[#EFB034FF] text-white'
          : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`
    }
  >
    {icon} <span>{label}</span>
  </NavLink>
);

export default VendorSidebar;