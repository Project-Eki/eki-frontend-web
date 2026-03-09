import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
// Corrected paths: going up one level to find the components folder
import StatsGrid from '../components/StatsGrid';
import RecentOrders from '../components/RecentOrders';
import { QuickActions, PayoutCard, InventoryAlerts, RecentReviews } from '../components/SidebarWidgets';

const VendorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <div className="font-bold text-xl text-teal-800 tracking-tight">
            eki<span className="text-[10px] align-top ml-0.5">TM</span>
          </div>
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search..." 
              className="bg-gray-100 rounded-full py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <button className="text-yellow-600 border-b-2 border-yellow-600 pb-1">Dashboard</button>
            <button className="hover:text-gray-800 transition-colors">Products</button>
            <button className="hover:text-gray-800 transition-colors">Services</button>
            <button className="hover:text-gray-800 transition-colors">Orders</button>
            <button className="hover:text-gray-800 transition-colors">Payments</button>
          </div>
          <div className="flex items-center gap-4 border-l pl-6 border-gray-100">
            <Settings size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <Bell size={20} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-100 group-hover:border-teal-500 transition-all">
                <img src="/api/placeholder/32/32" alt="User" />
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-gray-800">Artisan Workshop</p>
                <p className="text-[10px] text-gray-400 leading-none">Admin James</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="p-8 max-w-[1400px] mx-auto w-full flex-grow">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Eki Vendor Command Center</h1>
          <p className="text-gray-500 text-sm">Welcome back, James. Here's what's happening with your store today.</p>
        </header>

        {/* Highlight Stats */}
        <StatsGrid />

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Column */}
          <div className="flex-[2.5] flex flex-col gap-6">
            <section className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-gray-800">Sales Performance</h3>
                    <p className="text-[10px] text-gray-400">Revenue trajectory for Oct 01 - Oct 31</p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-md text-[10px] font-bold text-gray-500">
                    <button className="px-3 py-1 hover:text-gray-800">1W</button>
                    <button className="px-3 py-1 bg-white shadow-sm rounded text-gray-800">1M</button>
                    <button className="px-3 py-1 hover:text-gray-800">1Y</button>
                  </div>
               </div>
               
               {/* Simplified Responsive SVG Chart */}
               <div className="h-64 w-full relative pt-4">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#2D7A78" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2D7A78" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M0,150 Q100,160 200,100 T400,80 T600,120 T800,50" 
                      fill="none" 
                      stroke="#2D7A78" 
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path 
                      d="M0,150 Q100,160 200,100 T400,80 T600,120 T800,50 V200 H0 Z" 
                      fill="url(#chartGradient)" 
                    />
                  </svg>
                  <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 font-medium pt-2">
                    <span>Oct 01</span><span>Oct 08</span><span>Oct 15</span><span>Oct 22</span><span>Oct 31</span>
                  </div>
               </div>
            </section>

            <RecentOrders />
          </div>

          {/* Sidebar Column */}
          <aside className="flex-1 space-y-6">
            <QuickActions />
            <PayoutCard />
            <InventoryAlerts />
            <RecentReviews />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#234E4D] text-white py-4 px-8 text-[10px]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="italic opacity-90">Buy Smart. Sell Fast. Grow Together...</div>
          <div className="opacity-80">© 2026 Vendor Portal. All rights reserved. eki<span className="text-[8px] ml-0.5">TM</span></div>
          <div className="flex gap-6 uppercase font-bold tracking-tight">
            <a href="#" className="hover:text-yellow-400 transition-colors">Support</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
            <span className="border-l border-white/30 pl-6 uppercase opacity-90">Ijoema ltd</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorDashboard;