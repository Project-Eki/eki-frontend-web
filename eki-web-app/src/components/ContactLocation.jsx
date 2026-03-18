import React, { useState } from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { validateContactLocation } from "../utils/onboardingValidation";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import SearchableCountrySelector from "./SearchableCountrySelector";

const ContactLocation = () => {
  // 1. Connect to Global State and Dispatch
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [errors, setErrors] = useState({});
  // Removed isLoading because we aren't hitting the API in this step anymore

  const handleChange = (field, value) => {
    // 2. Update the Global Context immediately
    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: { [field]: value },
    });

    // Real-time validation against the new value
    const validationErrors = validateContactLocation({
      ...formData,
      [field]: value,
    });
    setErrors(validationErrors);
  };

  const handlePhoneChange = (value) => {
    // Value will be the E.164 formatted number (e.g., "+15551234567")
    handleChange("business_phone", value);
  };

  const handleContinue = () => {
    // 3. Final validation before moving to the last step
    const validationErrors = validateContactLocation(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // 4. Move to Step 5 locally
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  return (
    <div className="w-full animate-fadeIn pb-4">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineLocationMarker className="text-[#F2B53D]" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-gray-800 leading-tight">
            Contact & Location
          </h3>
          <p className="text-[12px] text-gray-500">
            How should customers and EKI reach you?
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        {/* Business Email */}
        <div className="flex flex-col">
          <label className="text-[12px] font-bold text-gray-600 mb-1 ml-1">
            Business Email
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.business_email || ""} // Use context value
              onChange={(e) => handleChange("business_email", e.target.value)}
              placeholder="contact@company.com"
              className={`w-full h-11 pl-4 pr-20 border ${errors.business_email ? "border-red-400" : "border-gray-200"} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`}
            />
            {errors.business_email && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.business_email}
              </span>
            )}
          </div>
        </div>

       {/* Business Phone */}
<div className="flex flex-col">
  <label className="text-[12px] font-bold text-gray-600 mb-1 ml-1 font-sans">
    Phone Number
  </label>
  <div
    className={`relative flex items-center h-11 border rounded-xl px-4 transition-all bg-white ${
      errors.business_phone ? "border-red-500 bg-red-50" : "border-gray-200 focus-within:border-[#F2B53D]"
    }`}
  >
    <PhoneInput
      international
      defaultCountry="UG"
      value={formData.business_phone}
      onChange={(val) => handleChange("business_phone", val)}
      // pr-16 ensures the numbers don't go under the "Required" text
      className="eki-phone-input flex-1 pr-16"
    />

    {/* PINPOINT ERROR INSIDE THE FIELD */}
    {errors.business_phone && (
      <span className="absolute right-4 text-red-500 text-[10px] font-bold pointer-events-none">
        {errors.business_phone}
      </span>
    )}
  </div>
</div>

        {/* Street Address */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-[12px] font-bold text-gray-600 mb-1 ml-1">
            Street Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Business Way, Suite 4"
              className={`w-full h-11 pl-4 pr-16 border ${errors.address ? "border-red-400" : "border-gray-200"} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`}
            />
            {errors.address && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.address}
              </span>
            )}
          </div>
        </div>

        {/* City */}
<div className="flex flex-col">
  <label className="text-[12px] font-bold text-gray-600 mb-1 ml-1">City</label>
  <div className="relative flex items-center">
    <input
      type="text"
      value={formData.city || ""}
      onChange={(e) => handleChange("city", e.target.value)}
      placeholder="e.g. Kampala"
      className={`w-full h-11 pl-4 pr-20 border ${errors.city ? "border-red-500 bg-red-50" : "border-gray-200"} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`}
    />
    {errors.city && (
      <span className="absolute right-4 text-red-500 text-[10px] font-bold pointer-events-none">
        {errors.city}
      </span>
    )}
  </div>
</div>

       {/* Country Selector Wrapper */}
<div className="relative flex flex-col">
  <SearchableCountrySelector
    value={formData.country}
    onChange={(val) => handleChange("country", val)}
    
  />
  {errors.country && (
    <span className="absolute right-10 top-[38px] text-red-500 text-[10px] font-bold pointer-events-none">
      Required
    </span>
  )}
</div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 w-full">
        <button
          onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
          className="flex-1 max-w-35 h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px]"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          className="flex-1 max-w-55 h-11 text-white font-bold rounded-full shadow-lg transition-all text-[14px] bg-[#F2B53D] hover:bg-[#e0a630]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ContactLocation;
