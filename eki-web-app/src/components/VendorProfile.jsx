import React from 'react';
import {
  Ban, FileText, CheckCircle, Loader2, User,
  Phone, MapPin, Clock, Hash, Building2, AlertTriangle
} from 'lucide-react';

const DocRow = ({ label, hasDoc }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-600">{label}</span>
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasDoc ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
      {hasDoc ? "Submitted" : "Missing"}
    </span>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
    <Icon size={13} className="text-gray-400 mt-0.5 shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xs text-gray-700 font-medium mt-0.5 break-words">{value || "—"}</p>
    </div>
  </div>
);

// VendorProfile
//
// Props:
//   vendor           — vendor data object
//   onApprove        — called when Approve is clicked
//   onSuspend        — called when Suspend is clicked
//   onReviewDocuments — NEW: opens the DocumentReviewModal in parent
//   onTerminate      — NEW: opens the TerminateVendorModal in parent
//   actionLoading    — disables buttons during API calls
const VendorProfile = ({ vendor, onApprove, onSuspend, onReviewDocuments, onTerminate, actionLoading }) => {
  const isPending   = vendor.status === "Pending" || vendor.status === "under_review";
  const isApproved  = vendor.status === "Approved" || vendor.status === "Verified";
  const isSuspended = vendor.status === "Suspended";

  const docList = [
    { label: "Government Issued ID",      has: vendor.hasGovId     },
    { label: "Country Issued ID",         has: vendor.hasCountryId },
    { label: "Business License",          has: vendor.hasLicense   },
    { label: "Tax Certificate",           has: vendor.hasTaxCert   },
    { label: "Incorporation Certificate", has: vendor.hasIncCert   },
  ];
  const submittedCount = docList.filter(d => d.has).length;

  return (
    <div className="p-6 space-y-6">

      {/* Avatar + name + status */}
      <div className="flex items-center gap-4">
        {vendor.profilePicture ? (
          <img src={vendor.profilePicture} alt={vendor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"/>
        ) : (
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border-2 border-teal-100">
            <span className="text-xl font-bold text-teal-600">{(vendor.name || "?")[0].toUpperCase()}</span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900 text-base">{vendor.name}</h3>
          <p className="text-xs text-gray-500">{vendor.email || "—"}</p>
          <span className={`mt-1.5 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
            isApproved  ? "bg-green-50 text-green-600 border-green-100" :
            isSuspended ? "bg-red-50 text-red-500 border-red-100" :
                          "bg-yellow-50 text-yellow-600 border-yellow-100"
          }`}>{vendor.status}</span>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Information</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={Building2} label="Business Name"    value={vendor.businessName}    />
          <InfoRow icon={FileText}  label="Business Type"    value={vendor.businessType}    />
          <InfoRow icon={Hash}      label="Category"         value={vendor.businessCategory}/>
          <InfoRow icon={Phone}     label="Business Phone"   value={vendor.businessPhone}   />
          {/* FIX: removed Mail row since we removed the Email button — consistency */}
          <InfoRow icon={Hash}      label="Registration No." value={vendor.registrationNo}  />
          <InfoRow icon={Hash}      label="Tax ID (TIN)"     value={vendor.taxId}           />
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={MapPin} label="Address" value={vendor.address}/>
          <InfoRow icon={MapPin} label="City"    value={vendor.city}   />
          <InfoRow icon={MapPin} label="Country" value={vendor.country}/>
        </div>
      </div>

      {/* Operating Hours */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Operating Hours</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={Clock} label="Opens"  value={vendor.openingTime}/>
          <InfoRow icon={Clock} label="Closes" value={vendor.closingTime}/>
        </div>
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documents</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            submittedCount === 5 ? "bg-green-50 text-green-600" :
            submittedCount > 0  ? "bg-amber-50 text-amber-600" :
                                   "bg-red-50 text-red-500"
          }`}>{submittedCount}/5 submitted</span>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          {docList.map(d => <DocRow key={d.label} label={d.label} hasDoc={d.has}/>)}
        </div>

        {/* Review Documents — now opens the DocumentReviewModal in AdminManagement */}
        <button
          onClick={onReviewDocuments}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <FileText size={14}/> Review Documents ({submittedCount}/5)
        </button>
      </div>

      {/* Days pending row */}
      {isPending && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
            <p className="text-[9px] text-amber-600 font-bold uppercase mb-1">Days Pending</p>
            <p className="text-lg font-black text-amber-700">{vendor.daysPending ?? "—"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Submitted</p>
            <p className="text-xs font-bold text-gray-700">{vendor.submitted || "—"}</p>
          </div>
        </div>
      )}

      {/* ── ACTION BUTTONS ──
      */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        {/* Approve — only for pending/under_review */}
        {isPending && (
          <button onClick={onApprove} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
            Approve Vendor
          </button>
        )}

        {/* Reinstate — only for suspended */}
        {isSuspended && (
          <button onClick={onApprove} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
            Reinstate Vendor
          </button>
        )}

        <div className="flex gap-2">
          {/* Suspend — shown when not already suspended */}
          {!isSuspended && (
            <button onClick={onSuspend} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-orange-100 rounded-xl text-[11px] font-bold text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50">
              {actionLoading ? <Loader2 size={13} className="animate-spin"/> : <Ban size={13}/>}
              Suspend
            </button>
          )}

          {/* Terminate — always shown, opens confirmation modal */}
          {/* This is a destructive action — it requires the admin to type TERMINATE */}
          <button onClick={onTerminate} disabled={actionLoading}
            className={`${!isSuspended ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 py-2 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50`}>
            <AlertTriangle size={13}/>
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;




// import React from 'react';
// import { Mail, Ban, FileText, CheckCircle, Loader2, User,
//          Phone, MapPin, Clock, Hash, Building2 } from 'lucide-react';

// // Document status row component
// const DocRow = ({ label, hasDoc }) => (
//   <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
//     <span className="text-xs text-gray-600">{label}</span>
//     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
//       hasDoc ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
//     }`}>
//       {hasDoc ? "Submitted" : "Missing"}
//     </span>
//   </div>
// );

// // Info row component
// const InfoRow = ({ icon: Icon, label, value }) => (
//   <div className="flex items-start gap-2.5 py-2 border-b border-gray-50 last:border-0">
//     <Icon size={13} className="text-gray-400 mt-0.5 shrink-0" />
//     <div className="flex-1 min-w-0">
//       <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
//       <p className="text-xs text-gray-700 font-medium mt-0.5 break-words">{value || "—"}</p>
//     </div>
//   </div>
// );

// const VendorProfile = ({ vendor, onApprove, onSuspend, actionLoading }) => {
//   const isPending   = vendor.status === "Pending";
//   const isApproved  = vendor.status === "Approved" || vendor.status === "Verified";
//   const isSuspended = vendor.status === "Suspended";

//   // Count how many documents were submitted
//   const docList = [
//     { label: "Government Issued ID",      has: vendor.hasGovId    },
//     { label: "Country Issued ID",         has: vendor.hasCountryId},
//     { label: "Business License",          has: vendor.hasLicense  },
//     { label: "Tax Certificate",           has: vendor.hasTaxCert  },
//     { label: "Incorporation Certificate", has: vendor.hasIncCert  },
//   ];
//   const submittedCount = docList.filter(d => d.has).length;

//   return (
//     <div className="p-6 space-y-6">

//       {/* ── Top: Avatar + name + status ── */}
//       <div className="flex items-center gap-4">
//         {/* Profile picture from vendor profile API, fallback to initials */}
//         {vendor.profilePicture ? (
//           <img
//             src={vendor.profilePicture}
//             alt={vendor.name}
//             className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"
//           />
//         ) : (
//           <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border-2 border-teal-100">
//             <span className="text-xl font-bold text-teal-600">
//               {(vendor.name || "?")[0].toUpperCase()}
//             </span>
//           </div>
//         )}
//         <div>
//           <h3 className="font-bold text-gray-900 text-base">{vendor.name}</h3>
//           <p className="text-xs text-gray-500">{vendor.email || "—"}</p>
//           <span className={`mt-1.5 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
//             isApproved  ? "bg-green-50 text-green-600 border-green-100" :
//             isSuspended ? "bg-red-50 text-red-500 border-red-100" :
//                           "bg-yellow-50 text-yellow-600 border-yellow-100"
//           }`}>
//             {vendor.status}
//           </span>
//         </div>
//       </div>

//       {/* ── Business Information — from onboarding steps ── */}
//       <div>
//         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
//           Business Information
//         </h4>
//         <div className="bg-gray-50 rounded-xl px-4 py-1">
//           <InfoRow icon={Building2} label="Business Name"     value={vendor.businessName}     />
//           <InfoRow icon={FileText}  label="Business Type"     value={vendor.businessType}     />
//           <InfoRow icon={Hash}      label="Category"          value={vendor.businessCategory}  />
//           <InfoRow icon={Phone}     label="Business Phone"    value={vendor.businessPhone}     />
//           <InfoRow icon={Mail}      label="Business Email"    value={vendor.businessEmail}     />
//           <InfoRow icon={Hash}      label="Registration No."  value={vendor.registrationNo}    />
//           <InfoRow icon={Hash}      label="Tax ID (TIN)"      value={vendor.taxId}             />
//         </div>
//       </div>

//       {/* ── Location — from onboarding step 4 ── */}
//       <div>
//         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
//           Location
//         </h4>
//         <div className="bg-gray-50 rounded-xl px-4 py-1">
//           <InfoRow icon={MapPin} label="Address"  value={vendor.address} />
//           <InfoRow icon={MapPin} label="City"     value={vendor.city}    />
//           <InfoRow icon={MapPin} label="Country"  value={vendor.country} />
//         </div>
//       </div>

//       {/* ── Operating Hours ── */}
//       <div>
//         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
//           Operating Hours
//         </h4>
//         <div className="bg-gray-50 rounded-xl px-4 py-1">
//           <InfoRow icon={Clock} label="Opens"  value={vendor.openingTime} />
//           <InfoRow icon={Clock} label="Closes" value={vendor.closingTime} />
//         </div>
//       </div>

//       {/* ── Submitted Documents — from onboarding step 5 ── */}
//       <div>
//         <div className="flex items-center justify-between mb-3">
//           <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
//             Documents
//           </h4>
//           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
//             submittedCount === 5 ? "bg-green-50 text-green-600" :
//             submittedCount > 0  ? "bg-amber-50 text-amber-600"  :
//                                    "bg-red-50 text-red-500"
//           }`}>
//             {submittedCount}/5 submitted
//           </span>
//         </div>
//         <div className="bg-gray-50 rounded-xl px-4 py-1">
//           {docList.map(d => (
//             <DocRow key={d.label} label={d.label} hasDoc={d.has} />
//           ))}
//         </div>
//         {/* Review Documents button — now opens a descriptive view */}
//         {/* When backend adds document URLs, replace this alert with a download/preview */}
//         <button
//           onClick={() => alert(
//             `Documents for ${vendor.name}:\n\n` +
//             docList.map(d => `${d.has ? "✓" : "✗"} ${d.label}`).join("\n") +
//             `\n\n${submittedCount}/5 documents submitted.\n\nFull document viewing requires the backend to provide document URLs.`
//           )}
//           className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
//         >
//           <FileText size={14} /> Review Documents ({submittedCount}/5)
//         </button>
//       </div>

//       {/* ── Pending: days + approval deadline ── */}
//       {isPending && (
//         <div className="grid grid-cols-2 gap-3">
//           <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
//             <p className="text-[9px] text-amber-600 font-bold uppercase mb-1">Days Pending</p>
//             <p className="text-lg font-black text-amber-700">{vendor.daysPending ?? "—"}</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-xl text-center">
//             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Submitted</p>
//             <p className="text-xs font-bold text-gray-700">{vendor.submitted || "—"}</p>
//           </div>
//         </div>
//       )}

//       {/* ── Action Buttons ── */}
//       <div className="space-y-2 pt-2 border-t border-gray-100">
//         {isPending && (
//           <button
//             onClick={onApprove}
//             disabled={actionLoading}
//             className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
//           >
//             {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
//             Approve Vendor
//           </button>
//         )}

//         <div className="flex gap-2">
//           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">
//             <Mail size={13} /> Email Vendor
//           </button>
//           {!isSuspended && (
//             <button
//               onClick={onSuspend}
//               disabled={actionLoading}
//               className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-xl text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
//             >
//               {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
//               Suspend
//             </button>
//           )}
//           {isSuspended && (
//             <button
//               onClick={onApprove}
//               disabled={actionLoading}
//               className="flex-1 flex items-center justify-center gap-2 py-2 border border-green-100 rounded-xl text-[11px] font-bold text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
//             >
//               {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
//               Reinstate
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorProfile;



// import React from 'react';
// import { Mail, Ban, FileText, CheckCircle, Loader2 } from 'lucide-react';

// const VendorProfile = ({ vendor, onApprove, onSuspend, actionLoading }) => {
//   const isPending   = vendor.status === "Pending";
//   const isApproved  = vendor.status === "Approved" || vendor.status === "Verified";
//   const isSuspended = vendor.status === "Suspended";

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       <div className="p-8 flex flex-col items-center text-center border-b border-gray-50">
//         <div className="relative">
//           <img src={vendor.avatar} className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm mb-4" />
//           <span className={`absolute bottom-5 right-0 h-4 w-4 border-2 border-white rounded-full ${isApproved ? "bg-green-500" : isSuspended ? "bg-red-500" : "bg-yellow-400"}`} />
//         </div>
//         <h4 className="font-bold text-gray-800">{vendor.name}</h4>
//         <p className="text-[10px] text-gray-500 mt-0.5">{vendor.type || "Seller Account"}</p>
//         <p className="text-[10px] text-gray-400">Submitted: {vendor.submitted || "—"}</p>
//         <span className={`mt-2 px-3 py-1 text-[10px] font-bold rounded-full uppercase border ${
//           isApproved  ? "bg-green-50 text-green-600 border-green-100" :
//           isSuspended ? "bg-red-50 text-red-500 border-red-100" :
//                         "bg-yellow-50 text-yellow-600 border-yellow-100"
//         }`}>
//           {vendor.status}
//         </span>
//       </div>

//       <div className="p-6 space-y-4">
//         {/* Stats row */}
//         <div className="grid grid-cols-2 gap-3">
//           <div className="bg-gray-50 p-3 rounded-lg text-center">
//             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Days Pending</p>
//             <p className="text-sm font-bold text-[#234E4D]">{vendor.daysPending ?? "—"}</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg text-center">
//             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Docs Submitted</p>
//             <p className="text-sm font-bold text-gray-800">{vendor.docsCount ?? "—"}</p>
//           </div>
//         </div>

//         {/* Review Documents */}
//         <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
//           <FileText size={14} /> Review Documents
//         </button>

//         {/* Approve — only show when vendor is Pending */}
//         {isPending && (
//           <button
//             onClick={onApprove}
//             disabled={actionLoading}
//             className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//           >
//             {actionLoading
//               ? <Loader2 size={14} className="animate-spin" />
//               : <CheckCircle size={14} />
//             }
//             Approve Vendor
//           </button>
//         )}

//         {/* Email + Suspend row */}
//         <div className="flex gap-2">
//           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50">
//             <Mail size={14} /> Email
//           </button>
//           {/* Suspend — hide if already suspended */}
//           {!isSuspended && (
//             <button
//               onClick={onSuspend}
//               disabled={actionLoading}
//               className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
//             >
//               {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
//               Suspend
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorProfile;



// // import React from 'react';
// // import { Mail, Ban, FileText } from 'lucide-react';

// // const VendorProfile = ({ vendor }) => {
// //   return (
// //     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
// //       <div className="p-8 flex flex-col items-center text-center border-b border-gray-50">
// //         <div className="relative">
// //           <img src={vendor.avatar} className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm mb-4" />
// //           <span className="absolute bottom-5 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></span>
// //         </div>
// //         <h4 className="font-bold text-gray-800">{vendor.name}</h4>
// //         <p className="text-[10px] text-gray-500">Member since 2023-05-12</p>
// //         <span className="mt-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase border border-green-100">
// //           {vendor.status}
// //         </span>
// //       </div>

// //       <div className="p-6 space-y-6">
// //         <div className="grid grid-cols-2 gap-4">
// //           <div className="bg-gray-50 p-3 rounded-lg text-center">
// //             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Total Earnings</p>
// //             <p className="text-sm font-bold text-[#234E4D]">${vendor.earnings.toLocaleString()}</p>
// //           </div>
// //           <div className="bg-gray-50 p-3 rounded-lg text-center">
// //             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Rating</p>
// //             <p className="text-sm font-bold text-gray-800">4.8/5.0</p>
// //           </div>
// //         </div>

// //         <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
// //           <FileText size={14} /> Review Documents
// //         </button>

// //         <div className="flex gap-2">
// //           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50">
// //             <Mail size={14} /> Email
// //           </button>
// //           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50">
// //             <Ban size={14} /> Suspend
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default VendorProfile;