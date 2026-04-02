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

      <div className="overflow-x-auto">
        {/* min-w keeps columns readable — table scrolls horizontally on small screens */}
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-100">
            <tr>
              {/* REMOVED: avatar image column */}
              <th className="px-5 py-3">Applicant</th>
              <th className="px-5 py-3">Business Name</th>
              <th className="px-5 py-3">Business Type</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Submitted</th>
              <th className="px-5 py-3">Days Pending</th>
              <th className="px-5 py-3">Docs</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-gray-400">
                  No vendors to display.
                </td>
              </tr>
            ) : (
              vendors.map(vendor => (
                <tr
                  key={vendor.id}
                  onClick={() => onSelect(vendor)}
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedId === vendor.id ? "bg-teal-50/40" : ""}`}
                >
                  {/* Applicant name — no image */}
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{vendor.name}</p>
                      <p className="text-[10px] text-gray-400">{vendor.email || "—"}</p>
                    </div>
                  </td>
                  {/* Business name from onboarding */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.businessName || "—"}
                  </td>
                  {/* Business type: products | services */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessType || "—"}
                  </td>
                  {/* Business category: retail, hotels, etc */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap capitalize">
                    {vendor.businessCategory || vendor.business_category || "—"}
                  </td>

                  {/* Status badge */}
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase whitespace-nowrap ${
                      vendor.status === 'Approved' || vendor.status === 'Verified'
                        ? 'bg-green-50 text-green-600'
                        : vendor.status === 'Pending'
                        ? 'bg-yellow-50 text-yellow-600'
                        : vendor.status === 'Suspended'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                    {vendor.submitted || "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold ${(vendor.daysPending ?? 0) > 2 ? "text-red-500" : "text-gray-600"}`}>
                      {vendor.daysPending ?? "—"}d
                    </span>
                  </td>
                  {/* Document count with color indicator */}
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold ${(vendor.docsCount ?? 0) === 0 ? "text-red-400" : "text-green-600"}`}>
                      {vendor.docsCount ?? 0}/5
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={e => { e.stopPropagation(); onSelect(vendor); }}
                      className="text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <MoreHorizontal size={18} />
                    </button>
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