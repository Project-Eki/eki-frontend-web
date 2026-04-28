import React, { useState, useEffect, useMemo } from "react";
import {
  HiOutlineBriefcase,
  HiOutlineBuildingOffice,
  HiOutlineUser,
  HiOutlineIdentification,
  HiOutlineDocumentText,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { FaRegBuilding, FaRegFileAlt } from "react-icons/fa";
import { MdWarning, MdError, MdCheckCircle, MdClose } from "react-icons/md";
import { IoWarningOutline } from "react-icons/io5";
import { validateBusinessIdentity } from "../utils/onboardingValidation";
import MessageAlert from "./MessageAlert";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

// Reusable inline error tag
const InlineError = ({ message }) => (
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
    {message}
  </span>
);

// Toast notification component
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

  const serviceCategories = [
    { value: "transport", label: "Transport" },
    { value: "tailoring", label: "Tailoring" },
    { value: "airlines", label: "Airlines" },
    { value: "hotels", label: "Hospitality" },
    { value: "beauty", label: "Beauty & Health" },
    { value: "other", label: "Other" },
  ];

  if (businessType === "products") return productCategories;
  if (businessType === "services") return serviceCategories;
  if (businessType === "both") {
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

  const categoryOptions = useMemo(
    () => getCategoryOptions(formData.business_type),
    [formData.business_type],
  );
  
  // Memoized word count calculation for performance
  const wordCount = useMemo(() => {
    return (formData.business_description || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [formData.business_description]);

  // Auto-populate owner_full_name
  useEffect(() => {
    if (
      !formData.owner_full_name &&
      formData.first_name &&
      formData.last_name
    ) {
      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: {
          owner_full_name: `${formData.first_name} ${formData.last_name}`,
        },
      });
    }
  }, [
    formData.first_name,
    formData.last_name,
    formData.owner_full_name,
    dispatch,
  ]);

  // MODIFIED: Convert business_category format when business type changes
  useEffect(() => {
    // When switching to "both" or "services" (both require array format)
    if (
      (formData.business_type === "both" || formData.business_type === "services") &&
      !Array.isArray(formData.business_category)
    ) {
      // Convert from string to array
      const newValue = formData.business_category
        ? [formData.business_category]
        : [];
      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: { business_category: newValue },
      });
    } 
    // When switching to "products" (requires string format)
    else if (
      formData.business_type === "products" &&
      Array.isArray(formData.business_category)
    ) {
      // Convert from array to string (take first item or empty string)
      const newValue =
        formData.business_category.length > 0
          ? formData.business_category[0]
          : "";
      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: { business_category: newValue },
      });
    }
  }, [formData.business_type, dispatch]);

  // MODIFIED: Handle category change based on business type
  const handleCategoryChange = (value) => {
    // For "both" and "services" - both use multi-select logic
    if (formData.business_type === "both" || formData.business_type === "services") {
      // Multi-select logic
      const currentCategories = Array.isArray(formData.business_category)
        ? formData.business_category
        : [];
      let newCategories;

      if (currentCategories.includes(value)) {
        newCategories = currentCategories.filter((cat) => cat !== value);
      } else {
        newCategories = [...currentCategories, value];
      }

      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: { business_category: newCategories },
      });
      setTouched((prev) => ({ ...prev, business_category: true }));

      // Clear error based on validation rules
      // For "services": clear error if at least 1 category selected
      // For "both": clear error if at least 2 categories selected
      if (formData.business_type === "services" && newCategories.length >= 1 && errors.business_category) {
        const newErrors = { ...errors };
        delete newErrors.business_category;
        setErrors(newErrors);
      } else if (formData.business_type === "both" && newCategories.length >= 2 && errors.business_category) {
        const newErrors = { ...errors };
        delete newErrors.business_category;
        setErrors(newErrors);
      }
    } else {
      // Single-select logic for "products"
      dispatch({
        type: ACTIONS.UPDATE_FORM,
        payload: { business_category: value },
      });
      setTouched((prev) => ({ ...prev, business_category: true }));
    }

    // Real-time validation
    let categoryValue;
    if (formData.business_type === "both" || formData.business_type === "services") {
      // For multi-select, build the new array
      const currentCategories = Array.isArray(formData.business_category)
        ? formData.business_category
        : [];
      categoryValue = currentCategories.includes(value)
        ? currentCategories.filter((cat) => cat !== value)
        : [...currentCategories, value];
    } else {
      categoryValue = value;
    }

    const validationErrors = validateBusinessIdentity({
      ...formData,
      business_category: categoryValue,
    });
    setErrors(validationErrors);
  };

  const handleChange = (field, value) => {
    if (field === "business_description") {
      const words = value.trim().split(/\s+/).filter(Boolean);
      if (words.length > 30) {
        setShowToast(true);
        return;
      }
      if (showToast) setShowToast(false);
    }

    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { [field]: value } });
    setTouched((prev) => ({ ...prev, [field]: true }));

    const validationErrors = validateBusinessIdentity({
      ...formData,
      [field]: value,
    });
    setErrors(validationErrors);
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
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
      business_description: true,
    });

    const validationErrors = validateBusinessIdentity(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      dispatch({ type: ACTIONS.NEXT_STEP });
    } else {
      // scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(
        `[data-field="${firstErrorField}"]`,
      );
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const showError = (field) => touched[field] && errors[field];

  // MODIFIED: Check minimum categories based on business type
  const hasMinimumCategories = () => {
    if (formData.business_type === "both") {
      const categories = Array.isArray(formData.business_category)
        ? formData.business_category
        : [];
      return categories.length >= 2;
    }
    if (formData.business_type === "services") {
      const categories = Array.isArray(formData.business_category)
        ? formData.business_category
        : [];
      return categories.length >= 1;
    }
    return true;
  };

  // MODIFIED: Helper to determine if we should show multi-select UI
  const shouldShowMultiSelect = () => {
    return formData.business_type === "both" || formData.business_type === "services";
  };

  // MODIFIED: Helper to get selection requirement text
  const getSelectionRequirementText = () => {
    if (formData.business_type === "both") {
      return "(Select at least 2 categories)";
    }
    if (formData.business_type === "services") {
      return "(Select one or more categories)";
    }
    return "";
  };

  // MODIFIED: Helper to get selection status message
  const getSelectionStatusMessage = () => {
    if (!shouldShowMultiSelect()) return null;
    
    const categories = Array.isArray(formData.business_category)
      ? formData.business_category
      : [];
    const count = categories.length;
    
    if (formData.business_type === "both") {
      if (count === 0) {
        return { text: `Selected: 0 categories`, color: "text-gray-400", warning: null };
      }
      if (count === 1) {
        return { 
          text: `Selected: 1 category(ies)`, 
          color: "text-orange-500", 
          warning: { text: "(Need 1 more)", icon: <MdWarning size={10} /> }
        };
      }
      return { text: `Selected: ${count} category(ies)`, color: "text-green-600", warning: null };
    }
    
    if (formData.business_type === "services") {
      if (count === 0) {
        return { text: `Selected: 0 categories`, color: "text-gray-400", warning: null };
      }
      return { text: `Selected: ${count} category(ies)`, color: "text-green-600", warning: null };
    }
    
    return null;
  };

  return (
    <>
      {/* Toast notification*/}
      {showToast && (
        <Toast
          message="Business description cannot exceed 30 words"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="w-full animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
            <HiOutlineBriefcase className="text-[#F2B53D]" size={16} />
          </div>
          <div>
            <h3 className="font-bold text-[13px] text-gray-800">
              Business Identity
            </h3>
            <p className="text-[10px] text-gray-500">
              Legal details as on official documents
            </p>
          </div>
        </div>

        {generalError && (
          <MessageAlert message={generalError} type="error" className="mb-2" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-2">
          {/* Legal Business Name */}
          <div className="flex flex-col" data-field="business_name">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Legal Business Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineBuildingOffice
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={12}
              />
              <input
                type="text"
                value={formData.business_name || ""}
                onChange={(e) => handleChange("business_name", e.target.value)}
                onBlur={() => handleBlur("business_name")}
                placeholder="e.g. Global Tech Solutions Ltd."
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError("business_name")
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-[#F2B53D]"
                }`}
              />
              {showError("business_name") && (
                <InlineError message={errors.business_name} />
              )}
            </div>
          </div>

          {/* Business Type */}
          <div className="flex flex-col" data-field="business_type">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaRegBuilding
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={11}
              />
              <select
                value={formData.business_type || ""}
                onChange={(e) => handleChange("business_type", e.target.value)}
                onBlur={() => handleBlur("business_type")}
                className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer appearance-none transition-colors ${
                  showError("business_type")
                    ? "border-red-400"
                    : "border-gray-200"
                }`}
              >
                <option value="">Select business type</option>
                <option value="products">Products</option>
                <option value="services">Services</option>
                <option value="both">Both</option>
              </select>
              {showError("business_type") && (
                <InlineError message={errors.business_type} />
              )}
            </div>
          </div>

          {/* Business Category - MODIFIED: Now shows multi-select for both "both" and "services" */}
          <div
            className={`flex flex-col ${shouldShowMultiSelect() ? "md:col-span-2" : ""}`}
            data-field="business_category"
          >
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Category <span className="text-red-500">*</span>
              {shouldShowMultiSelect() && (
                <span className="text-[8px] text-gray-500 ml-1">
                  {getSelectionRequirementText()}
                </span>
              )}
            </label>

            {/* MODIFIED: Show multi-select for both "both" AND "services" */}
            {shouldShowMultiSelect() ? (
              <div className="relative">
                <div
                  className={`border rounded-xl p-2 max-h-32 overflow-y-auto ${
                    showError("business_category")
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  {categoryOptions.map((option) => {
                    const isSelected =
                      Array.isArray(formData.business_category) &&
                      formData.business_category.includes(option.value);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryChange(option.value)}
                          className="w-3 h-3 rounded border-gray-300 text-[#F2B53D] focus:ring-[#F2B53D] accent-[#1D4D4C]"
                        />
                        <span className="text-[11px] text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {showError("business_category") && (
                  <InlineError message={errors.business_category} />
                )}

                {/* MODIFIED: Show selection status with appropriate messaging */}
                {Array.isArray(formData.business_category) && (
                  <div className="mt-1 flex justify-between items-center">
                    <div
                      className={`text-[9px] ${getSelectionStatusMessage()?.color || "text-gray-400"}`}
                    >
                      {getSelectionStatusMessage()?.text}
                      {getSelectionStatusMessage()?.warning && (
                        <span className="ml-1">
                          {getSelectionStatusMessage()?.warning.text}
                        </span>
                      )}
                    </div>
                    {/* MODIFIED: Show warning for "both" when exactly 1 category selected */}
                    {formData.business_type === "both" && 
                     Array.isArray(formData.business_category) && 
                     formData.business_category.length === 1 && (
                      <div className="text-[8px] text-orange-500 flex items-center gap-1">
                        <MdWarning size={10} />
                        Select at least 1 more category
                      </div>
                    )}
                    {/* MODIFIED: No warning for "services" since 1 category is valid */}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <HiOutlineClipboardDocumentList
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                  size={12}
                />
                <select
                  value={
                    Array.isArray(formData.business_category)
                      ? formData.business_category[0] || ""
                      : formData.business_category || ""
                  }
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  onBlur={() => handleBlur("business_category")}
                  disabled={!formData.business_type}
                  className={`w-full h-8 pl-9 pr-8 border rounded-xl text-[11px] focus:border-[#F2B53D] outline-none cursor-pointer appearance-none transition-colors ${
                    !formData.business_type
                      ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                      : "bg-white"
                  } ${
                    showError("business_category")
                      ? "border-red-400"
                      : "border-gray-200"
                  }`}
                >
                  <option value="">
                    {!formData.business_type
                      ? "Select business type first"
                      : "Select category"}
                  </option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {showError("business_category") && (
                  <InlineError message={errors.business_category} />
                )}
              </div>
            )}
          </div>

          {/* Owner Full Name */}
          <div className="flex flex-col" data-field="owner_full_name">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Owner Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineUser
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={12}
              />
              <input
                type="text"
                value={formData.owner_full_name || ""}
                onChange={(e) =>
                  handleChange("owner_full_name", e.target.value)
                }
                onBlur={() => handleBlur("owner_full_name")}
                placeholder="First & Last name"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError("owner_full_name")
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-[#F2B53D]"
                }`}
              />
              {showError("owner_full_name") && (
                <InlineError message={errors.owner_full_name} />
              )}
            </div>
          </div>

          {/* Registration Number */}
          <div className="flex flex-col" data-field="registration_number">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Registration Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineIdentification
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={12}
              />
              <input
                type="text"
                value={formData.registration_number || ""}
                onChange={(e) =>
                  handleChange("registration_number", e.target.value)
                }
                onBlur={() => handleBlur("registration_number")}
                placeholder="e.g. BN123456 or CPR/2020/1234"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError("registration_number")
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-[#F2B53D]"
                }`}
              />
              {showError("registration_number") && (
                <InlineError message={errors.registration_number} />
              )}
            </div>
          </div>

          {/* Tax ID */}
          <div className="flex flex-col" data-field="tax_id">
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Tax ID (TIN) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaRegFileAlt
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                size={11}
              />
              <input
                type="text"
                value={formData.tax_id || ""}
                onChange={(e) => handleChange("tax_id", e.target.value)}
                onBlur={() => handleBlur("tax_id")}
                placeholder="e.g. 1234567890 or A123456789Z"
                className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                  showError("tax_id")
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-[#F2B53D]"
                }`}
              />
              {showError("tax_id") && <InlineError message={errors.tax_id} />}
            </div>
          </div>

          {/* Business Description */}
          <div
            className="flex flex-col md:col-span-2"
            data-field="business_description"
          >
            <label className="text-[10px] font-semibold text-gray-700 mb-0.5 ml-1">
              Business Description <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <HiOutlineDocumentText
                className="absolute left-3 top-2.5 text-gray-400 z-10"
                size={12}
              />
              <textarea
                value={formData.business_description || ""}
                onChange={(e) =>
                  handleChange("business_description", e.target.value)
                }
                onBlur={() => handleBlur("business_description")}
                placeholder="Describe what you sell or your business mission... (Max 30 words)"
                className={`w-full h-14 pl-9 pr-3 pt-2 border rounded-xl text-[11px] focus:outline-none resize-none transition-colors ${
                  showError("business_description") || wordCount > 30
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-[#F2B53D]"
                }`}
                maxLength={500}
              />
              {showError("business_description") && (
                <InlineError message={errors.business_description} />
              )}

              {/* Word counter with visual feedback*/}
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center gap-1">
                  {wordCount > 0 && wordCount <= 30 && (
                    <MdCheckCircle
                      size={10}
                      className={
                        wordCount > 20 ? "text-yellow-500" : "text-green-500"
                      }
                    />
                  )}
                  <p
                    className={`text-[9px] transition-colors ${
                      wordCount > 30
                        ? "text-red-500 font-medium"
                        : wordCount > 20
                          ? "text-yellow-600"
                          : wordCount > 0
                            ? "text-green-600"
                            : "text-gray-400"
                    }`}
                  >
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

        {/* Continue Button - MODIFIED: Updated disabled condition for services */}
        <div className="w-full flex justify-center mt-4">
          <button
            type="button"
            onClick={handleContinue}
            disabled={
              wordCount > 30 ||
              (formData.business_type === "both" && !hasMinimumCategories()) ||
              (formData.business_type === "services" && !hasMinimumCategories())
            }
            className={`w-full max-w-[200px] h-7 rounded-full text-white font-bold text-[11px] transition-all ${
              wordCount > 30 ||
              (formData.business_type === "both" && !hasMinimumCategories()) ||
              (formData.business_type === "services" && !hasMinimumCategories())
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#D99201] hover:bg-[#e0a630] active:bg-[#c68500]"
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