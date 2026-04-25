import React from "react";
import {
  Ban, Mail, Phone, MapPin, Calendar, User, AlertTriangle, CheckCircle, Loader2, XCircle
} from "lucide-react";

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
 *  buyer             — buyer data object
 *  onSuspend         — suspend the buyer
 *  onActivate        — activate the buyer
 *  onTerminate       — permanently terminate the buyer account
 *  actionLoading     — disables buttons during API calls
 */
const BuyerProfile = ({ buyer, onSuspend, onActivate, onTerminate, actionLoading }) => {
  const isActive = buyer.status === "Active";
  const isSuspended = buyer.status === "Suspended";
  const isInactive = buyer.status === "Inactive";

  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return null;
    const [day, month, year] = dob.split("/");
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(buyer.dateOfBirth);

  return (
    <div className="p-6 space-y-6">

      {/* Avatar + name + status */}
      <div className="flex items-center gap-4">
        {buyer.profilePicture ? (
          <img
            src={buyer.profilePicture}
            alt={buyer.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center shrink-0 border-2 border-teal-100">
            <span className="text-xl font-bold text-teal-600">{(buyer.name || "?")[0]?.toUpperCase()}</span>
          </div>
        )}
        <div>
          <h3 className="font-bold text-gray-900 text-base">{buyer.name}</h3>
          <p className="text-xs text-gray-500">{buyer.email || "—"}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{buyer.buyerId}</p>
          <span className={`mt-1.5 inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
            isActive    ? "bg-green-50 text-green-600 border-green-100" :
            isSuspended ? "bg-red-50 text-red-500 border-red-100" :
                          "bg-gray-100 text-gray-500 border-gray-100"
          }`}>
            {buyer.status}
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal Information</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={User} label="Full Name" value={buyer.name} />
          <InfoRow icon={Mail} label="Email Address" value={buyer.email} />
          <InfoRow icon={Phone} label="Phone Number" value={buyer.phoneNumber} />
          <InfoRow icon={Calendar} label="Date of Birth" value={buyer.dateOfBirth} />
          {age && <InfoRow icon={Calendar} label="Age" value={`${age} years`} />}
        </div>
      </div>

      {/* Address Information */}
      {buyer.address && (
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Address</h4>
          <div className="bg-gray-50 rounded-xl px-4 py-1">
            <InfoRow icon={MapPin} label="Address" value={buyer.address} />
            {buyer.city && <InfoRow icon={MapPin} label="City" value={buyer.city} />}
            {buyer.country && <InfoRow icon={MapPin} label="Country" value={buyer.country} />}
          </div>
        </div>
      )}

      {/* Account Information */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Account Information</h4>
        <div className="bg-gray-50 rounded-xl px-4 py-1">
          <InfoRow icon={Calendar} label="Joined Date" value={buyer.joinedDate} />
          <InfoRow icon={Calendar} label="Last Active" value={buyer.lastActive || "—"} />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-teal-50 p-3 rounded-xl text-center border border-teal-100">
          <p className="text-[9px] text-teal-600 font-bold uppercase mb-1">Total Orders</p>
          <p className="text-lg font-black text-teal-700">{buyer.totalOrders ?? "—"}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
          <p className="text-[9px] text-amber-600 font-bold uppercase mb-1">Total Spent</p>
          <p className="text-lg font-black text-amber-700">{buyer.totalSpent ? `$${buyer.totalSpent}` : "—"}</p>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="space-y-2 pt-2 border-t border-gray-100">

        {/* Activate — for suspended or inactive buyers */}
        {(isSuspended || isInactive) && (
          <button onClick={onActivate} disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50">
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Activate Account
          </button>
        )}

        <div className="flex gap-2 flex-wrap">
          {/* Suspend — active buyers only */}
          {isActive && (
            <button onClick={onSuspend} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2 border border-orange-200 rounded-xl text-[11px] font-bold text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50">
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Ban size={13} />}
              Suspend
            </button>
          )}

          {/* Terminate — always shown */}
          <button onClick={onTerminate} disabled={actionLoading}
            className={`${isActive ? "flex-1" : "w-full"} flex items-center justify-center gap-2 py-2 border border-red-200 rounded-xl text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50`}>
            <AlertTriangle size={13} />
            Terminate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerProfile;