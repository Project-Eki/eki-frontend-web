import React, { useState, useEffect, useCallback } from 'react';
import Sidebar      from '../components/adminDashboard/Sidebar';
import Navbar3      from '../components/adminDashboard/Navbar3';
import VendorList   from '../components/VendorList';
import VendorProfile from '../components/VendorProfile';
import { getAdminDashboard, updateVerificationStatus } from '../services/api';
import { Store, Clock, TrendingUp, X, ChevronLeft, ChevronRight, FileText, ExternalLink, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../services/api';

const StatCard = ({ label, value, trend, type }) => {
  const configs = {
    vendors: { Icon: Store,      bg: "bg-teal-50",  color: "text-teal-600"  },
    pending: { Icon: Clock,      bg: "bg-amber-50", color: "text-amber-600" },
    earners: { Icon: TrendingUp, bg: "bg-green-50", color: "text-green-600" },
  };
  const { Icon, bg, color } = configs[type] || configs.earners;
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div className={`p-2.5 rounded-xl ${bg}`}><Icon className={color} size={20}/></div>
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>{value}</h3>
      </div>
    </div>
  );
};



// DOCUMENT REVIEW MODAL
//
// Calls GET /accounts/admin/vendors/{id}/review/ which returns
// actual document URLs (not just boolean flags).

