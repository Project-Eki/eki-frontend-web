import React, { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/StatCard';
import VendorList from '../components/VendorList';
import VendorProfile from '../components/VendorProfile';

// Changed the name here to AdminManagement
const AdminManagement = () => {
  const [vendors] = useState([
    { id: 1, name: "Artisan Crafts Co.", status: "Verified", earnings: 45200.50, listings: 124, avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "TechGear Solutions", status: "Pending", earnings: 0.00, listings: 45, avatar: "https://i.pravatar.cc/150?u=2" },
    { id: 3, name: "EcoHome Essentials", status: "Verified", earnings: 12840.00, listings: 68, avatar: "https://i.pravatar.cc/150?u=3" },
    { id: 4, name: "Vintage Vault", status: "Suspended", earnings: 8900.25, listings: 12, avatar: "https://i.pravatar.cc/150?u=4" },
    { id: 5, name: "Urban Threads", status: "Verified", earnings: 31200.75, listings: 210, avatar: "https://i.pravatar.cc/150?u=5" },
  ]);

  const [selectedVendor, setSelectedVendor] = useState(vendors[0]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Total Vendors" value="1,248" change="+12% from last month" trend="up" type="vendors" />
            <StatCard label="Pending Verification" value="24" change="-5% from last week" trend="down" type="pending" />
            <StatCard label="Top Monthly Earners" value="42" change="+8.6% performance" trend="up" type="earners" />
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <VendorList vendors={vendors} />
            </div>
            <div className="w-full xl:w-80 flex-shrink-0">
              <VendorProfile vendor={selectedVendor} />
            </div>
          </div>
        </main>

        <footer className="bg-[#234E4D] text-white py-3 px-8 flex justify-between items-center text-[10px] tracking-wide">
          <div className="font-bold italic">Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved. <strong>eki™</strong></div>
          <div className="flex gap-4">
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Changed the export name here too
export default AdminManagement;