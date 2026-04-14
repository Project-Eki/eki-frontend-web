import React, { useState } from "react";
import { HiCheckCircle, HiOutlinePencil } from "react-icons/hi";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import Flag from "react-world-flags";
import { completeVendorOnboarding, submitVendorApplication } from "../services/api";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

countries.registerLocale(enLocale);

const ReviewAndSubmit = ({ formData, onBack, onSubmitSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { dispatch } = useOnboarding();

  const countryName = countries.getName(formData.country, "en") || formData.country;

  const documents = Object.entries(formData.documents || {}).filter(([_, file]) => file);

  // Helper to format display name for documents
  const getDisplayName = (key) => {
    const name = key.replace(/_/g, " ");
    if (name === "government issued id") return "Govt ID";
    if (name === "professional certification") return "Prof. Cert";
    if (name === "business license") return "License";
    if (name === "tax certificate") return "Tax Cert";
    if (name === "incorporation cert") return "Inc. Cert";
    return name;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setSubmitError("");
    try {
      await completeVendorOnboarding(formData);
      await submitVendorApplication(formData);
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: { isSubmitted: true } });
      onSubmitSuccess();
    } catch (error) {
      console.error("Submission Error:", error);
      const apiData = error.response?.data || {};
      const serverMessage = apiData.message || apiData.detail || apiData.error || error.message;
      setSubmitError(serverMessage || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const ReviewSection = ({ title, children }) => (
    <div className="border-b border-gray-100 pb-1.5 last:border-0 pt-1.5 first:pt-0">
      <p className="text-[7px] font-black text-[#F2B53D] uppercase tracking-wider mb-1">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5 text-[10px]">{children}</div>
    </div>
  );

  const ReviewItem = ({ label, value, colSpan = false, children }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-gray-400 block text-[7px]">{label}</p>
      {children ? (
        children
      ) : (
        <span className="font-medium text-gray-800 text-[9px] leading-tight block truncate">{value || "—"}</span>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header -  */}
      <div className="mb-1.5">
        <h2 className="text-[14px] font-black text-gray-900">Review & Submit</h2>
        <p className="text-gray-500 text-[9px]">Verify your details before submitting</p>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="mb-1.5 p-1 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-[8px] font-medium">{submitError}</p>
        </div>
      )}

      {/* Review Sections */}
      <div className="space-y-0">
        {/* Business Identity - 2 columns */}
        <ReviewSection title="BUSINESS IDENTITY">
          <ReviewItem label="Business Name" value={formData.business_name} />
          <ReviewItem label="Business Type" value={formData.business_type} />
          <ReviewItem label="Category" value={formData.business_category} />
          <ReviewItem label="Owner Name" value={formData.owner_full_name} />
          <ReviewItem label="Tax ID" value={formData.tax_id} />
          <ReviewItem label="Reg Number" value={formData.registration_number} />
          <ReviewItem label="Description" value={formData.business_description?.substring(0, 40)} colSpan />
        </ReviewSection>

        {/* Contact & Location - 2 columns */}
        <ReviewSection title="CONTACT & LOCATION">
          <ReviewItem label="Phone" value={formData.business_phone} />
          <ReviewItem label="Email" value={formData.email} />
          <ReviewItem label="Address" value={formData.address || "—"} />
          <ReviewItem label="City" value={formData.city} />
          <ReviewItem label="Landmark" value={formData.landmark || "—"} />
          <ReviewItem label="Zip Code" value={formData.zip_code || "—"} />
          <ReviewItem label="Country">
            <div className="flex items-center gap-0.5 mt-0.5">
              <Flag code={formData.country} className="w-2.5 h-1.5 rounded-sm object-cover shadow-sm" />
              <span className="font-medium text-gray-800 text-[9px]">{countryName}</span>
            </div>
          </ReviewItem>
          <ReviewItem label="Hours" value={`${formData.opening_time || "—"} - ${formData.closing_time || "—"}`} />
        </ReviewSection>

        {/* Documents - Single column full width */}
        <div className="pt-1.5 pb-0.5">
          <p className="text-[7px] font-black text-[#F2B53D] uppercase tracking-wider mb-1">DOCUMENTS</p>
          <div className="flex flex-wrap gap-0.5">
            {documents.length === 0 ? (
              <span className="text-gray-400 text-[8px] italic">No documents uploaded</span>
            ) : (
              documents.map(([key]) => (
                <div key={key} className="flex items-center gap-0.5 bg-green-50 text-green-700 px-1 py-0.5 rounded border border-green-100 text-[7px] font-semibold">
                  <HiCheckCircle size={6} /> {getDisplayName(key)}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Buttons  */}
      <div className="flex justify-end items-center gap-1.5 mt-2">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-2.5 h-5 rounded-full text-gray-500 font-semibold text-[8px] border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-0.5"
        >
          <HiOutlinePencil size={7} /> Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-3 h-5 rounded-full text-white font-bold text-[8px] transition-all bg-[#D99201] hover:bg-[#e0a630] flex items-center justify-center gap-0.5"
        >
          {isLoading ? (
            <div className="w-2 h-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewAndSubmit;