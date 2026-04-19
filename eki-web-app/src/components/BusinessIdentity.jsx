import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HiOutlineBriefcase, HiOutlineBuildingOffice, HiOutlineUser, HiOutlineIdentification, HiOutlineDocumentText, HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { FaRegBuilding, FaRegFileAlt } from "react-icons/fa";
import { MdWarning, MdError, MdCheckCircle, MdClose } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { validateBusinessIdentity } from "../utils/onboardingValidation";
import MessageAlert from './MessageAlert';
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

// Reusable inline error tag
const InlineError = ({ message }) => (
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
    {message}
  </span>
);

// Toast notification component with React Icons
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideIn">
      <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-xs">
        <MdError size={14} className="text-white" />
        {message}
        <button onClick={onClose} className="ml-2 hover:text-gray-200">
          <MdClose size={14} />
        </button>
      </div>
    </div>
  );
};

// Category options
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

  if (businessType === "products") {
    return productCategories;
  } else if (businessType === "services") {
    return serviceCategories;
  } else if (businessType === "both") {
    // For "both" vendors, combine all categories
    const allCategories = [...productCategories];
    serviceCategories.forEach((cat) => {
      if (!allCategories.some((c) => c.value === cat.value)) {
        allCategories.push(cat);
      }
    });
    return allCategories;
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
  const [showToast, setShowToast] = useState(false);

  const categoryOptions = useMemo(() => 
    getCategoryOptions(formData.business_type), 
    [formData.business_type]
  );

  // Memoized word count calculation for performance
  const wordCount = useMemo(() => {
    return (formData.business_description || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [formData.business_description]);

  // Auto-populate owner_full_name from first_name and last_name
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

  // Reset business category if it becomes invalid when business type changes
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

  // Enhanced handleChange with word limit enforcement
  const handleChange = (field, value) => {
    // Special handling for business_description to enforce word limit
    if (field === 'business_description') {
      const words = value.trim().split(/\s+/).filter(Boolean);
      
      // Prevent exceeding 30 words
      if (words.length > 30) {
        // Show toast notification instead of inline error
        setShowToast(true);
        return;
      }
      
      // Clear toast if it was shown
      if (showToast) setShowToast(false);
    }
    
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { [field]: value } });
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Real-time validation
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
    
    // Mark all fields as touched
    setTouched({
      business_name: true,
      business_category: true,
      business_type: true,
      owner_full_name: true,
      registration_number: true,
      tax_id: true,
      business_description: true,
    });
    
    const validationErrors = validateBusinessIdentity(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      dispatch({ type: ACTIONS.NEXT_STEP });
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const showError = (field) => touched[field] && errors[field];

  return (
    <>
      {/* Toast notification */}
      {showToast && (
        <Toast message="Business description cannot exceed 30 words" onClose={() => setShowToast(false)} />
      )}

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
          <div className="flex flex-col" data-field="business_name">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Legal Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineBuildingOffice className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
              <input
                type="text"
                value={formData.business_name || ""}
                onChange={(e) => handleChange('business_name', e.target.value)}
                onBlur={() => handleBlur('business_name')}
                placeholder="e.g. Global Tech Solutions Ltd."
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError('business_name')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#F2B53D]'
                }`}
              />
              {showError('business_name') && <InlineError message={errors.business_name} />}
            </div>
          </div>

          {/* Business Type */}
          <div className="flex flex-col" data-field="business_type">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaRegBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={11} />
              <select
                value={formData.business_type || ""}
                onChange={(e) => handleChange('business_type', e.target.value)}
                onBlur={() => handleBlur('business_type')}
                className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer appearance-none transition-colors ${
                  showError('business_type') ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Select business type</option>
                <option value="products">Products</option>
                <option value="services">Services</option>
                <option value="both">Both</option>
              </select>
              {showError('business_type') && <InlineError message={errors.business_type} />}
            </div>
          </div>

          {/* Business Category */}
          <div className="flex flex-col" data-field="business_category">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineClipboardDocumentList className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
              <select
                value={formData.business_category || ""}
                onChange={(e) => handleChange('business_category', e.target.value)}
                onBlur={() => handleBlur('business_category')}
                disabled={!formData.business_type}
                className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none cursor-pointer appearance-none transition-colors ${
                    !formData.business_type ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white'
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
          <div className="flex flex-col" data-field="owner_full_name">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Owner Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
              <input
                type="text"
                value={formData.owner_full_name || ""}
                onChange={(e) => handleChange('owner_full_name', e.target.value)}
                onBlur={() => handleBlur('owner_full_name')}
                placeholder="First & Last name"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError('owner_full_name')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#F2B53D]'
                }`}
              />
              {showError('owner_full_name') && <InlineError message={errors.owner_full_name} />}
            </div>
          </div>

          {/* Registration Number */}
          <div className="flex flex-col" data-field="registration_number">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
              <input
                type="text"
                value={formData.registration_number || ""}
                onChange={(e) => handleChange('registration_number', e.target.value)}
                onBlur={() => handleBlur('registration_number')}
                placeholder="e.g. BN123456 or CPR/2020/1234"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError('registration_number')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#F2B53D]'
                }`}
              />
              {showError('registration_number') && <InlineError message={errors.registration_number} />}
            </div>
          </div>

          {/* Tax ID */}
          <div className="flex flex-col" data-field="tax_id">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Tax ID (TIN) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaRegFileAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={11} />
              <input
                type="text"
                value={formData.tax_id || ""}
                onChange={(e) => handleChange('tax_id', e.target.value)}
                onBlur={() => handleBlur('tax_id')}
                placeholder="e.g. 1234567890 or A123456789Z"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError('tax_id')
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#F2B53D]'
                }`}
              />
              {showError('tax_id') && <InlineError message={errors.tax_id} />}
            </div>
          </div>

          {/* Business Description - Full width */}
          <div className="flex flex-col md:col-span-2" data-field="business_description">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineDocumentText className="absolute left-3 top-2.5 text-gray-400 z-10" size={12} />
              <textarea
                value={formData.business_description || ""}
                onChange={(e) => handleChange('business_description', e.target.value)}
                onBlur={() => handleBlur('business_description')}
                placeholder="Describe what you sell or your business mission... (Max 30 words)"
                className={`w-full h-14 pl-9 pr-3 pt-2 border rounded-xl text-[11px] focus:outline-none resize-none transition-colors ${
                  showError('business_description') || wordCount > 30
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-gray-200 focus:border-[#F2B53D]'
                }`}
                maxLength={500} // Safety limit to prevent extremely long inputs
              />
              {showError('business_description') && <InlineError message={errors.business_description} />}
              
              {/* Word counter with visual feedback */}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {wordCount > 0 && wordCount <= 30 && (
                    <MdCheckCircle 
                      size={10} 
                      className={wordCount > 20 ? "text-yellow-500" : "text-green-500"} 
                    />
                  )}
                  <p className={`text-[9px] transition-colors ${
                    wordCount > 30 ? "text-red-500 font-medium" : 
                    wordCount > 20 ? "text-yellow-600" : 
                    wordCount > 0 ? "text-green-600" : "text-gray-400"
                  }`}>
                    {wordCount === 0 ? "No words yet" : `${wordCount}/30 words`}
                  </p>
                </div>
                {wordCount > 25 && wordCount <= 30 && (
                  <div className="flex items-center gap-1">
                    <IoWarningOutline size={10} className="text-yellow-600" />
                    <p className="text-[8px] text-yellow-600">
                      Getting close to limit
                    </p>
                  </div>
                )}
              </div>

              {wordCount > 30 && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MdError size={10} className="text-red-500" />
                  <p className="text-red-500 text-[8px]">
                    Cannot exceed 30 words. Please shorten your description.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons - Only Continue button, centered */}
        <div className="w-full flex justify-center mt-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={wordCount > 30}
            className={`w-full max-w-[200px] h-7 rounded-full text-white font-bold text-[11px] transition-all ${
              wordCount > 30
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#D99201] hover:bg-[#e0a630] active:bg-[#c68500]'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default BusinessIdentity;