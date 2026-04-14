import React, { useState } from "react";
import { HiOutlineLocationMarker, HiOutlinePhone } from "react-icons/hi";
import { HiOutlineBuildingOffice, HiOutlineMapPin, HiOutlineHome, HiOutlineClock } from "react-icons/hi2";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { validateContactLocation } from "../utils/onboardingValidation";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import SearchableCountrySelector from "./SearchableCountrySelector";

// Reusable inline error tag
const InlineError = ({ message }) => (
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
    {message}
  </span>
);

const ContactLocation = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: { [field]: value },
    });
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateContactLocation({
      ...formData,
      [field]: value,
    });
    setErrors(validationErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateContactLocation(formData);
    setErrors(validationErrors);
  };

  const handlePhoneChange = (value) => {
    handleChange("business_phone", value || "");
  };

  const showError = (field) => touched[field] && errors[field];

  const handleContinue = () => {
    setTouched({
      business_phone: true,
      country: true,
      city: true,
      opening_time: true,
      closing_time: true,
    });

    const validationErrors = validateContactLocation(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* Header - Matching other steps */}
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineLocationMarker className="text-[#F2B53D]" size={14} />
        </div>
        <div>
          <h3 className="font-bold text-[12px] text-gray-800">Contact & Location</h3>
          <p className="text-[9px] text-gray-500">How should customers reach you?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-1.5">
        {/* Phone Number - Required */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Phone Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <PhoneInput
              international
              defaultCountry="UG"
              value={formData.business_phone}
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('business_phone')}
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none transition-all ${
                showError('business_phone') ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {showError('business_phone') && <InlineError message={errors.business_phone} />}
          </div>
        </div>

        {/* Country - Required - Using SearchableCountrySelector with inline error */}
        <div className="flex flex-col">
          <SearchableCountrySelector
            value={formData.country}
            onChange={(val) => handleChange("country", val)}
            error={showError('country') ? errors.country : ""}
            showInlineError={true}
          />
        </div>

        {/* City - Required */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">City <span className="text-red-500">*</span></label>
          <div className="relative">
            <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
              onBlur={() => handleBlur('city')}
              placeholder="e.g. Kampala"
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] ${
                showError('city')
                  ? 'border-red-400 placeholder:text-gray-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {showError('city') && <InlineError message={errors.city} />}
          </div>
        </div>

        {/* Street Address - Optional */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Street Address <span className="text-gray-400 text-[9px]">(Optional)</span></label>
          <div className="relative">
            <HiOutlineHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="123 Business Way, Suite 4"
              className="w-full h-8 pl-9 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Landmark - Optional */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Landmark <span className="text-gray-400 text-[9px]">(Optional)</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.landmark || ""}
              onChange={(e) => handleChange("landmark", e.target.value)}
              placeholder="e.g. Near City Mall"
              className="w-full h-8 pl-9 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Intersection - Optional */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Intersection <span className="text-gray-400 text-[9px]">(Optional)</span></label>
          <div className="relative">
            <HiOutlineMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.intersection || ""}
              onChange={(e) => handleChange("intersection", e.target.value)}
              placeholder="e.g. Kampala Rd & Jinja Rd"
              className="w-full h-8 pl-9 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Zip/Postal Code and Branch Location on same row */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Zip/Postal Code <span className="text-gray-400 text-[9px]">(Optional)</span></label>
          <div className="relative">
            <input
              type="text"
              value={formData.zip_code || ""}
              onChange={(e) => handleChange("zip_code", e.target.value)}
              placeholder="e.g. 256, 00100"
              className="w-full h-8 pl-3 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Branch Location <span className="text-gray-400 text-[9px]">(Optional)</span></label>
          <div className="relative">
            <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.branch_location || ""}
              onChange={(e) => handleChange("branch_location", e.target.value)}
              placeholder="e.g. Downtown, Mall"
              className="w-full h-8 pl-9 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Operating Hours Section - Full width */}
        <div className="flex flex-col md:col-span-2 mt-0">
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineClock className="text-[#F2B53D]" size={14} />
            <label className="text-[10px] font-semibold text-gray-700">Operating Hours</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Opening Time */}
            <div className="flex flex-col">
              <label className="text-[9px] font-semibold text-gray-600 mb-0.5 ml-1">Opening Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.opening_time || ""}
                  onChange={(e) => handleChange("opening_time", e.target.value)}
                  onBlur={() => handleBlur('opening_time')}
                  className={`w-full h-8 px-3 bg-white border rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] ${
                    showError('opening_time')
                      ? 'border-red-400'
                      : 'border-gray-200'
                  }`}
                />
                {showError('opening_time') && <InlineError message={errors.opening_time} />}
              </div>
            </div>

            {/* Closing Time */}
            <div className="flex flex-col">
              <label className="text-[9px] font-semibold text-gray-600 mb-0.5 ml-1">Closing Time <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="time"
                  value={formData.closing_time || ""}
                  onChange={(e) => handleChange("closing_time", e.target.value)}
                  onBlur={() => handleBlur('closing_time')}
                  className={`w-full h-8 px-3 bg-white border rounded-xl focus:outline-none text-[11px] focus:border-[#F2B53D] ${
                    showError('closing_time')
                      ? 'border-red-400'
                      : 'border-gray-200'
                  }`}
                />
                {showError('closing_time') && <InlineError message={errors.closing_time} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons - Matching other steps */}
      <div className="w-full flex justify-center items-center gap-2 mt-2">
        <button
          type="button"
          onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
          className="flex-1 max-w-[100px] h-7 rounded-full text-gray-500 font-semibold text-[11px] border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex-1 max-w-[120px] h-7 rounded-full text-white font-bold text-[11px] transition-all bg-[#D99201] hover:bg-[#e0a630]"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ContactLocation;