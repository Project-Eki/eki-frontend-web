/**
 * VendorProfile.jsx
 *
 * Changes:
 *  - onReject prop added — opens RejectVendorModal in parent (AdminManagement)
 *  - Reject button shown for Pending vendors alongside Approve
 *  - Profile picture URL is now resolved by parent (AdminManagement passes resolvedUrl)
 *  - Documents match exactly what vendors upload in OperationCompliance
 *  - Documents: Government ID, Business License, Tax Certificate, Incorporation Certificate
 *  - Professional Certification is optional (shown but not required)
 *  - All other props/display unchanged
 */

import React from "react";
import {
  Ban, FileText, CheckCircle, Loader2,
  Phone, MapPin, Clock, Hash, Building2, AlertTriangle, XCircle,
} from "lucide-react";

const DocRow = ({ label, hasDoc, isOptional = false }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-xs text-gray-600">
      {label}
      {isOptional && <span className="text-[9px] text-gray-400 ml-1">(Optional)</span>}
    </span>
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      hasDoc ? "bg-green-50 text-green-600" : isOptional ? "bg-gray-100 text-gray-400" : "bg-red-50 text-red-500"
    }`}>
      {hasDoc ? "Submitted" : isOptional ? "Not Uploaded" : "Missing"}
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

/**
 * Props:
 *  vendor            — vendor data object
 *  onApprove         — approve the vendor
 *  onSuspend         — suspend the vendor
 *  onReject          — NEW: open rejection modal (requires a reason)
 *  onReviewDocuments — open DocumentReviewModal in parent
 *  onTerminate       — open TerminateVendorModal in parent
 *  actionLoading     — disables buttons during API calls
 */
const VendorProfile = ({ vendor, onApprove, onSuspend, onReject, onReviewDocuments, onTerminate, onReinstate, actionLoading }) => {
  const isPending   = vendor.status === "Pending"   || vendor.status === "under_review";
  const isApproved  = vendor.status === "Approved"  || vendor.status === "Verified";
  const isSuspended = vendor.status === "Suspended";
  const isRejected  = vendor.status === "Rejected";

  // Documents matching OperationCompliance component
  const docList = [
    { label: "Government Issued ID",      has: vendor.hasGovId,     isOptional: false },
    { label: "Business License",          has: vendor.hasLicense,   isOptional: false },
    { label: "Tax Certificate",           has: vendor.hasTaxCert,   isOptional: false },
    { label: "Incorporation Certificate", has: vendor.hasIncCert,   isOptional: false },
    { label: "Professional Certification", has: vendor.hasProfCert, isOptional: true },
  ];
  
  const requiredDocs = docList.filter(d => !d.isOptional);
  const submittedCount = docList.filter((d) => d.has).length;
  const requiredSubmittedCount = requiredDocs.filter((d) => d.has).length;
  const totalRequired = requiredDocs.length;

  return (
    <div className="p-6 space-y-6">

      {/* Avatar + name + status */}
      <div className="flex items-center gap-4">
        {vendor.profilePicture ? (
          <img
            src={vendor.profilePicture}
            alt={vendor.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"
            onError={(e) => {
              console.error("Failed to load image:", vendor.profilePicture);
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              const fallback = document.createElement('div');
              fallback.className = "w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border-2 border-teal-100";
              fallback.innerHTML = `<span class="text-xl font-bold text-teal-600">${(vendor.name || "?")[0].toUpperCase()}</span>`;
              parent.appendChild(fallback);
            }}
          />
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
            isSuspended ? "bg-red-50 text-red-500 border-red-100"      :
            isRejected  ? "bg-rose-50 text-rose-500 border-rose-100"   :
                          "bg-yellow-50 text-yellow-600 border-yellow-100"
          }`}>
            {vendor.status}
          </span>
        </div>
      </div>

      {/* Business Information */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Business Information</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={Building2} label="Business Name"     value={vendor.businessName}     />
          <InfoRow icon={FileText}  label="Business Type"     value={vendor.businessType}     />
          <InfoRow icon={Hash}      label="Category"          value={vendor.businessCategory} />
          <InfoRow icon={Phone}     label="Business Phone"    value={vendor.businessPhone}    />
          <InfoRow icon={Hash}      label="Registration No."  value={vendor.registrationNo}   />
          <InfoRow icon={Hash}      label="Tax ID (TIN)"      value={vendor.taxId}            />
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={MapPin} label="Address" value={vendor.address} />
          <InfoRow icon={MapPin} label="City"    value={vendor.city}    />
          <InfoRow icon={MapPin} label="Country" value={vendor.country} />
        </div>
      </div>

      {/* Operating Hours */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Operating Hours</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={Clock} label="Opens"  value={vendor.openingTime} />
          <InfoRow icon={Clock} label="Closes" value={vendor.closingTime} />
        </div>
      </div>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Documents</h4>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            requiredSubmittedCount === totalRequired ? "bg-green-50 text-green-600" :
            requiredSubmittedCount > 0  ? "bg-amber-50 text-amber-600" :
                                         "bg-red-50 text-red-500"
          }`}>
            {requiredSubmittedCount}/{totalRequired} required submitted | {submittedCount} total
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          {docList.map((d) => <DocRow key={d.label} label={d.label} hasDoc={d.has} isOptional={d.isOptional} />)}
        </div>
        <button
          onClick={onReviewDocuments}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 bg-[#234E4D] text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <FileText size={14} /> Review Documents ({submittedCount} total)
        </button>
      </div>

      {/* Days pending */}
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

      {/* ── Action Buttons ── */}
      <div className="space-y-2 pt-2 border-t border-gray-100">

        {/* Approve — pending vendors */}
        {isPending && (
          <button onClick={onApprove} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Approve Vendor
          </button>
        )}

        {/* Reinstate — suspended vendors */}
        {isSuspended && (
          <button onClick={onReinstate} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Reinstate Vendor
          </button>
        )}

        <div className="flex gap-2 flex-wrap">
          {/* Reject — pending vendors only */}
          {isPending && (
            <button onClick={onReject} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-yellow-200 rounded-xl text-[11px] font-bold text-yellow-600 hover:bg-yellow-50 transition-colors disabled:opacity-50">
              <XCircle size={13} />
              Reject
            </button>
          )}

          {/* Suspend — when not already suspended */}
          {!isSuspended && (
            <button onClick={onSuspend} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-orange-100 rounded-xl text-[11px] font-bold text-orange-500 hover:bg-orange-50 transition-colors disabled:opacity-50">
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
              Suspend
            </button>
          )}

          {/* Terminate — always shown */}
          <button onClick={onTerminate} disabled={actionLoading}
            className={`${(!isSuspended || isPending) ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-2 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50`}>
            <AlertTriangle size={13} />
            Terminate
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;