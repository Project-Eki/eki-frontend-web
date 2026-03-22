import React, { useState } from 'react';
import Sidebar from '../components/adminDashboard/Sidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';
import StatCard from '../components/StatCard';
import VendorList from '../components/VendorList';
import VendorProfile from '../components/VendorProfile';

const AdminManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendors] = useState([
    { id:1, name:"Artisan Crafts Co.",   status:"Verified",  earnings:45200.50, listings:124, avatar:"https://i.pravatar.cc/150?u=1" },
    { id:2, name:"TechGear Solutions",   status:"Pending",   earnings:0.00,     listings:45,  avatar:"https://i.pravatar.cc/150?u=2" },
    { id:3, name:"EcoHome Essentials",   status:"Verified",  earnings:12840.00, listings:68,  avatar:"https://i.pravatar.cc/150?u=3" },
    { id:4, name:"Vintage Vault",        status:"Suspended", earnings:8900.25,  listings:12,  avatar:"https://i.pravatar.cc/150?u=4" },
    { id:5, name:"Urban Threads",        status:"Verified",  earnings:31200.75, listings:210, avatar:"https://i.pravatar.cc/150?u=5" },
  ]);
  const [selectedVendor, setSelectedVendor] = useState(vendors[0]);

  return (
    // Outer shell — viewport locked
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">

      {/* Navbar */}
      <Navbar3 onMenuClick={() => setSidebarOpen(true)} />

      {/* Middle row */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar — never scrolls */}
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Right column — only this scrolls */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

          <main className="flex-1 p-5 sm:p-8 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Vendors"          value="1,248" change="+12% from last month"  trend="up"   type="vendors" />
              <StatCard label="Pending Verification"   value="24"    change="-5% from last week"    trend="down" type="pending" />
              <StatCard label="Top Monthly Earners"    value="42"    change="+8.6% performance"     trend="up"   type="earners" />
            </div>

            <div className="flex flex-col xl:flex-row gap-8">
              <div className="flex-1">
                <VendorList vendors={vendors} onSelect={setSelectedVendor} />
              </div>
              <div className="w-full xl:w-80 shrink-0">
                <VendorProfile vendor={selectedVendor} />
              </div>
            </div>

          </main>

          {/* Footer */}
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
    </div>
  );
};

export default AdminManagement;