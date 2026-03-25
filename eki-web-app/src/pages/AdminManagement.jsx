import React, { useState, useEffect } from 'react';
import Sidebar from '../components/adminDashboard/Sidebar';
import Navbar3 from '../components/adminDashboard/Navbar3';
import VendorList from '../components/VendorList';
import VendorProfile from '../components/VendorProfile';
import { getAdminDashboard, updateVerificationStatus } from '../services/api';
import { Store, Clock, TrendingUp, X } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ label, value, trend, type }) => {
  const configs = {
    vendors: { Icon: Store,      bg: "bg-teal-50",   color: "text-teal-600"   },
    pending: { Icon: Clock,      bg: "bg-amber-50",  color: "text-amber-600"  },
    earners: { Icon: TrendingUp, bg: "bg-green-50",  color: "text-green-600"  },
  };
  const { Icon, bg, color } = configs[type] || configs.earners;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        {/* Colored icon — not gray anymore */}
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={color} size={20} />
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>
          {value}
        </h3>
      </div>
    </div>
  );
};

const AdminManagement = () => {
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [vendors,        setVendors]        = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null); // null = modal closed
  const [loading,        setLoading]        = useState(true);
  const [stats,          setStats]          = useState({ total: "—", pending: "—", approved: "—" });
  const [actionLoading,  setActionLoading]  = useState(false);
  // Full vendor profile loaded when admin clicks a row
  const [vendorDetail,   setVendorDetail]   = useState(null);
  const [detailLoading,  setDetailLoading]  = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getAdminDashboard();
        const apiData = response.data;

        const pipeline = apiData.verification_workflows?.pipeline || {};
        setStats({
          total:    apiData.user_management?.total_vendors ?? "—",
          pending:  pipeline.pending  ?? "—",
          approved: pipeline.approved ?? "—",
        });

        const rawVendors = apiData.verification_workflows?.pending_verifications || [];
        const mapped = rawVendors.map(v => ({
          id:               v.id,
          name:             v.applicant,
          status:           v.status,
          submitted:        v.submitted,
          daysPending:      v.days_pending,
          docsCount:        v.documents_submitted,
          type:             v.type,
          // These come from the full vendor profile — filled on row click
          email:            "",
          businessName:     "",
          businessType:     "",
          businessCategory: "",
        }));
        setVendors(mapped);
      } catch (err) {
        console.error("AdminManagement load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // When admin clicks a vendor row, fetch their full profile
  // Uses GET /api/v1/accounts/admin/vendors/{vendor_id}/
  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
      const d = response.data;
      // Merge the full profile fields into the vendor object
      setVendorDetail({
        ...vendor,
        email:            d.user_email           || d.business_email || "—",
        businessName:     d.business_name        || "—",
        businessType:     d.business_type        || "—",
        businessCategory: d.business_category    || "—",
        businessPhone:    d.business_phone       || "—",
        businessEmail:    d.business_email       || "—",
        address:          d.address              || "—",
        city:             d.city                 || "—",
        country:          d.country              || "—",
        registrationNo:   d.registration_number  || "—",
        taxId:            d.tax_id               || "—",
        openingTime:      d.opening_time         || "—",
        closingTime:      d.closing_time         || "—",
        verifiedAt:       d.verified_at          || "—",
        // Document flags from onboarding
        hasGovId:         d.has_government_issued_id || false,
        hasCountryId:     d.has_country_issued_id    || false,
        hasLicense:       d.has_business_license     || false,
        hasTaxCert:       d.has_tax_certificate      || false,
        hasIncCert:       d.has_incorporation_cert   || false,
        profilePicture:   d.profile_picture          || null,
      });
    } catch (err) {
      console.error("Failed to load vendor detail:", err);
      // Still show modal with basic data even if detail call fails
      setVendorDetail(vendor);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleVendorAction = async (vendorId, action) => {
    setActionLoading(true);
    try {
      await updateVerificationStatus(vendorId, action);
      const newStatus = action === "approved" ? "Approved" : "Suspended";
      setVendors(prev => prev.map(v =>
        v.id === vendorId ? { ...v, status: newStatus } : v
      ));
      setVendorDetail(prev => prev ? { ...prev, status: newStatus } : prev);
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
              <StatCard label="Total Vendors"        value={stats.total}    trend="up"   type="vendors" />
              <StatCard label="Pending Verification" value={stats.pending}  trend="down" type="pending" />
              <StatCard label="Approved Vendors"     value={stats.approved} trend="up"   type="earners" />
            </div>

            {loading ? (
              <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ) : (
              // VendorList is now full-width — no side panel anymore
              <VendorList
                vendors={vendors}
                onSelect={handleSelectVendor}
                selectedId={selectedVendor?.id}
              />
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

      {/* ── Vendor Profile Modal ── */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Vendor Profile</h2>
              <button
                onClick={() => { setSelectedVendor(null); setVendorDetail(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 h-10 rounded-xl animate-pulse" />)}
              </div>
            ) : vendorDetail ? (
              <VendorProfile
                vendor={vendorDetail}
                onApprove={() => handleVendorAction(vendorDetail.id, "approved")}
                onSuspend={() => handleVendorAction(vendorDetail.id, "suspended")}
                actionLoading={actionLoading}
              />
            ) : null}

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;





// import React, { useState, useEffect } from 'react';
// import Sidebar from '../components/adminDashboard/Sidebar';
// import Navbar3 from '../components/adminDashboard/Navbar3';
// import VendorList from '../components/VendorList';
// import VendorProfile from '../components/VendorProfile';
// import { getAdminDashboard, updateVerificationStatus } from '../services/api';
// import { Store, Clock, TrendingUp } from 'lucide-react';

// // Inline stat card for this page (uses the AdminManagement-specific StatCard)
// const StatCard = ({ label, value, change, trend, type }) => {
//   const icons = { vendors: Store, pending: Clock };
//   const Icon = icons[type] || TrendingUp;
//   return (
//     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
//       <div className="flex justify-between items-start">
//         <div className="bg-gray-50 p-2 rounded-lg"><Icon className="text-[#234E4D]" size={20} /></div>
//         <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
//           {change}
//         </span>
//       </div>
//       <div>
//         <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
//         <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
//       </div>
//     </div>
//   );
// };

// const AdminManagement = () => {
//   const [sidebarOpen,    setSidebarOpen]    = useState(false);
//   const [vendors,        setVendors]        = useState([]);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   const [loading,        setLoading]        = useState(true);
//   const [stats,          setStats]          = useState({ total: "—", pending: "—", approved: "—" });
//   const [actionLoading,  setActionLoading]  = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const response = await getAdminDashboard();
//         const apiData = response.data;

//         // Stats from verification pipeline
//         const pipeline = apiData.verification_workflows?.pipeline || {};
//         setStats({
//           total:    apiData.user_management?.total_vendors ?? "—",
//           pending:  pipeline.pending   ?? "—",
//           approved: pipeline.approved  ?? "—",
//         });

//         // Build vendor list from pending_verifications
//         // These have the fields from onboarding
//         const rawVendors = apiData.verification_workflows?.pending_verifications || [];
//         const mapped = rawVendors.map(v => ({
//           id:          v.id,
//           name:        v.applicant,
//           status:      v.status,
//           submitted:   v.submitted,
//           daysPending: v.days_pending,
//           docsCount:   v.documents_submitted,
//           type:        v.type,
//           // These will be filled when you call GET /admin/vendors/{id}
//           avatar:      `https://i.pravatar.cc/150?u=${v.id}`,
//           earnings:    0,
//           listings:    0,
//         }));
//         setVendors(mapped);
//         if (mapped.length > 0) setSelectedVendor(mapped[0]);
//       } catch (err) {
//         console.error("AdminManagement load error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   // Called when admin clicks Approve or Suspend in VendorProfile
//   const handleVendorAction = async (vendorId, action) => {
//     setActionLoading(true);
//     try {
//       await updateVerificationStatus(vendorId, action);
//       // Update the vendor's status in local state immediately
//       setVendors(prev => prev.map(v =>
//         v.id === vendorId
//           ? { ...v, status: action === "approved" ? "Approved" : "Suspended" }
//           : v
//       ));
//       if (selectedVendor?.id === vendorId) {
//         setSelectedVendor(prev => ({
//           ...prev,
//           status: action === "approved" ? "Approved" : "Suspended"
//         }));
//       }
//     } catch (err) {
//       console.error("Vendor action failed:", err);
//       alert("Action failed. Please try again.");
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
//       <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
//       <div className="flex flex-1 min-h-0">
//         <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
//         <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
//           <main className="flex-1 p-5 sm:p-8 space-y-8">

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <StatCard label="Total Vendors"        value={stats.total}    change="" trend="up"   type="vendors" />
//               <StatCard label="Pending Verification" value={stats.pending}  change="" trend="down" type="pending" />
//               <StatCard label="Approved Vendors"     value={stats.approved} change="" trend="up"   type="earners" />
//             </div>

//             {loading ? (
//               <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
//             ) : (
//               <div className="flex flex-col xl:flex-row gap-8">
//                 <div className="flex-1">
//                   {/* VendorList receives onSelect and onAction */}
//                   <VendorList
//                     vendors={vendors}
//                     onSelect={setSelectedVendor}
//                     selectedId={selectedVendor?.id}
//                   />
//                 </div>
//                 {selectedVendor && (
//                   <div className="w-full xl:w-80 shrink-0">
//                     {/* VendorProfile receives onApprove and onSuspend */}
//                     <VendorProfile
//                       vendor={selectedVendor}
//                       onApprove={() => handleVendorAction(selectedVendor.id, "approved")}
//                       onSuspend={() => handleVendorAction(selectedVendor.id, "suspended")}
//                       actionLoading={actionLoading}
//                     />
//                   </div>
//                 )}
//               </div>
//             )}

//           </main>

//           <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
//             <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
//             <div>© 2026 Vendor Portal. All rights reserved.</div>
//             <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
//               <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
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



