import React from "react";
import { HiX } from "react-icons/hi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

// Reuse the same autocomplete components from ContactLocation
import AddressAutocomplete from "./AddressAutocomplete";
import SearchableCitySelector from "./SearchableCitySelector";
import SearchableCountrySelector from "./SearchableCountrySelector";

const BranchModal = ({
  isOpen,
  onClose,
  branchForm,
  setBranchForm,
  onSave,
  isEditing,
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    if (!branchForm.address || !branchForm.city) {
      alert("Address and City are required");
      return;
    }
    onSave();
  };

  // When the user picks an address from the OSM autocomplete,
  // auto-fill city if it's empty (same behaviour as ContactLocation)
  const handleAddressParsed = ({ city, country }) => {
    if (city && !branchForm.city) {
      setBranchForm((prev) => ({ ...prev, city }));
    }
    // Auto-fill country if provided and not already set
    if (country && !branchForm.country) {
      setBranchForm((prev) => ({ ...prev, country }));
    }
  };

  // Handle country change - reset city when country changes
  const handleCountryChange = (countryValue) => {
    setBranchForm((prev) => ({ 
      ...prev, 
      country: countryValue,
      // Reset city when country changes to avoid invalid city-country pairs
      city: ""
    }));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-4 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-sm text-gray-800">
            {isEditing ? "Edit Branch Location" : "Add Branch Location"}
          </h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <HiX size={16} />
          </button>
        </div>

        <div className="space-y-2">
          {/* ── Country Selector (NEW - same as ContactLocation) ── */}
          <SearchableCountrySelector
            value={branchForm.country || ""}
            onChange={handleCountryChange}
            error=""
            showInlineError={false}
          />

          {/* ── Address — OSM autocomplete (same as ContactLocation) ── */}
          <div>
            <AddressAutocomplete
              value={branchForm.address}
              onChange={(val) =>
                setBranchForm((prev) => ({ ...prev, address: val }))
              }
              onAddressParsed={handleAddressParsed}
              error={null}
            />
          </div>

          {/* ── City — searchable dropdown (same as ContactLocation) ── */}
          {/* Pass the country from the branch form if available,
              otherwise leave it undefined so the selector shows all cities */}
          <div>
            <SearchableCitySelector
              countryCode={branchForm.country || undefined}
              value={branchForm.city || ""}
              onChange={(val) =>
                setBranchForm((prev) => ({ ...prev, city: val }))
              }
              error=""
            />
          </div>

          {/* ── Landmark (optional) ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Landmark <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Nearby landmark"
              value={branchForm.landmark}
              onChange={(e) =>
                setBranchForm((prev) => ({ ...prev, landmark: e.target.value }))
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>

          {/* ── Phone (optional) ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Phone <span className="text-gray-400">(Optional)</span>
            </label>
            <PhoneInput
              international
              defaultCountry="UG"
              value={branchForm.phone}
              onChange={(value) =>
                setBranchForm((prev) => ({ ...prev, phone: value || "" }))
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px]"
            />
          </div>

          {/* ── Hours (optional) ── */}
          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Hours <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mon-Fri 9am-5pm"
              value={branchForm.hours}
              onChange={(e) =>
                setBranchForm((prev) => ({ ...prev, hours: e.target.value }))
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-7 rounded-full text-gray-500 text-[11px] border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!branchForm.address || !branchForm.city}
            className={`flex-1 h-7 rounded-full text-white text-[11px] font-bold transition-all ${
              !branchForm.address || !branchForm.city
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#D99201] hover:bg-[#e0a630]"
            }`}
          >
            {isEditing ? "Update Branch" : "Add Branch"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchModal;