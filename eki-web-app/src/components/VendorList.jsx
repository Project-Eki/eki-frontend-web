import React from 'react';
import { Filter, Download, MoreHorizontal } from 'lucide-react';

const VendorList = ({ vendors, onSelect, selectedId }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="font-bold text-gray-800">Registered Vendors</h3>
          <p className="text-xs text-gray-500">Monitor and manage seller accounts and verification states.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600">
            <Filter size={14} /> Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* overflow-x-auto lets extra columns scroll horizontally on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Vendor Name</th>
              <th className="px-6 py-3">Status</th>
              {/* ADDED columns from onboarding data */}
              <th className="px-6 py-3">Account Type</th>
              <th className="px-6 py-3">Submitted</th>
              <th className="px-6 py-3">Days Pending</th>
              <th className="px-6 py-3">Docs</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                  No vendors to display.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  onClick={() => onSelect(vendor)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === vendor.id ? "bg-teal-50/40" : ""}`}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={vendor.avatar} className="h-8 w-8 rounded-full border border-gray-100 shrink-0" />
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{vendor.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                      vendor.status === 'Approved' || vendor.status === 'Verified'
                        ? 'bg-green-50 text-green-600'
                        : vendor.status === 'Pending'
                        ? 'bg-yellow-50 text-yellow-600'
                        : 'bg-red-50 text-red-500'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  {/* ADDED: account type from onboarding */}
                  <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">{vendor.type || "—"}</td>
                  {/* ADDED: submission date */}
                  <td className="px-6 py-4 text-xs text-gray-600 whitespace-nowrap">{vendor.submitted || "—"}</td>
                  {/* ADDED: days pending — highlight if waiting long */}
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${vendor.daysPending > 2 ? "text-red-500" : "text-gray-600"}`}>
                      {vendor.daysPending ?? "—"}d
                    </span>
                  </td>
                  {/* ADDED: documents submitted count */}
                  <td className="px-6 py-4 text-xs text-gray-600">{vendor.docsCount ?? "—"}</td>
                  <td className="px-6 py-4 text-gray-400 cursor-pointer hover:text-gray-600">
                    <MoreHorizontal size={18} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorList;




// import React from 'react';
// import { Filter, Download, MoreHorizontal } from 'lucide-react';

// const VendorList = ({ vendors }) => {
//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
//       <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
//         <div>
//           <h3 className="font-bold text-gray-800">Registered Vendors</h3>
//           <p className="text-xs text-gray-500">Monitor and manage seller accounts and verification states.</p>
//         </div>
//         <div className="flex gap-2">
//           <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600">
//             <Filter size={14} /> Filter
//           </button>
//           <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 text-gray-600">
//             <Download size={14} /> Export
//           </button>
//         </div>
//       </div>
//       <table className="w-full text-left">
//         <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
//           <tr>
//             <th className="px-6 py-3">Vendor Name</th>
//             <th className="px-6 py-3">Status</th>
//             <th className="px-6 py-3">Earnings</th>
//             <th className="px-6 py-3">Listings</th>
//             <th className="px-6 py-3">Actions</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-gray-100">
//           {vendors.map((vendor) => (
//             <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
//               <td className="px-6 py-4 flex items-center gap-3">
//                 <img src={vendor.avatar} className="h-8 w-8 rounded-full border border-gray-100" />
//                 <span className="text-xs font-semibold text-gray-700">{vendor.name}</span>
//               </td>
//               <td className="px-6 py-4">
//                 <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
//                   vendor.status === 'Verified' ? 'bg-green-50 text-green-600' :
//                   vendor.status === 'Pending' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-500'
//                 }`}>
//                   {vendor.status}
//                 </span>
//               </td>
//               <td className="px-6 py-4 text-xs font-medium text-gray-600">
//                 ${vendor.earnings.toLocaleString()}
//               </td>
//               <td className="px-6 py-4 text-xs font-medium text-gray-600">{vendor.listings}</td>
//               <td className="px-6 py-4 text-gray-400 cursor-pointer hover:text-gray-600">
//                 <MoreHorizontal size={18} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default VendorList;