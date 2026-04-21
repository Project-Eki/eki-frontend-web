import React, { useRef, useState, useEffect } from "react";
import { HiOutlineCloudUpload, HiCheckCircle, HiOutlineCalendar, HiCheck } from "react-icons/hi";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import { validateOperationCompliance } from "../utils/onboardingValidation";
import { completeVendorOnboarding, getVendorProfile } from "../services/api";
import api from "../services/api"; // Import for debug function

const OperationCompliance = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");
  
  // Ref for scrolling to error message
  const errorMessageRef = useRef(null);

  // File refs for documents
  const govtIdRef = useRef(null);
  const professionalCertRef = useRef(null);
  const businessLicenseRef = useRef(null);
  const taxCertificateRef = useRef(null);
  const incCertificateRef = useRef(null);

  const fileRefs = {
    government_issued_id: govtIdRef,
    professional_body_certification: professionalCertRef,
    business_license: businessLicenseRef,
    tax_certificate: taxCertificateRef,
    incorporation_cert: incCertificateRef,
  };

  const showError = (field) => touched[field] && errors[field];

  // Debug function to check what's in the database
  const checkSavedData = async () => {
    try {
      const response = await api.get("/accounts/register-vendor/");
      console.log("=== DATA IN DATABASE ===");
      console.log("Business Name:", response.data?.data?.business_name);
      console.log("Business Type:", response.data?.data?.business_type);
      console.log("Business Category:", response.data?.data?.business_category);
      console.log("Owner Name:", response.data?.data?.owner_full_name);
      console.log("Tax ID:", response.data?.data?.tax_id);
      console.log("Registration Number:", response.data?.data?.registration_number);
      console.log("Phone:", response.data?.data?.business_phone);
      console.log("Country:", response.data?.data?.country);
      console.log("City:", response.data?.data?.city);
      console.log("Opening Time:", response.data?.data?.opening_time);
      console.log("Closing Time:", response.data?.data?.closing_time);
      console.log("Has Documents:", {
        govt_id: response.data?.data?.has_government_issued_id,
        professional_cert: response.data?.data?.has_professional_body_certification,
        license: response.data?.data?.has_business_license,
        tax: response.data?.data?.has_tax_certificate,
        inc: response.data?.data?.has_incorporation_cert,
      });
      return response.data?.data;
    } catch (err) {
      console.error("Failed to check saved data:", err);
      return null;
    }
  };

  // Function to scroll to error message
  const scrollToError = () => {
    if (errorMessageRef.current) {
      errorMessageRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const handleReviewClick = async () => {  
    console.log("=== OPERATIONS & COMPLIANCE: Review Click ===");
    
    // Log all business data before saving
    console.log("Business data before save:", {
      business_name: formData.business_name,
      business_type: formData.business_type,
      business_category: formData.business_category,
      owner_full_name: formData.owner_full_name,
      tax_id: formData.tax_id,
      registration_number: formData.registration_number,
      business_description: formData.business_description,
      business_phone: formData.business_phone,
      address: formData.address,
      city: formData.city,
      country: formData.country,
      landmark: formData.landmark,
      intersection: formData.intersection,
      zip_code: formData.zip_code,
      opening_time: formData.opening_time,
      closing_time: formData.closing_time,
      branch_locations: formData.branch_locations?.length || 0,
    });
    
    console.log("Documents before save:", {
      government_issued_id: formData.documents?.government_issued_id instanceof File ? formData.documents.government_issued_id.name : "No file",
      government_issued_id_expiry: formData.documents?.government_issued_id_expiry,
      professional_body_certification: formData.documents?.professional_body_certification instanceof File ? "Has file" : "No file",
      professional_body_certification_expiry: formData.documents?.professional_body_certification_expiry,
      business_license: formData.documents?.business_license instanceof File ? formData.documents.business_license.name : "No file",
      business_license_expiry: formData.documents?.business_license_expiry,
      tax_certificate: formData.documents?.tax_certificate instanceof File ? formData.documents.tax_certificate.name : "No file",
      tax_certificate_expiry: formData.documents?.tax_certificate_expiry,
      incorporation_cert: formData.documents?.incorporation_cert instanceof File ? formData.documents.incorporation_cert.name : "No file",
    });

    // Validate required documents before saving
    const requiredDocs = [
      'government_issued_id',
      'business_license',
      'tax_certificate',
      'incorporation_cert'
    ];
    
    const missingDocs = requiredDocs.filter(doc => !(formData.documents?.[doc] instanceof File));
    
    if (missingDocs.length > 0) {
      setSubmitError(`Please upload all required documents: ${missingDocs.join(', ')}`);
      setTouched({
        government_issued_id: true,
        business_license: true,
        tax_certificate: true,
        incorporation_cert: true,
      });
      scrollToError(); // Scroll to error message
      return;
    }
    
    // Validate expiry dates
    const requiredExpiries = [
      'government_issued_id_expiry',
      'business_license_expiry',
      'tax_certificate_expiry'
    ];
    
    const missingExpiries = requiredExpiries.filter(expiry => !formData.documents?.[expiry]);
    
    if (missingExpiries.length > 0) {
      setSubmitError(`Please provide expiry dates for: ${missingExpiries.join(', ')}`);
      scrollToError(); // Scroll to error message
      return;
    }

    setIsLoading(true);
    setSubmitError("");
    
    try {
      // Save COMPLETE formData (business fields + documents) to backend
      console.log("Saving complete profile to backend...");
      const saveResponse = await completeVendorOnboarding(formData);
      console.log("Save response:", saveResponse);
      
      // Verify data was saved correctly
      console.log("Verifying saved data...");
      const savedData = await checkSavedData();
      
      // Check if business data was saved
      if (!savedData?.business_name) {
        console.warn("WARNING: Business data may not have been saved correctly!");
        console.warn("Business name is null in database");
      }
      
      if (!savedData?.has_government_issued_id) {
        console.warn("WARNING: Documents may not have been saved correctly!");
      }
      
      console.log("Profile saved successfully!");
      
      // Update touched state for validation
      setTouched({
        government_issued_id: true,
        government_issued_id_expiry: true,
        professional_body_certification: true,
        professional_body_certification_expiry: true,
        business_license: true,
        business_license_expiry: true,
        tax_certificate: true,
        tax_certificate_expiry: true,
        incorporation_cert: true,
      });

      // Prepare data for validation
      const dataToValidate = {
        ...formData,
        government_issued_id_expiry: formData.documents?.government_issued_id_expiry,
        professional_body_certification_expiry: formData.documents?.professional_body_certification_expiry,
        business_license_expiry: formData.documents?.business_license_expiry,
        tax_certificate_expiry: formData.documents?.tax_certificate_expiry,
        documents: formData.documents
      };

      const validationErrors = validateOperationCompliance(dataToValidate);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length === 0) {
        console.log("Validation passed, moving to step 6");
        dispatch({ type: ACTIONS.SET_STEP, payload: 6 });
      } else {
        console.log("Validation failed:", validationErrors);
        setSubmitError("Please fix the validation errors before continuing.");
        scrollToError(); // Scroll to error message
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      console.error("Error details:", error.response?.data);
      
      let errorMessage = "Failed to save profile. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const fieldErrors = Object.entries(error.response.data.errors)
          .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
          .join('; ');
        errorMessage = `Validation errors: ${fieldErrors}`;
      }
      
      setSubmitError(errorMessage);
      scrollToError(); // Scroll to error message
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`File uploaded: ${field} =`, file.name, "Type:", file.type, "Size:", file.size);

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setTouched(prev => ({ ...prev, [field]: true }));

    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: {
        documents: {
          ...(formData.documents || {}),
          [field]: file,
        },
      },
    });
  };

  const handleExpiryChange = (field, value) => {
    // Skip if field is incorporation_cert (no expiry)
    if (field === 'incorporation_cert') {
      console.log("Skipping expiry for incorporation certificate - it doesn't expire");
      return;
    }
    
    console.log(`Expiry set: ${field}_expiry = ${value}`);
    
    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: {
        documents: {
          ...(formData.documents || {}),
          [`${field}_expiry`]: value,
        },
      },
    });
    setTouched(prev => ({ ...prev, [`${field}_expiry`]: true }));
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`${field}_expiry`];
      return newErrors;
    });
  };

  const DocumentSection = ({ label, field, description, required = true, showExpiry = true }) => {
    const file = formData.documents?.[field];
    const isUploaded = !!file;
    const hasError = showError(field) && errors[field];
    
    // Only get expiry value if showExpiry is true AND field is not incorporation_cert
    let expiryValue = "";
    let hasExpiryError = false;
    
    if (showExpiry && field !== 'incorporation_cert') {
      expiryValue = formData.documents?.[`${field}_expiry`] || "";
      hasExpiryError = showError(`${field}_expiry`) && errors[`${field}_expiry`];
    }

    return (
      <div className="border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
        <div className="mb-1.5">
          <label className="text-[10px] font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {description && (
            <p className="text-[8px] text-gray-500 mt-0.5">{description}</p>
          )}
          {/* Add helper text for incorporation certificate */}
          {field === 'incorporation_cert' && (
            <p className="text-[7px] text-[#F2B53D] mt-0.5 flex items-center gap-1">
              <HiCheck />
                Incorporation certificates do not expire
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start">
          <div className="flex-1">
            <div
              onClick={() => fileRefs[field]?.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all p-2 text-center
                ${isUploaded ? "border-green-500 bg-green-50" :
                  hasError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-[#F2B53D] bg-gray-50"}`}
            >
              <input
                type="file"
                ref={fileRefs[field]}
                onChange={(e) => handleFileChange(field, e)}
                className="hidden"
                accept=".pdf,.jpg,.png,.jpeg"
              />

              <div className="flex flex-col items-center justify-center">
                {isUploaded ? (
                  <>
                    <HiCheckCircle className="text-green-600" size={18} />
                    <span className="text-[9px] font-medium text-green-600 mt-0.5">
                      {file.name && file.name.length > 25 ? file.name.substring(0, 22) + "..." : file?.name || "Uploaded"}
                    </span>
                    <span className="text-[7px] text-gray-500 mt-0.5">Click to change</span>
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="text-[#F2B53D]" size={18} />
                    <span className="text-[9px] font-medium text-gray-600 mt-0.5">Click to upload</span>
                    <span className="text-[7px] text-gray-400 mt-0.5">PDF, PNG or JPG</span>
                  </>
                )}
              </div>
            </div>
            {hasError && !isUploaded && (
              <p className="text-red-500 text-[7px] font-bold mt-0.5">{errors[field]}</p>
            )}
          </div>

          {/* Only show expiry date if showExpiry is true AND field is not incorporation_cert */}
          {showExpiry && field !== 'incorporation_cert' && (
            <div className="sm:w-[180px]">
              <label className="text-[8px] font-semibold text-gray-700 mb-0.5 flex items-center gap-0.5">
                <HiOutlineCalendar size={9} />
                Expiry Date {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={expiryValue}
                onChange={(e) => handleExpiryChange(field, e.target.value)}
                className={`w-full h-7 px-2 bg-white border rounded-lg text-[9px] focus:border-[#F2B53D] outline-none ${
                  hasExpiryError ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {hasExpiryError && (
                <span className="text-red-500 text-[7px] font-bold mt-0.5 block">
                  {errors[`${field}_expiry`]}
                </span>
              )}
            </div>
          )}
          
          {/* Show "No Expiry" badge for incorporation certificate */}
          {field === 'incorporation_cert' && (
            <div className="sm:w-[180px]">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-1.5 text-center">
                <span className="text-[8px] font-medium text-gray-600 flex items-center gap-1"> 
                  <HiCheck />
                   No Expiry Date</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineCloudUpload className="text-[#F2B53D]" size={14} />
        </div>
        <div>
          <h3 className="font-bold text-[12px] text-gray-800">Operations & Compliance</h3>
          <p className="text-[8px] text-gray-500">Upload documents. Must be current & legible.</p>
        </div>
      </div>

      {/* Error message with ref for scrolling */}
      {submitError && (
        <div 
          ref={errorMessageRef}
          className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md"
        >
          <p className="text-red-600 text-[8px] font-medium">{submitError}</p>
        </div>
      )}

      <div className="space-y-2 mb-3">
        <DocumentSection
          label="Government Issued ID"
          field="government_issued_id"
          description="Passport, Driver's License, National ID"
          required={true}
          showExpiry={true}
        />

        <DocumentSection
          label="Incorporation Certificate"
          field="incorporation_cert"
          description="Certificate of incorporation"
          required={true}
          showExpiry={false}
        />

        <DocumentSection
          label="Business License"
          field="business_license"
          description="Official business operating license"
          required={true}
          showExpiry={true}
        />

        <DocumentSection
          label="Tax Certificate"
          field="tax_certificate"
          description="TIN or VAT registration"
          required={true}
          showExpiry={true}
        />

        <DocumentSection
          label="Professional Certification"
          field="professional_body_certification"
          description="Optional: PRC, CPA, Engineering"
          required={false}
          showExpiry={true}
        />
      </div>

      <div className="flex gap-2 mt-2">
        <button
          onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
          className="flex-1 max-w-[80px] h-6 rounded-full text-gray-500 font-semibold text-[9px] border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleReviewClick}
          disabled={isLoading}
          className="flex-1 max-w-[100px] h-6 rounded-full text-white font-bold text-[9px] transition-all bg-[#D99201] hover:bg-[#e0a630] disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Review And Submit"}
        </button>
      </div>
    </div>
  );
};

export default OperationCompliance;