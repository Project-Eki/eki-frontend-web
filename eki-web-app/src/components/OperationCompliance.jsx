import React, { useRef, useState } from "react";
import { HiOutlineCloudUpload, HiCheckCircle, HiOutlineCalendar } from "react-icons/hi";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import { validateOperationCompliance } from "../utils/onboardingValidation";
import { completeVendorOnboarding } from "../services/api";  // ADD THIS IMPORT

const OperationCompliance = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  // File refs for documents
  const govtIdRef = useRef(null);
  const professionalCertRef = useRef(null);
  const businessLicenseRef = useRef(null);
  const taxCertificateRef = useRef(null);
  const incCertificateRef = useRef(null);

  // : Use correct field names that match backend
  const fileRefs = {
    government_issued_id: govtIdRef,
    professional_body_certification: professionalCertRef,
    business_license: businessLicenseRef,
    tax_certificate: taxCertificateRef,
    incorporation_cert: incCertificateRef,
  };

  const showError = (field) => touched[field] && errors[field];

  const handleReviewClick = async () => {  
    console.log("=== OPERATIONS & COMPLIANCE: Review Click ===");
    console.log("Documents in formData:", {
      government_issued_id: !!formData.documents?.government_issued_id,
      government_issued_id_expiry: formData.documents?.government_issued_id_expiry,
      business_license: !!formData.documents?.business_license,
      business_license_expiry: formData.documents?.business_license_expiry,
      tax_certificate: !!formData.documents?.tax_certificate,
      tax_certificate_expiry: formData.documents?.tax_certificate_expiry,
      incorporation_cert: !!formData.documents?.incorporation_cert,
    });

    // FIRST: Save the documents to backend
    setIsLoading(true);
    try {
      console.log("Saving documents to backend...");
      await completeVendorOnboarding(formData);
      console.log("Documents saved successfully!");
    } catch (error) {
      console.error("Failed to save documents:", error);
      setSubmitError("Failed to save documents. Please try again.");
      setIsLoading(false);
      return;
    }

    // THEN: Validate and move to next step
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

    // Merge formData with documents for validation
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
    }
    
    setIsLoading(false);
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`File uploaded: ${field} = ${file.name}`);

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
    // Get expiry from documents object
    const expiryValue = formData.documents?.[`${field}_expiry`] || "";
    const hasExpiryError = showError(`${field}_expiry`) && errors[`${field}_expiry`];

    return (
      <div className="border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
        <div className="mb-1.5">
          <label className="text-[10px] font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {description && (
            <p className="text-[8px] text-gray-500 mt-0.5">{description}</p>
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
                      {file.name.length > 25 ? file.name.substring(0, 22) + "..." : file.name}
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

          {showExpiry && (
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
                <span className="text-red-500 text-[7px] font-bold mt-0.5 block">{errors[`${field}_expiry`]}</span>
              )}
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

      {submitError && (
        <div className="mb-2 p-1 bg-red-50 border border-red-200 rounded-md">
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
          label="Professional Certification"
          field="professional_body_certification"
          description="Optional: PRC, CPA, Engineering"
          required={false}
          showExpiry={true}
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
          label="Incorporation Certificate"
          field="incorporation_cert"
          description="Certificate of incorporation"
          required={true}
          showExpiry={false}
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
          {isLoading ? "Saving..." : "Review All"}
        </button>
      </div>
    </div>
  );
};

export default OperationCompliance;