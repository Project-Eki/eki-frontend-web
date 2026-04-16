import React, { useState, useEffect, useMemo } from 'react';
import { HiOutlineBriefcase, HiOutlineBuildingOffice, HiOutlineUser, HiOutlineIdentification, HiOutlineDocumentText, HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { FaRegBuilding, FaRegFileAlt } from "react-icons/fa";
import { validateBusinessIdentity } from "../utils/onboardingValidation";
import MessageAlert from './MessageAlert';
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

// Reusable inline error tag
const InlineError = ({ message }) => (
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
    {message}
  </span>
);

// Category options - MUST MATCH BACKEND BusinessCategory model EXACTLY
const getCategoryOptions = (businessType) => {
  // Product categories (from backend)
  const productCategories = [
    { value: "retail", label: "Retail" },
    { value: "fashion", label: "Fashion & Apparel" },
    { value: "electronics", label: "Electronics" },
    { value: "food", label: "Food & Beverages" },
    { value: "beauty", label: "Beauty & Health" },
    { value: "home", label: "Home & Garden" },
    { value: "sports", label: "Sports & Outdoors" },
    { value: "automotive", label: "Automotive" },
  ];

  // Service categories (from backend)
  const serviceCategories = [
    { value: "transport", label: "Transport" },
    { value: "tailoring", label: "Tailoring" },
    { value: "airlines", label: "Airlines" },
    { value: "hotels", label: "Hospitality" },
    { value: "beauty", label: "Beauty & Health" },
    { value: "other", label: "Other" },
  ];

  if (businessType === 'products') {
    return productCategories;
  } else if (businessType === 'services') {
    return serviceCategories;
  }
  
  // Return empty array until business type is selected
  return [];
};

const BusinessIdentity = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState("");

  const categoryOptions = useMemo(() => 
    getCategoryOptions(formData.business_type), 
    [formData.business_type]
  );

  useEffect(() => {
    if (!formData.owner_full_name && formData.first_name && formData.last_name) {
      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: {
          owner_full_name: `${formData.first_name} ${formData.last_name}`
        }
      });
    }
  }, [formData.first_name, formData.last_name, formData.owner_full_name, dispatch]);

  useEffect(() => {
    if (formData.business_type && formData.business_category) {
      const isValidCategory = categoryOptions.some(opt => opt.value === formData.business_category);
      if (!isValidCategory) {
        dispatch({
          type: ACTIONS.UPDATE_FORM,
          payload: { business_category: "" }
        });
      }
    }
  }, [formData.business_type, formData.business_category, categoryOptions, dispatch]);

  const handleChange = (field, value) => {
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { [field]: value } });
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateBusinessIdentity({ ...formData, [field]: value });
    setErrors(validationErrors);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const validationErrors = validateBusinessIdentity(formData);
    setErrors(validationErrors);
  };

  const handleContinue = () => {
    setGeneralError("");
    setTouched({
      business_name: true,
      business_category: true,
      business_type: true,
      owner_full_name: true,
      registration_number: true,
      tax_id: true,
    });
    const validationErrors = validateBusinessIdentity(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  const showError = (field) => touched[field] && errors[field];

  return (
    <div className="w-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineBriefcase className="text-[#F2B53D]" size={16} />
        </div>
        <div>
          <h3 className="font-bold text-[13px] text-gray-800">Business Identity</h3>
          <p className="text-[10px] text-gray-500">Legal details as on official documents</p>
        </div>
      </div>

      {generalError && <MessageAlert message={generalError} type="error" className="mb-2" />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
        {/* Legal Business Name */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Legal Business Name</label>
          <div className="relative">
            <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.business_name || ""}
              onChange={(e) => handleChange('business_name', e.target.value)}
              onBlur={() => handleBlur('business_name')}
              placeholder="e.g. Global Tech Solutions Ltd."
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] ${
                showError('business_name')
                  ? 'border-red-400 placeholder:text-gray-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {showError('business_name') && <InlineError message={errors.business_name} />}
          </div>
        </div>

        {/* Business Type */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Business Type</label>
          <div className="relative">
            <FaRegBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={11} />
            <select
              value={formData.business_type || ""}
              onChange={(e) => handleChange('business_type', e.target.value)}
              onBlur={() => handleBlur('business_type')}
              className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer appearance-none ${
                showError('business_type') ? 'border-red-400' : 'border-gray-200'
              }`}
            >
              <option value="">Select type</option>
              <option value="products">Products</option>
              <option value="services">Services</option>
              <option value="other">Other</option>
            </select>
            {showError('business_type') && <InlineError message={errors.business_type} />}
          </div>
        </div>

        {/* Business Category */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Business Category</label>
          <div className="relative">
            <HiOutlineClipboardDocumentList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <select
              value={formData.business_category || ""}
              onChange={(e) => handleChange('business_category', e.target.value)}
              onBlur={() => handleBlur('business_category')}
              disabled={!formData.business_type}
              className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer appearance-none ${
                  !formData.business_type ? 'bg-gray-50 text-gray-400' : ''
                } ${
                  showError('business_category') ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">{!formData.business_type ? "Select business type first" : "Select category"}</option>
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            {showError('business_category') && <InlineError message={errors.business_category} />}
          </div>
        </div>

        {/* Owner Full Name */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Owner Full Name</label>
          <div className="relative">
            <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.owner_full_name || ""}
              onChange={(e) => handleChange('owner_full_name', e.target.value)}
              onBlur={() => handleBlur('owner_full_name')}
              placeholder="First & Last name"
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] ${
                showError('owner_full_name')
                  ? 'border-red-400 placeholder:text-gray-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {showError('owner_full_name') && <InlineError message={errors.owner_full_name} />}
          </div>
        </div>

        {/* Registration Number */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Registration Number</label>
          <div className="relative">
            <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              value={formData.registration_number || ""}
              onChange={(e) => handleChange('registration_number', e.target.value)}
              onBlur={() => handleBlur('registration_number')}
              placeholder="e.g. BN123456 or CPR/2020/1234"
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] ${
                showError('registration_number')
                  ? 'border-red-400 placeholder:text-gray-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {showError('registration_number') && <InlineError message={errors.registration_number} />}
          </div>
        </div>

        {/* Tax ID */}
        <div className="flex flex-col">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Tax ID (TIN)</label>
          <div className="relative">
            <FaRegFileAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={11} />
            <input
              type="text"
              value={formData.tax_id || ""}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              onBlur={() => handleBlur('tax_id')}
              placeholder="e.g. 1234567890 or A123456789Z"
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] ${
                showError('tax_id')
                  ? 'border-red-400 placeholder:text-gray-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {showError('tax_id') && <InlineError message={errors.tax_id} />}
          </div>
        </div>

        {/* Business Description - Full width */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">Business Description</label>
          <div className="relative">
            <HiOutlineDocumentText className="absolute left-3 top-2.5 text-gray-400 z-10" size={12} />
            <textarea
              value={formData.business_description || ""}
              onChange={(e) => handleChange('business_description', e.target.value)}
              placeholder="Describe what you sell or your business mission..."
              className="w-full h-14 pl-9 pr-3 pt-2 border border-gray-200 rounded-xl text-[11px] focus:border-[#F2B53D] outline-none resize-none transition-all bg-white"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="w-full flex justify-center items-center gap-3 mt-3">
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

export default BusinessIdentity;