const DocumentReviewModal = ({ vendorId, vendorName, onClose }) => {
  const [docs,    setDocs]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/accounts/admin/vendors/${vendorId}/review/`);
        // FIX: unwrap backend envelope { success, data, message }
        const detail = response.data?.data || response.data;
        setDocs(detail.documents || {});
      } catch (err) {
        setError('Failed to load documents. Please try again.');
        console.error('Document fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    if (vendorId) fetchDocs();
  }, [vendorId]);

  const DOC_LABELS = {
    government_issued_id: 'Government Issued ID',
    country_issued_id:    'Country Issued ID',
    business_license:     'Business License',
    tax_certificate:      'Tax Certificate',
    incorporation_cert:   'Incorporation Certificate',
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Document Review</h2>
            <p className="text-xs text-gray-400 mt-0.5">{vendorName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500"/>
          </button>
        </div>
        <div className="p-6">
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse"/>)}
            </div>
          )}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
          {!loading && !error && docs && (
            <div className="space-y-3">
              {Object.keys(DOC_LABELS).map(key => {
                const doc = docs[key];
                return (
                  <div key={key} className={`flex items-center justify-between p-3.5 rounded-xl border ${doc ? 'border-green-100 bg-green-50/40' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <FileText size={15} className={doc ? 'text-green-600' : 'text-gray-300'}/>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{DOC_LABELS[key]}</p>
                        {doc?.filename && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[200px]">{doc.filename}</p>}
                      </div>
                    </div>
                    {doc?.url ? (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-teal-700 bg-white border border-teal-100 rounded-lg hover:bg-teal-50 transition-colors">
                        View <ExternalLink size={10}/>
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-500 rounded-full">Missing</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



// TERMINATE VENDOR MODAL
// Safe UX: requires typing TERMINATE + providing a reason
const TerminateVendorModal = ({ vendor, onConfirm, onClose, loading }) => {
  const [confirmText, setConfirmText] = useState('');
  const [reason,      setReason]      = useState('');
  const canConfirm = confirmText === 'TERMINATE' && reason.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-600"/>
            <h2 className="text-base font-bold text-red-800">Terminate Vendor</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors">
            <X size={18} className="text-red-500"/>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-sm text-amber-800">
            This will permanently suspend <strong>{vendor?.name}</strong>. They will lose access to the platform immediately. This action is reversible only by a super-admin.
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Reason for termination <span className="text-red-400">*</span></label>
            <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Explain why this vendor is being terminated..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"/>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              Type <span className="font-black text-red-600 tracking-wider">TERMINATE</span> to confirm
            </label>
            <input type="text" value={confirmText} onChange={e => setConfirmText(e.target.value)}
              placeholder="TERMINATE"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"/>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={() => onConfirm(reason)} disabled={!canConfirm || loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {loading ? <Loader2 size={14} className="animate-spin"/> : <AlertTriangle size={14}/>}
              Terminate Vendor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Status filter + pagination wrapper around VendorList
const VendorListWithFilters = ({ vendors, onSelect, selectedId }) => {
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const filtered = statusFilter === 'All'
    ? vendors
    : vendors.filter(v => v.status?.toLowerCase() === statusFilter.toLowerCase());

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const slice      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-400">{filtered.length} vendor{filtered.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Pending', 'Approved', 'Rejected', 'Suspended'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-colors ${
                statusFilter === s ? 'bg-teal-700 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-teal-400'
              }`}>{s}</button>
          ))}
        </div>
      </div>
      <VendorList vendors={slice} onSelect={onSelect} selectedId={selectedId}/>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={14}/></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={14}/></button>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminManagement = () => {
  const [sidebarOpen,      setSidebarOpen]      = useState(false);
  const [vendors,          setVendors]          = useState([]);
  const [selectedVendor,   setSelectedVendor]   = useState(null);
  const [vendorDetail,     setVendorDetail]      = useState(null);
  const [detailLoading,    setDetailLoading]    = useState(false);
  const [loading,          setLoading]          = useState(true);
  const [actionLoading,    setActionLoading]    = useState(false);
  const [stats,            setStats]            = useState({ total: "—", pending: "—", approved: "—" });
  const [showDocReview,    setShowDocReview]    = useState(false);
  const [showTerminate,    setShowTerminate]    = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashResponse, vendorsResponse] = await Promise.all([
        getAdminDashboard(),
        api.get('/accounts/admin/vendors/'),
      ]);

      const dashData = dashResponse.data;
      const pipeline = dashData.verification_workflows?.pipeline || {};

      // FIX: sum pipeline counts for total instead of reading a non-existent field
      const totalVendors = Object.values(pipeline).reduce((sum, v) => sum + (Number(v) || 0), 0);
      setStats({
        total:    totalVendors || "—",
        pending:  pipeline.pending  || "—",
        approved: pipeline.approved || "—",
      });

      // FIX: unwrap backend envelope for vendor list
      const rawVendors = vendorsResponse.data?.data || vendorsResponse.data || [];
      const vendorArray = Array.isArray(rawVendors) ? rawVendors : [];

      setVendors(vendorArray.map(v => ({
        id:               v.id,
        name:             v.owner_full_name   || v.user_name || '—',
        email:            v.user_email        || v.business_email || '',
        status:           v.verification_status
                            ? v.verification_status.charAt(0).toUpperCase() + v.verification_status.slice(1)
                            : 'Pending',
        submitted:        v.created_at ? new Date(v.created_at).toLocaleDateString() : '—',
        daysPending:      null,
        docsCount:        null,
        businessName:     v.business_name     || '—',
        businessType:     v.business_type     || '—',
        businessCategory: v.business_category || '—',
      })));

    } catch (err) {
      console.error("AdminManagement load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSelectVendor = async (vendor) => {
    setSelectedVendor(vendor);
    setVendorDetail(null);
    setDetailLoading(true);
    try {
      const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
      // FIX: was reading response.data directly (the envelope)
      // Now reads response.data.data (the actual vendor object)
      const d = response.data?.data || response.data;
      setVendorDetail({
        ...vendor,
        email:            d.user_email            || d.business_email || "—",
        name:             d.user_name             || d.owner_full_name || vendor.name,
        profilePicture:   d.profile_picture       || null,
        businessName:     d.business_name         || "—",
        businessType:     d.business_type         || "—",
        businessCategory: d.business_category     || "—",
        businessPhone:    d.business_phone        || "—",
        businessEmail:    d.business_email        || "—",
        address:          d.address               || "—",
        city:             d.city                  || "—",
        country:          d.country               || "—",
        registrationNo:   d.registration_number   || "—",
        taxId:            d.tax_id                || "—",
        openingTime:      d.opening_time          || "—",
        closingTime:      d.closing_time          || "—",
        verifiedAt:       d.verified_at           || "—",
        // FIX: these are now correct because d is the actual vendor object
        hasGovId:         d.has_government_issued_id || false,
        hasCountryId:     d.has_country_issued_id    || false,
        hasLicense:       d.has_business_license     || false,
        hasTaxCert:       d.has_tax_certificate      || false,
        hasIncCert:       d.has_incorporation_cert   || false,
      });
    } catch (err) {
      console.error("Failed to load vendor detail:", err);
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
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status: newStatus } : v));
      setVendorDetail(prev => prev ? { ...prev, status: newStatus } : prev);
    } catch (err) {
      console.error("Vendor action failed:", err);
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async (reason) => {
    if (!vendorDetail) return;
    setTerminateLoading(true);
    try {
      await updateVerificationStatus(vendorDetail.id, 'suspended', reason);
      setVendors(prev => prev.map(v => v.id === vendorDetail.id ? { ...v, status: 'Suspended' } : v));
      setVendorDetail(prev => prev ? { ...prev, status: 'Suspended' } : prev);
      setShowTerminate(false);
    } catch (err) {
      console.error("Terminate failed:", err);
      alert("Termination failed. Please try again.");
    } finally {
      setTerminateLoading(false);
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
              <StatCard label="Total Vendors"        value={stats.total}    trend="up"   type="vendors"/>
              <StatCard label="Pending Verification" value={stats.pending}  trend="down" type="pending"/>
              <StatCard label="Vendors Approved"     value={stats.approved} trend="up"   type="earners"/>
            </div>

            {loading ? (
              <div className="bg-gray-100 rounded-xl h-64 animate-pulse"/>
            ) : (
              <VendorListWithFilters vendors={vendors} onSelect={handleSelectVendor} selectedId={selectedVendor?.id}/>
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

      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Vendor Profile</h2>
              <button onClick={() => { setSelectedVendor(null); setVendorDetail(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-500"/>
              </button>
            </div>
            {detailLoading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 h-10 rounded-xl animate-pulse"/>)}
              </div>
            ) : vendorDetail ? (
              <VendorProfile
                vendor={vendorDetail}
                onApprove={() => handleVendorAction(vendorDetail.id, "approved")}
                onSuspend={() => handleVendorAction(vendorDetail.id, "suspended")}
                onReviewDocuments={() => setShowDocReview(true)}
                onTerminate={() => setShowTerminate(true)}
                actionLoading={actionLoading}
              />
            ) : null}
          </div>
        </div>
      )}

      {showDocReview && vendorDetail && (
        <DocumentReviewModal vendorId={vendorDetail.id} vendorName={vendorDetail.name} onClose={() => setShowDocReview(false)}/>
      )}

      {showTerminate && vendorDetail && (
        <TerminateVendorModal vendor={vendorDetail} onConfirm={handleTerminate} onClose={() => setShowTerminate(false)} loading={terminateLoading}/>
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
// import { Store, Clock, TrendingUp, X } from 'lucide-react';
// import api from '../services/api';

// const StatCard = ({ label, value, trend, type }) => {
//   const configs = {
//     vendors: { Icon: Store,      bg: "bg-teal-50",   color: "text-teal-600"   },
//     pending: { Icon: Clock,      bg: "bg-amber-50",  color: "text-amber-600"  },
//     earners: { Icon: TrendingUp, bg: "bg-green-50",  color: "text-green-600"  },
//   };
//   const { Icon, bg, color } = configs[type] || configs.earners;

//   return (
//     <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-3">
//       <div className="flex justify-between items-start">
//         {/* Colored icon — not gray anymore */}
//         <div className={`p-2.5 rounded-xl ${bg}`}>
//           <Icon className={color} size={20} />
//         </div>
//       </div>
//       <div>
//         <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
//         <h3 className={`text-2xl font-bold mt-1 ${value === "—" ? "text-gray-300" : "text-gray-900"}`}>
//           {value}
//         </h3>
//       </div>
//     </div>
//   );
// };

// const AdminManagement = () => {
//   const [sidebarOpen,    setSidebarOpen]    = useState(false);
//   const [vendors,        setVendors]        = useState([]);
//   const [selectedVendor, setSelectedVendor] = useState(null); // null = modal closed
//   const [loading,        setLoading]        = useState(true);
//   const [stats,          setStats]          = useState({ total: "—", pending: "—", approved: "—" });
//   const [actionLoading,  setActionLoading]  = useState(false);
//   // Full vendor profile loaded when admin clicks a row
//   const [vendorDetail,   setVendorDetail]   = useState(null);
//   const [detailLoading,  setDetailLoading]  = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const response = await getAdminDashboard();
//         const apiData = response.data;

//         const pipeline = apiData.verification_workflows?.pipeline || {};
//         setStats({
//           total:    apiData.user_management?.total_vendors ?? "—",
//           pending:  pipeline.pending  ?? "—",
//           approved: pipeline.approved ?? "—",
//         });

//         const rawVendors = apiData.verification_workflows?.pending_verifications || [];
//         const mapped = rawVendors.map(v => ({
//           id:               v.id,
//           name:             v.applicant,
//           status:           v.status,
//           submitted:        v.submitted,
//           daysPending:      v.days_pending,
//           docsCount:        v.documents_submitted,
//           type:             v.type,
//           // These come from the full vendor profile — filled on row click
//           email:            "",
//           businessName:     "",
//           businessType:     "",
//           businessCategory: "",
//         }));
//         setVendors(mapped);
//       } catch (err) {
//         console.error("AdminManagement load error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   // When admin clicks a vendor row, fetch their full profile
//   // Uses GET /api/v1/accounts/admin/vendors/{vendor_id}/
//   const handleSelectVendor = async (vendor) => {
//     setSelectedVendor(vendor);
//     setVendorDetail(null);
//     setDetailLoading(true);
//     try {
//       const response = await api.get(`/accounts/admin/vendors/${vendor.id}/`);
//       const d = response.data;
//       // Merge the full profile fields into the vendor object
//       setVendorDetail({
//         ...vendor,
//         email:            d.user_email           || d.business_email || "—",
//         businessName:     d.business_name        || "—",
//         businessType:     d.business_type        || "—",
//         businessCategory: d.business_category    || "—",
//         businessPhone:    d.business_phone       || "—",
//         businessEmail:    d.business_email       || "—",
//         address:          d.address              || "—",
//         city:             d.city                 || "—",
//         country:          d.country              || "—",
//         registrationNo:   d.registration_number  || "—",
//         taxId:            d.tax_id               || "—",
//         openingTime:      d.opening_time         || "—",
//         closingTime:      d.closing_time         || "—",
//         verifiedAt:       d.verified_at          || "—",
//         // Document flags from onboarding
//         hasGovId:         d.has_government_issued_id || false,
//         hasCountryId:     d.has_country_issued_id    || false,
//         hasLicense:       d.has_business_license     || false,
//         hasTaxCert:       d.has_tax_certificate      || false,
//         hasIncCert:       d.has_incorporation_cert   || false,
//         profilePicture:   d.profile_picture          || null,
//       });
//     } catch (err) {
//       console.error("Failed to load vendor detail:", err);
//       // Still show modal with basic data even if detail call fails
//       setVendorDetail(vendor);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const handleVendorAction = async (vendorId, action) => {
//     setActionLoading(true);
//     try {
//       await updateVerificationStatus(vendorId, action);
//       const newStatus = action === "approved" ? "Approved" : "Suspended";
//       setVendors(prev => prev.map(v =>
//         v.id === vendorId ? { ...v, status: newStatus } : v
//       ));
//       setVendorDetail(prev => prev ? { ...prev, status: newStatus } : prev);
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
//               <StatCard label="Total Vendors"        value={stats.total}    trend="up"   type="vendors" />
//               <StatCard label="Pending Verification" value={stats.pending}  trend="down" type="pending" />
//               <StatCard label="Approved Vendors"     value={stats.approved} trend="up"   type="earners" />
//             </div>

//             {loading ? (
//               <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
//             ) : (
//               // VendorList is now full-width — no side panel anymore
//               <VendorList
//                 vendors={vendors}
//                 onSelect={handleSelectVendor}
//                 selectedId={selectedVendor?.id}
//               />
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

//       {/* ── Vendor Profile Modal ── */}
//       {selectedVendor && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//           <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

//             {/* Modal header */}
//             <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
//               <h2 className="text-lg font-bold text-gray-900">Vendor Profile</h2>
//               <button
//                 onClick={() => { setSelectedVendor(null); setVendorDetail(null); }}
//                 className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
//               >
//                 <X size={18} className="text-gray-500" />
//               </button>
//             </div>

//             {detailLoading ? (
//               <div className="p-8 space-y-4">
//                 {[1,2,3,4].map(i => <div key={i} className="bg-gray-100 h-10 rounded-xl animate-pulse" />)}
//               </div>
//             ) : vendorDetail ? (
//               <VendorProfile
//                 vendor={vendorDetail}
//                 onApprove={() => handleVendorAction(vendorDetail.id, "approved")}
//                 onSuspend={() => handleVendorAction(vendorDetail.id, "suspended")}
//                 actionLoading={actionLoading}
//               />
//             ) : null}

//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminManagement;





// // import React, { useState, useEffect } from 'react';
// // import Sidebar from '../components/adminDashboard/Sidebar';
// // import Navbar3 from '../components/adminDashboard/Navbar3';
// // import VendorList from '../components/VendorList';
// // import VendorProfile from '../components/VendorProfile';
// // import { getAdminDashboard, updateVerificationStatus } from '../services/api';
// // import { Store, Clock, TrendingUp } from 'lucide-react';

// // // Inline stat card for this page (uses the AdminManagement-specific StatCard)
// // const StatCard = ({ label, value, change, trend, type }) => {
// //   const icons = { vendors: Store, pending: Clock };
// //   const Icon = icons[type] || TrendingUp;
// //   return (
// //     <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2">
// //       <div className="flex justify-between items-start">
// //         <div className="bg-gray-50 p-2 rounded-lg"><Icon className="text-[#234E4D]" size={20} /></div>
// //         <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
// //           {change}
// //         </span>
// //       </div>
// //       <div>
// //         <p className="text-gray-500 text-[11px] font-medium uppercase tracking-wider">{label}</p>
// //         <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
// //       </div>
// //     </div>
// //   );
// // };

// // const AdminManagement = () => {
// //   const [sidebarOpen,    setSidebarOpen]    = useState(false);
// //   const [vendors,        setVendors]        = useState([]);
// //   const [selectedVendor, setSelectedVendor] = useState(null);
// //   const [loading,        setLoading]        = useState(true);
// //   const [stats,          setStats]          = useState({ total: "—", pending: "—", approved: "—" });
// //   const [actionLoading,  setActionLoading]  = useState(false);

// //   useEffect(() => {
// //     const load = async () => {
// //       setLoading(true);
// //       try {
// //         const response = await getAdminDashboard();
// //         const apiData = response.data;

// //         // Stats from verification pipeline
// //         const pipeline = apiData.verification_workflows?.pipeline || {};
// //         setStats({
// //           total:    apiData.user_management?.total_vendors ?? "—",
// //           pending:  pipeline.pending   ?? "—",
// //           approved: pipeline.approved  ?? "—",
// //         });

// //         // Build vendor list from pending_verifications
// //         // These have the fields from onboarding
// //         const rawVendors = apiData.verification_workflows?.pending_verifications || [];
// //         const mapped = rawVendors.map(v => ({
// //           id:          v.id,
// //           name:        v.applicant,
// //           status:      v.status,
// //           submitted:   v.submitted,
// //           daysPending: v.days_pending,
// //           docsCount:   v.documents_submitted,
// //           type:        v.type,
// //           // These will be filled when you call GET /admin/vendors/{id}
// //           avatar:      `https://i.pravatar.cc/150?u=${v.id}`,
// //           earnings:    0,
// //           listings:    0,
// //         }));
// //         setVendors(mapped);
// //         if (mapped.length > 0) setSelectedVendor(mapped[0]);
// //       } catch (err) {
// //         console.error("AdminManagement load error:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };
// //     load();
// //   }, []);

// //   // Called when admin clicks Approve or Suspend in VendorProfile
// //   const handleVendorAction = async (vendorId, action) => {
// //     setActionLoading(true);
// //     try {
// //       await updateVerificationStatus(vendorId, action);
// //       // Update the vendor's status in local state immediately
// //       setVendors(prev => prev.map(v =>
// //         v.id === vendorId
// //           ? { ...v, status: action === "approved" ? "Approved" : "Suspended" }
// //           : v
// //       ));
// //       if (selectedVendor?.id === vendorId) {
// //         setSelectedVendor(prev => ({
// //           ...prev,
// //           status: action === "approved" ? "Approved" : "Suspended"
// //         }));
// //       }
// //     } catch (err) {
// //       console.error("Vendor action failed:", err);
// //       alert("Action failed. Please try again.");
// //     } finally {
// //       setActionLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="h-screen flex flex-col overflow-hidden bg-gray-50 font-sans">
// //       <Navbar3 onMenuClick={() => setSidebarOpen(true)} />
// //       <div className="flex flex-1 min-h-0">
// //         <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
// //         <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
// //           <main className="flex-1 p-5 sm:p-8 space-y-8">

// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //               <StatCard label="Total Vendors"        value={stats.total}    change="" trend="up"   type="vendors" />
// //               <StatCard label="Pending Verification" value={stats.pending}  change="" trend="down" type="pending" />
// //               <StatCard label="Approved Vendors"     value={stats.approved} change="" trend="up"   type="earners" />
// //             </div>

// //             {loading ? (
// //               <div className="bg-gray-100 rounded-xl h-64 animate-pulse" />
// //             ) : (
// //               <div className="flex flex-col xl:flex-row gap-8">
// //                 <div className="flex-1">
// //                   {/* VendorList receives onSelect and onAction */}
// //                   <VendorList
// //                     vendors={vendors}
// //                     onSelect={setSelectedVendor}
// //                     selectedId={selectedVendor?.id}
// //                   />
// //                 </div>
// //                 {selectedVendor && (
// //                   <div className="w-full xl:w-80 shrink-0">
// //                     {/* VendorProfile receives onApprove and onSuspend */}
// //                     <VendorProfile
// //                       vendor={selectedVendor}
// //                       onApprove={() => handleVendorAction(selectedVendor.id, "approved")}
// //                       onSuspend={() => handleVendorAction(selectedVendor.id, "suspended")}
// //                       actionLoading={actionLoading}
// //                     />
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //           </main>

// //           <footer className="bg-[#1D4D4C] text-white py-4 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px] shrink-0">
// //             <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
// //             <div>© 2026 Vendor Portal. All rights reserved.</div>
// //             <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
// //               <span className="relative inline-block cursor-pointer hover:underline">eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span></span>
// //               <span className="cursor-pointer hover:underline">Support</span>
// //               <span className="cursor-pointer hover:underline">Privacy Policy</span>
// //               <span className="cursor-pointer hover:underline">Terms of Service</span>
// //               <span className="cursor-pointer hover:underline">Ijoema ltd</span>
// //             </div>
// //           </footer>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default AdminManagement;



