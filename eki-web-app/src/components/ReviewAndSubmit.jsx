import React, { useState } from "react";
import { HiCheckCircle, HiOutlinePencil, HiOutlinePhone, HiXCircle } from "react-icons/hi";
import { HiOutlineBuildingStorefront, HiOutlineMapPin } from "react-icons/hi2";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import Flag from "react-world-flags";
import { submitVendorApplication } from "../services/api";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

countries.registerLocale(enLocale);

const ReviewAndSubmit = ({ formData, onBack, onSubmitSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { dispatch } = useOnboarding();

  const countryName = countries.getName(formData.country, "en") || formData.country;

  const documents = Object.entries(formData.documents || {}).filter(([_, file]) => file);

  // Helper to format display name for documents
  const getDisplayName = (key) => {
    const name = key.replace(/_/g, " ");
    if (name === "government issued id") return "Govt ID";
    if (name === "professional body certification") return "Professional Cert";
    if (name === "business license") return "License";
    if (name === "tax certificate") return "Tax Cert";
    if (name === "incorporation cert") return "Inc. Cert";
    return name;
  };

const handleSubmit = async () => {
  setIsLoading(true);
  setSubmitError("");
  setFieldErrors({});
  
  // ============================================================
  // VALIDATION BASED ON ACTUAL FORM FIELDS
  // ============================================================
  
  // STEP 3: Business Identity Fields (ALL required based on your validation)
  const businessIdentityFields = [
    'business_name',        // Required - has validation
    'business_type',        // Required - has validation
    'business_category',    // Required - has validation
    'owner_full_name',      // Required - has validation
    'registration_number',  // Required - has validation
    'tax_id',              // Required - has validation
    'business_description'  // Required in form (no validation but captured)
  ];
  
  // STEP 4: Contact & Location Fields (required vs optional)
  const requiredContactFields = [
    'business_phone',  // Required - has validation
    'country',         // Required - has validation
    'city',           // Required - has validation
    'opening_time',   // Required - has validation
    'closing_time'    // Required - has validation
  ];
  
  // Optional fields from Step 4 (don't validate these)
  // - address (optional)
  // - landmark (optional)
  // - intersection (optional)
  // - zip_code (optional)
  // - branch_locations (optional)
  
  // Combine all required fields
  const allRequiredFields = [...businessIdentityFields, ...requiredContactFields];
  
  // Check for missing required fields
  const missingFields = allRequiredFields.filter(field => {
    const value = formData[field];
    return !value || (typeof value === 'string' && value.trim() === '');
  });
  
  if (missingFields.length > 0) {
    setSubmitError(`Missing required fields: ${missingFields.join(', ')}`);
    setIsLoading(false);
    return;
  }
  
  // STEP 5: Document Validation (from OperationCompliance)
  const requiredDocs = [
    'government_issued_id',  // Required
    'business_license',      // Required
    'tax_certificate',       // Required
    'incorporation_cert'     // Required
  ];
  
  // Professional certification is OPTIONAL - don't validate
  
  const missingDocs = requiredDocs.filter(doc => {
    const file = formData.documents?.[doc];
    return !(file instanceof File);
  });
  
  if (missingDocs.length > 0) {
    setSubmitError(`Missing required documents: ${missingDocs.join(', ')}`);
    setIsLoading(false);
    return;
  }
  
  // Check expiry dates for required documents (except incorporation_cert)
  const requiredExpiryDates = [
    'government_issued_id_expiry',
    'business_license_expiry',
    'tax_certificate_expiry'
  ];
  
  const missingExpiries = requiredExpiryDates.filter(expiry => {
    return !formData.documents?.[expiry];
  });
  
  if (missingExpiries.length > 0) {
    setSubmitError(`Missing expiry dates for: ${missingExpiries.join(', ')}`);
    setIsLoading(false);
    return;
  }
  
  // ============================================================
  // END OF VALIDATION
  // ============================================================
  
  // DEBUG: Log all data being submitted
  console.log("=== FRONTEND DEBUG: All Required Fields ===");
  console.log("Business Fields:", {
    business_name: formData.business_name,
    business_type: formData.business_type,
    business_category: formData.business_category,
    owner_full_name: formData.owner_full_name,
    registration_number: formData.registration_number,
    tax_id: formData.tax_id,
    business_description: formData.business_description
  });
  
  console.log("Contact Fields:", {
    business_phone: formData.business_phone,
    country: formData.country,
    city: formData.city,
    opening_time: formData.opening_time,
    closing_time: formData.closing_time,
    address: formData.address || "(optional)",
    landmark: formData.landmark || "(optional)"
  });
  
  console.log("Documents:", {
    government_issued_id: formData.documents?.government_issued_id instanceof File ? formData.documents.government_issued_id.name : "No file",
    government_issued_id_expiry: formData.documents?.government_issued_id_expiry,
    business_license: formData.documents?.business_license instanceof File ? formData.documents.business_license.name : "No file",
    business_license_expiry: formData.documents?.business_license_expiry,
    tax_certificate: formData.documents?.tax_certificate instanceof File ? formData.documents.tax_certificate.name : "No file",
    tax_certificate_expiry: formData.documents?.tax_certificate_expiry,
    incorporation_cert: formData.documents?.incorporation_cert instanceof File ? formData.documents.incorporation_cert.name : "No file",
    professional_body_certification: formData.documents?.professional_body_certification instanceof File ? "Has file (optional)" : "Not provided (optional)"
  });
  
  try {
    const response = await submitVendorApplication(formData);
    console.log("Submit response:", response);
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { isSubmitted: true } });
    onSubmitSuccess();
  } catch (error) {
    console.error("Submission Error:", error);
    if (error.response) {
      console.error("Error data:", error.response.data);
    }
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

  const ReviewItem = ({ label, value, colSpan = false, children, fieldName }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-gray-400 block text-[7px]">{label}</p>
      {children ? (
        children
      ) : (
        <>
          <span className={`font-medium text-[9px] leading-tight block truncate ${
            fieldErrors[fieldName] ? 'text-red-600' : 'text-gray-800'
          }`}>
            {value || "—"}
          </span>
          {fieldErrors[fieldName] && (
            <p className="text-red-500 text-[7px] mt-0.5">
              {Array.isArray(fieldErrors[fieldName]) ? fieldErrors[fieldName][0] : fieldErrors[fieldName]}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-1.5">
        <h2 className="text-[14px] font-black text-gray-900">Review & Submit</h2>
        <p className="text-gray-500 text-[9px]">Verify your details before submitting</p>
      </div>

      {/* Error Message Banner */}
      {submitError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <HiXCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-red-600 text-[10px] font-medium">Submission Failed</p>
              <p className="text-red-500 text-[9px] mt-0.5">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Field Errors Summary */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-700 text-[9px] font-medium mb-1">Please fix these fields:</p>
          <ul className="list-disc list-inside text-[8px] text-yellow-600">
            {Object.entries(fieldErrors).map(([field, errors]) => (
              <li key={field}>
                <span className="font-medium">{field.replace(/_/g, ' ')}:</span> {Array.isArray(errors) ? errors.join(', ') : errors}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Review Sections */}
      <div className="space-y-0">
        {/* Business Identity - 2 columns */}
        <ReviewSection title="BUSINESS IDENTITY">
          <ReviewItem label="Business Name" value={formData.business_name} fieldName="business_name" />
          <ReviewItem label="Business Type" value={formData.business_type} fieldName="business_type" />
          <ReviewItem label="Category" value={formData.business_category} fieldName="business_category" />
          <ReviewItem label="Owner Name" value={formData.owner_full_name} fieldName="owner_full_name" />
          <ReviewItem label="Tax ID" value={formData.tax_id} fieldName="tax_id" />
          <ReviewItem label="Reg Number" value={formData.registration_number} fieldName="registration_number" />
          <ReviewItem label="Description" value={formData.business_description?.substring(0, 40)} colSpan fieldName="business_description" />
        </ReviewSection>

        {/* Contact & Location - 2 columns */}
        <ReviewSection title="CONTACT & LOCATION">
          <ReviewItem label="Phone" value={formData.business_phone} fieldName="business_phone" />
          <ReviewItem label="Email" value={formData.email} fieldName="email" />
          <ReviewItem label="Address" value={formData.address || "—"} fieldName="address" />
          <ReviewItem label="City" value={formData.city} fieldName="city" />
          <ReviewItem label="Landmark" value={formData.landmark || "—"} fieldName="landmark" />
          <ReviewItem label="Zip Code" value={formData.zip_code || "—"} fieldName="zip_code" />
          <ReviewItem label="Country" fieldName="country">
            <div className="flex items-center gap-0.5 mt-0.5">
              <Flag code={formData.country} className="w-2.5 h-1.5 rounded-sm object-cover shadow-sm" />
              <span className={`font-medium text-[9px] ${fieldErrors.country ? 'text-red-600' : 'text-gray-800'}`}>
                {countryName}
              </span>
              {fieldErrors.country && (
                <p className="text-red-500 text-[7px] mt-0.5">{fieldErrors.country}</p>
              )}
            </div>
          </ReviewItem>
          <ReviewItem label="Hours" value={`${formData.opening_time || "—"} - ${formData.closing_time || "—"}`} fieldName="opening_time" />
        </ReviewSection>

        {/* Branch Locations - Show if any branches added */}
        {formData.branch_locations && formData.branch_locations.length > 0 && (
          <ReviewSection title="BRANCH LOCATIONS">
            <div className="col-span-2 space-y-1">
              {formData.branch_locations.map((branch, idx) => (
                <div key={idx} className="text-[9px] text-gray-700 border-l-2 border-[#F2B53D] pl-2">
                  <div className="flex items-center gap-1">
                    <HiOutlineBuildingStorefront size={10} className="text-gray-500 shrink-0" />
                    <span className="font-semibold">{branch.address}</span>
                    {branch.city && <span>, {branch.city}</span>}
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlinePhone size={8} className="text-gray-400" />
                      <span className="text-gray-500">{branch.phone}</span>
                    </div>
                  )}
                  {branch.landmark && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlineMapPin size={8} className="text-gray-400" />
                      <span className="text-gray-500 text-[8px]">{branch.landmark}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ReviewSection>
        )}

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

      {/* Buttons */}
      <div className="flex justify-end items-center gap-1.5 mt-4">
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