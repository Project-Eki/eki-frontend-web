import React, { useState } from 'react';
import {
  Briefcase, Lock, User, Settings,
  LogOut, ChevronRight, Bell, ChevronDown, LayoutDashboard, ShoppingBag
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VendorSidebar from '../components/VendorSidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';

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
    <div className="flex min-h-screen bg-[#FDFDFD] font-poppins text-slate-800 p-3 gap-3">
      {/* VendorSidebar Component */}
      <VendorSidebar activePage="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar3 />

        <div className="flex-1 overflow-y-auto">
          <main className="flex-1 px-4 sm:px-8 py-6">
            <div className="max-w-2xl mx-auto">

              <div className="mb-6">
                <h1 className="text-xl font-black text-slate-900">Settings & Privacy</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences and privacy controls</p>
              </div>

              <div className="space-y-2">
                {menuItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={i}
                      to={item.path}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.bg} ${item.color} transition-transform duration-200 ${hovered === i ? 'scale-110' : ''}`}>
                          <Icon size={17} strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight">{item.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug hidden sm:block">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </NavLink>
                  );
                })}
              </div>

              <div className="my-4 border-t border-slate-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-2xl border border-slate-200 hover:border-red-200 hover:bg-red-50 transition-all group"
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

          <footer className="bg-[#125852] text-white py-2.5 px-5 flex justify-between items-center text-[8px] rounded-xl mx-5 mb-3">
            <div>Buy Smart. Sell Fast. Grow Together...</div>
            <div>© 2026 Vendor Portal. All rights reserved.</div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;