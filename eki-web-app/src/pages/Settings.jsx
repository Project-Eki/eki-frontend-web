import React, { useState } from 'react';
import {
  Briefcase, Lock, User, Settings,
  LogOut, ChevronRight, Bell, ChevronDown, LayoutDashboard, ShoppingBag
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adaefe from '../assets/adaefe.jpg';

/* ── settings menu items — each has a path now ── */
const menuItems = [
  {
    title: 'Business Settings',
    desc: 'Manage your store name, category, and business details',
    icon: Briefcase,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    path: '/business-settings',
  },
  {
    title: 'Privacy Settings',
    desc: 'Control who can see your profile and contact information',
    icon: Lock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    path: '/privacy-settings',
  },
  {
    title: 'Account Settings',
    desc: 'Update your email, phone number, and password',
    icon: User,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    path: '/account-settings',
  },
  {
    title: 'General Settings',
    desc: 'Language, notifications, and display preferences',
    icon: Settings,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    path: '/general-settings',
  },
];

/* ── Navbar — matches vendor navbar with Dashboard/Products/Services links ── */
const Navbar = ({ userName = "Cameron Williamson", userRole = "Vendor" }) => (
  <nav className="flex items-center justify-between px-4 sm:px-8 py-1 bg-white border-b border-gray-100 sticky top-0 z-50 h-16 shrink-0">

    {/* Logo */}
    <div className="flex items-center shrink-0">
      <img src="/ekilogo.png" alt="EKI Logo" className="h-10 w-auto object-contain" />
    </div>

    {/* Center nav links — hidden on small screens */}
    <div className="hidden md:flex items-center gap-18 text-sm font-medium">
      <NavLink
        to="/vendordashboard"
        className={({ isActive }) =>
          `flex items-center gap-1.5 transition-colors ${isActive ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`
        }
      >
         Dashboard
      </NavLink>
      <NavLink
        to="/product-dashboard"
        className={({ isActive }) =>
          `flex items-center gap-1.5 transition-colors ${isActive ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`
        }
      >
        Products
      </NavLink>
      <NavLink
        to="/servicemanagement"
        className={({ isActive }) =>
          `flex items-center gap-1.5 transition-colors ${isActive ? 'text-teal-700 font-bold' : 'text-gray-500 hover:text-gray-900'}`
        }
      >
         Services
      </NavLink>
    </div>

    {/* Right: Bell + User */}
    <div className="flex items-center space-x-3 sm:space-x-6">
      <button className="relative text-gray-500 hover:text-teal-700 transition-colors">
        <Bell size={22} />
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div className="flex items-center space-x-2 sm:space-x-3 border-l pl-3 sm:pl-6 border-gray-100">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-bold text-gray-800 leading-tight">{userName}</p>
          <p className="text-xs text-gray-500 font-medium">{userRole}</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer shrink-0">
          <img src={adaefe} alt="User" className="w-full h-full object-cover" />
        </div>
        <ChevronDown size={16} className="text-gray-400 cursor-pointer hidden sm:block" />
      </div>
    </div>
  </nav>
);

/* ── Main Settings Page ── */
const SettingsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
      <Navbar />

      <div className="flex-1 overflow-y-auto flex flex-col">
        <main className="flex-1 px-4 sm:px-8 py-8">
          <div className="max-w-2xl mx-auto">

            <div className="mb-6">
              <h1 className="text-xl font-black text-gray-900">Settings & Privacy</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences and privacy controls</p>
            </div>

            <div className="space-y-2">
              {menuItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  // Each item is now a NavLink that navigates to item.path
                  <NavLink
                    key={i}
                    to={item.path}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} transition-transform duration-200 ${hovered === i ? 'scale-110' : ''}`}>
                        <Icon size={17} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{item.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug hidden sm:block">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </NavLink>
                );
              })}
            </div>

            <div className="my-4 border-t border-gray-100" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 hover:border-red-100 hover:bg-red-50 transition-all group"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 text-red-500 group-hover:scale-110 transition-transform duration-200">
                <LogOut size={17} strokeWidth={2} className="rotate-180" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-red-500 leading-tight">Sign out</p>
                <p className="text-[11px] text-red-300 mt-0.5 hidden sm:block">You will be logged out of your account</p>
              </div>
            </button>

          </div>
        </main>

        <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
          <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved.</div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <span className="relative inline-block cursor-pointer hover:underline">
              eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
            </span>
            <span className="cursor-pointer hover:underline">Support</span>
            <span className="cursor-pointer hover:underline">Privacy Policy</span>
            <span className="cursor-pointer hover:underline">Terms of Service</span>
            <span className="cursor-pointer hover:underline">Ijoema ltd</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SettingsPage;