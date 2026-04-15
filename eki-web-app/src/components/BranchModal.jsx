import React from "react";
import { HiX } from "react-icons/hi";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-4 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-bold text-sm text-gray-800">
            {isEditing ? "Edit Branch Location" : "Add Branch Location"}
          </h4>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX size={16} />
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Street address"
              value={branchForm.address}
              onChange={(e) =>
                setBranchForm({ ...branchForm, address: e.target.value })
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="City"
              value={branchForm.city}
              onChange={(e) =>
                setBranchForm({ ...branchForm, city: e.target.value })
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Landmark <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Nearby landmark"
              value={branchForm.landmark}
              onChange={(e) =>
                setBranchForm({ ...branchForm, landmark: e.target.value })
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Phone <span className="text-gray-400">(Optional)</span>
            </label>
            <PhoneInput
              international
              defaultCountry="UG"
              value={branchForm.phone}
              onChange={(value) =>
                setBranchForm({ ...branchForm, phone: value || "" })
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px]"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 block">
              Hours <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mon-Fri 9am-5pm"
              value={branchForm.hours}
              onChange={(e) =>
                setBranchForm({ ...branchForm, hours: e.target.value })
              }
              className="w-full h-8 px-3 border border-gray-200 rounded-lg text-[11px] focus:border-[#F2B53D] outline-none"
            />
          </div>
        </div>

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