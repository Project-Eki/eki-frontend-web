import React from 'react';
import { Mail, Ban, FileText, CheckCircle, Loader2 } from 'lucide-react';

const VendorProfile = ({ vendor, onApprove, onSuspend, actionLoading }) => {
  const isPending   = vendor.status === "Pending";
  const isApproved  = vendor.status === "Approved" || vendor.status === "Verified";
  const isSuspended = vendor.status === "Suspended";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-8 flex flex-col items-center text-center border-b border-gray-50">
        <div className="relative">
          <img src={vendor.avatar} className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm mb-4" />
          <span className={`absolute bottom-5 right-0 h-4 w-4 border-2 border-white rounded-full ${isApproved ? "bg-green-500" : isSuspended ? "bg-red-500" : "bg-yellow-400"}`} />
        </div>
        <h4 className="font-bold text-gray-800">{vendor.name}</h4>
        <p className="text-[10px] text-gray-500 mt-0.5">{vendor.type || "Seller Account"}</p>
        <p className="text-[10px] text-gray-400">Submitted: {vendor.submitted || "—"}</p>
        <span className={`mt-2 px-3 py-1 text-[10px] font-bold rounded-full uppercase border ${
          isApproved  ? "bg-green-50 text-green-600 border-green-100" :
          isSuspended ? "bg-red-50 text-red-500 border-red-100" :
                        "bg-yellow-50 text-yellow-600 border-yellow-100"
        }`}>
          {vendor.status}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Days Pending</p>
            <p className="text-sm font-bold text-[#234E4D]">{vendor.daysPending ?? "—"}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Docs Submitted</p>
            <p className="text-sm font-bold text-gray-800">{vendor.docsCount ?? "—"}</p>
          </div>
        </div>

        {/* Review Documents */}
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
          <FileText size={14} /> Review Documents
        </button>

        {/* Approve — only show when vendor is Pending */}
        {isPending && (
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {actionLoading
              ? <Loader2 size={14} className="animate-spin" />
              : <CheckCircle size={14} />
            }
            Approve Vendor
          </button>
        )}

        {/* Email + Suspend row */}
        <div className="flex gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50">
            <Mail size={14} /> Email
          </button>
          {/* Suspend — hide if already suspended */}
          {!isSuspended && (
            <button
              onClick={onSuspend}
              disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
              Suspend
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;



// import React from 'react';
// import { Mail, Ban, FileText } from 'lucide-react';

// const VendorProfile = ({ vendor }) => {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//       <div className="p-8 flex flex-col items-center text-center border-b border-gray-50">
//         <div className="relative">
//           <img src={vendor.avatar} className="h-20 w-20 rounded-full border-4 border-gray-50 shadow-sm mb-4" />
//           <span className="absolute bottom-5 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></span>
//         </div>
//         <h4 className="font-bold text-gray-800">{vendor.name}</h4>
//         <p className="text-[10px] text-gray-500">Member since 2023-05-12</p>
//         <span className="mt-2 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase border border-green-100">
//           {vendor.status}
//         </span>
//       </div>

//       <div className="p-6 space-y-6">
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-gray-50 p-3 rounded-lg text-center">
//             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Total Earnings</p>
//             <p className="text-sm font-bold text-[#234E4D]">${vendor.earnings.toLocaleString()}</p>
//           </div>
//           <div className="bg-gray-50 p-3 rounded-lg text-center">
//             <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Rating</p>
//             <p className="text-sm font-bold text-gray-800">4.8/5.0</p>
//           </div>
//         </div>

//         <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity shadow-sm">
//           <FileText size={14} /> Review Documents
//         </button>

//         <div className="flex gap-2">
//           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-[11px] font-bold text-gray-600 hover:bg-gray-50">
//             <Mail size={14} /> Email
//           </button>
//           <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-red-100 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50">
//             <Ban size={14} /> Suspend
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VendorProfile;