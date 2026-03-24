import React, { useState, useEffect } from 'react';
import Sidebar from '../components/adminDashboard/Sidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';
import VendorList from '../components/VendorList';
import VendorProfile from '../components/VendorProfile';
import { getAdminDashboard, updateVerificationStatus } from '../services/api';
import { Store, Clock, TrendingUp } from 'lucide-react';

// Inline stat card for this page (uses the AdminManagement-specific StatCard)
const StatCard = ({ label, value, change, trend, type }) => {
  const icons = { vendors: Store, pending: Clock };
  const Icon = icons[type] || TrendingUp;
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <div className="bg-gray-50 p-2 rounded-lg"><Icon className="text-[#234E4D]" size={20} /></div>
        <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      </div>
    </div>
  );
};

const AdminManagement = () => {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [vendors,        setVendors]        = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState({ total: "—", pending: "—", approved: "—" });
  const [actionLoading,  setActionLoading]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboard();
        const apiData = response.data;

        // Stats from verification pipeline
        const pipeline = apiData.verification_workflows?.pipeline || {};
        setStats({
          total:    apiData.user_management?.total_vendors ?? "—",
          pending:  pipeline.pending   ?? "—",
          approved: pipeline.approved  ?? "—",
        });

        // Build vendor list from pending_verifications
        // These have the fields from onboarding
        const rawVendors = apiData.verification_workflows?.pending_verifications || [];
        const mapped = rawVendors.map(v => ({
          id:          v.id,
          name:        v.applicant,
          status:      v.status,
          submitted:   v.submitted,
          daysPending: v.days_pending,
          docsCount:   v.documents_submitted,
          type:        v.type,
          // These will be filled when you call GET /admin/vendors/{id}
          avatar:      `https://i.pravatar.cc/150?u=${v.id}`,
          earnings:    0,
          listings:    0,
        }));
        setVendors(mapped);
        if (mapped.length > 0) setSelectedVendor(mapped[0]);
      } catch (err) {
        console.error("AdminManagement load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Called when admin clicks Approve or Suspend in VendorProfile
  const handleVendorAction = async (vendorId, action) => {
    setActionLoading(true);
    try {
      await updateVerificationStatus(vendorId, action);
      // Update the vendor's status in local state immediately
      setVendors(prev => prev.map(v =>
        v.id === vendorId
          ? { ...v, status: action === "approved" ? "Approved" : "Suspended" }
          : v
      ));
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor(prev => ({
          ...prev,
          status: action === "approved" ? "Approved" : "Suspended"
        }));
      }
    } catch (err) {
      console.error("Vendor action failed:", err);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
      <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 min-h-0">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          <main className="flex-1 p-5 sm:p-8 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Total Vendors"        value={stats.total}    change="" trend="up"   type="vendors" />
              <StatCard label="Pending Verification" value={stats.pending}  change="" trend="down" type="pending" />
              <StatCard label="Approved Vendors"     value={stats.approved} change="" trend="up"   type="earners" />
            </div>

            {loading ? (
              <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ) : (
              <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1">
                  {/* VendorList receives onSelect and onAction */}
                  <VendorList
                    vendors={vendors}
                    onSelect={setSelectedVendor}
                    selectedId={selectedVendor?.id}
                  />
                </div>
                {selectedVendor && (
                  <div className="w-full xl:w-80 shrink-0">
                    {/* VendorProfile receives onApprove and onSuspend */}
                    <VendorProfile
                      vendor={selectedVendor}
                      onApprove={() => handleVendorAction(selectedVendor.id, "approved")}
                      onSuspend={() => handleVendorAction(selectedVendor.id, "suspended")}
                      actionLoading={actionLoading}
                    />
                  </div>
                )}
              </div>
            )}

          </main>

          <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
            <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
            <div>© 2026 Vendor Portal. All rights reserved.</div>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
              <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
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




// import React, { useState } from 'react';
// import Sidebar from '../components/adminDashboard/Sidebar';
// import Navbar3 from '../components/adminDashboard/Navbar3';
// import StatCard from '../components/StatCard';
// import VendorList from '../components/VendorList';
// import VendorProfile from '../components/VendorProfile';

// const AdminManagement = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [vendors] = useState([
//     { id:1, name:"Artisan Crafts Co.",   status:"Verified",  earnings:45200.50, listings:124, avatar:"https://i.pravatar.cc/150?u=1" },
//     { id:2, name:"TechGear Solutions",   status:"Pending",   earnings:0.00,     listings:45,  avatar:"https://i.pravatar.cc/150?u=2" },
//     { id:3, name:"EcoHome Essentials",   status:"Verified",  earnings:12840.00, listings:68,  avatar:"https://i.pravatar.cc/150?u=3" },
//     { id:4, name:"Vintage Vault",        status:"Suspended", earnings:8900.25,  listings:12,  avatar:"https://i.pravatar.cc/150?u=4" },
//     { id:5, name:"Urban Threads",        status:"Verified",  earnings:31200.75, listings:210, avatar:"https://i.pravatar.cc/150?u=5" },
//   ]);
//   const [selectedVendor, setSelectedVendor] = useState(vendors[0]);

//   return (
//     // Outer shell — viewport locked
//     <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">

//       {/* Navbar */}
//       <Navbar3 onMenuClick={() => setSidebarOpen(true)} />

//       {/* Middle row */}
//       <div className="flex flex-1 min-h-0">

//         {/* Sidebar — never scrolls */}
//         <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//         {/* Right column — only this scrolls */}
//         <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">

//           <main className="flex-1 p-5 sm:p-8 space-y-8">

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <StatCard label="Total Vendors"          value="1,248" change="+12% from last month"  trend="up"   type="vendors" />
//               <StatCard label="Pending Verification"   value="24"    change="-5% from last week"    trend="down" type="pending" />
//               <StatCard label="Top Monthly Earners"    value="42"    change="+8.6% performance"     trend="up"   type="earners" />
//             </div>

//             <div className="flex flex-col xl:flex-row gap-8">
//               <div className="flex-1">
//                 <VendorList vendors={vendors} onSelect={setSelectedVendor} />
//               </div>
//               <div className="w-full xl:w-80 shrink-0">
//                 <VendorProfile vendor={selectedVendor} />
//               </div>
//             </div>

//           </main>

//           {/* Footer */}
//           <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
//             <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
//             <div>© 2026 Vendor Portal. All rights reserved.</div>
//             <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
//               <span className="relative inline-block cursor-pointer hover:underline">
//                 eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
//               </span>
//               <span className="cursor-pointer hover:underline">Support</span>
//               <span className="cursor-pointer hover:underline">Privacy Policy</span>
//               <span className="cursor-pointer hover:underline">Terms of Service</span>
//               <span className="cursor-pointer hover:underline">Ijoema ltd</span>
//             </div>
//           </footer>

//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminManagement;