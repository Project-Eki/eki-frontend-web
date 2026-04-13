import React, { useRef, useState } from "react";
import { HiOutlineCloudUpload, HiCheckCircle, HiExclamationCircle, HiOutlineCalendar } from "react-icons/hi";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import { validateOperationCompliance } from "../utils/onboardingValidation";

const OperationCompliance = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState("");

  // File refs for 5 documents
  const govtIdRef = useRef(null);
  const professionalCertRef = useRef(null);
  const businessLicenseRef = useRef(null);
  const taxCertificateRef = useRef(null);
  const incCertificateRef = useRef(null);

  const fileRefs = {
    government_issued_id: govtIdRef,
    professional_certification: professionalCertRef,
    business_license: businessLicenseRef,
    tax_certificate: taxCertificateRef,
    incorporation_cert: incCertificateRef,
  };

  const showError = (field) => touched[field] && errors[field];

  const handleReviewClick = () => {
    setTouched({
      government_issued_id: true,
      government_issued_id_expiry: true,
      business_license: true,
      business_license_expiry: true,
      tax_certificate: true,
      tax_certificate_expiry: true,
      incorporation_cert: true,
    });

    const dataToValidate = {
      ...formData,
      ...(formData.documents || {})
    };

    const validationErrors = validateOperationCompliance(dataToValidate);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Go to Step 6 (Review & Submit)
      dispatch({ type: ACTIONS.SET_STEP, payload: 6 });
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

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
    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: { [field]: value },
    });
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const DocumentSection = ({ label, field, description, required = true, showExpiry = true }) => {
    const file = formData.documents?.[field];
    const isUploaded = !!file;
    const hasError = showError(field) && errors[field];
    const expiryValue = formData[`${field}_expiry`] || "";
    const hasExpiryError = showError(`${field}_expiry`) && errors[`${field}_expiry`];

    return (
      <div className="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
        {/* Header */}
        <div className="mb-2">
          <label className="text-[12px] font-semibold text-gray-800">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          {description && (
            <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
          )}
        </div>

        {/* Row with Upload Area and Expiry Date side by side */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          {/* Upload Area - Takes remaining space */}
          <div className="flex-1">
            <div
              onClick={() => fileRefs[field]?.current?.click()}
              className={`relative border-2 border-dashed rounded-xl cursor-pointer transition-all p-3 text-center
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
                    <HiCheckCircle className="text-green-600" size={24} />
                    <span className="text-[11px] font-medium text-green-600 mt-1">
                      {file.name.length > 30 ? file.name.substring(0, 27) + "..." : file.name}
                    </span>
                    <span className="text-[9px] text-gray-500 mt-0.5">Click to change</span>
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload className="text-[#F2B53D]" size={24} />
                    <span className="text-[11px] font-medium text-gray-600 mt-1">Click to upload or drag and drop</span>
                    <span className="text-[9px] text-gray-400 mt-0.5">PDF, PNG or JPG (max. 10MB)</span>
                  </>
                )}
              </div>
            </div>
            {hasError && !isUploaded && (
              <p className="text-red-500 text-[9px] font-bold mt-1">{errors[field]}</p>
            )}
          </div>

          {/* Expiry Date - On the right side for ALL documents that show expiry */}
          {showExpiry && (
            <div className="sm:w-[220px]">
              <label className="text-[10px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <HiOutlineCalendar size={11} />
                Expiry Date {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="date"
                value={expiryValue}
                onChange={(e) => handleExpiryChange(`${field}_expiry`, e.target.value)}
                className={`w-full h-8 px-3 bg-white border rounded-lg text-[11px] focus:border-[#F2B53D] outline-none ${
                  hasExpiryError ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {hasExpiryError && (
                <span className="text-red-500 text-[8px] font-bold mt-0.5 block">{errors[`${field}_expiry`]}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineCloudUpload className="text-[#F2B53D]" size={16} />
        </div>
        <div>
          <h3 className="font-bold text-[13px] text-gray-800">Operations & Compliance</h3>
          <p className="text-[10px] text-gray-500">Upload supporting documents for faster verification. Documents must be current (not expired) and clearly legible.</p>
        </div>
      </div>

      {/* Display submission error if any */}
      {submitError && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-[10px] font-medium">{submitError}</p>
        </div>
      )}

      {/* Document Sections - Single Column */}
      <div className="space-y-4 mb-4">
        {/* 1. Government Issued ID - Required with expiry */}
        <DocumentSection
          label="Government Issued ID"
          field="government_issued_id"
          description="Passport, Driver's License, National ID, or State ID"
          required={true}
          showExpiry={true}
        />

        {/* 2. Professional Body Certification - Optional with expiry */}
        <DocumentSection
          label="Professional Body Certification"
          field="professional_certification"
          description="Optional: PRC ID, CPA, Engineering, Medical, etc."
          required={false}
          showExpiry={true}
        />

        {/* 3. Business License - Required with expiry */}
        <DocumentSection
          label="Business License"
          field="business_license"
          description="Official business operating license"
          required={true}
          showExpiry={true}
        />

        {/* 4. Tax Certificate - Required with expiry */}
        <DocumentSection
          label="Tax Certificate"
          field="tax_certificate"
          description="TIN certificate or VAT registration"
          required={true}
          showExpiry={true}
        />

        {/* 5. Incorporation Certificate - Required (No Expiry) */}
        <DocumentSection
          label="Incorporation Certificate"
          field="incorporation_cert"
          description="Certificate of incorporation or registration"
          required={true}
          showExpiry={false}
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
          className="flex-1 max-w-[100px] h-7 rounded-full text-gray-500 font-semibold text-[11px] border border-gray-200 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <button
          onClick={handleReviewClick}
          className="flex-1 max-w-[120px] h-7 rounded-full text-white font-bold text-[11px] transition-all bg-[#D99201] hover:bg-[#e0a630]"
        >
          Review All
        </button>
      </div>
    </div>
  );
};

export default OperationCompliance;