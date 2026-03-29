import React, { useRef, useState } from "react";
import {
  HiOutlineCloudUpload,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import ReviewPhase from "./Review all details";
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import { validateOperationCompliance } from "../utils/operationComplianceValidation";
import { submitVendorApplication } from "../services/api";

const OperationCompliance = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [errors, setErrors] = useState({}); // Local state for validation errors

  const incorporationRef = useRef(null);
  const taxRef = useRef(null);
  const idRef = useRef(null);
  const countryIdRef = useRef(null);
  const licenseRef = useRef(null);

  const fileRefs = {
    incorporation_cert: incorporationRef,
    tax_certificate: taxRef,
    government_issued_id: idRef,
    country_issued_id: countryIdRef,
    business_license: licenseRef,
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      await submitVendorApplication(formData);

      // 1. Mark as submitted so the success screen shows
      // 2. Move to step 6 to trigger the final checkmark in sidebar
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: { isSubmitted: true } });
      dispatch({ type: ACTIONS.SET_STEP, payload: 6 });
    } catch (error) {
      console.error("Registration Error:", error);

      const apiData = error.response?.data || {};
      const serverErrors = apiData.errors;
      const serverMessage =
        apiData.message || apiData.detail || apiData.error || error.message;

      if (
        serverErrors &&
        typeof serverErrors === "object" &&
        Object.keys(serverErrors).length > 0
      ) {
        const firstField = Object.keys(serverErrors)[0];
        const fieldError = Array.isArray(serverErrors[firstField])
          ? serverErrors[firstField][0]
          : serverErrors[firstField];
        alert(`Submission Error: ${fieldError || serverMessage}`);
      } else if (Array.isArray(serverErrors) && serverErrors.length > 0) {
        alert(`Submission Error: ${serverErrors[0]}`);
      } else if (serverMessage) {
        alert(`Submission Error: ${serverMessage}`);
      } else {
        alert(
          "Something went wrong. Please check your connection or try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logic to handle the "Review" button click
  const handleReviewClick = () => {
    // We combine the base formData and the documents object
    // so the validator can see everything in one flat object
    const dataToValidate = {
      ...formData,
      ...(formData.documents || {}),
    };

    const validationErrors = validateOperationCompliance(dataToValidate);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // This will now trigger the red borders/icons on the Business License card too
    } else {
      setErrors({});
      setShowReview(true);
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear error for this field specifically when a file is picked
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

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

  const UploadCard = ({ label, field }) => {
    const file = formData.documents?.[field];
    const isUploaded = !!file;
    const hasError = !!errors[field];

    return (
      <div
        onClick={() => fileRefs[field]?.current?.click()}
        className={`upload-card relative p-3 min-h-[110px] h-auto py-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center
        ${
          isUploaded
            ? "border-green-500 bg-green-50"
            : hasError
              ? "border-red-400 bg-red-50"
              : "border-gray-200 hover:border-[#F2B53D] bg-white shadow-sm"
        }`}
      >
        <input
          type="file"
          ref={fileRefs[field]}
          onChange={(e) => handleFileChange(field, e)}
          className="hidden"
          accept=".pdf,.jpg,.png"
        />

        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 
          ${isUploaded ? "bg-green-100" : hasError ? "bg-red-100" : "bg-[#FFF8ED]"}`}
        >
          {isUploaded ? (
            <HiCheckCircle className="text-green-600" size={18} />
          ) : hasError ? (
            <HiExclamationCircle className="text-red-500" size={18} />
          ) : (
            <HiOutlineCloudUpload className="text-[#F2B53D]" size={18} />
          )}
        </div>

        <span
          className={`text-[11px] font-bold leading-tight ${hasError ? "text-red-600" : "text-gray-700"}`}
        >
          {label}
        </span>
        <span className="text-[9px] text-gray-400 mt-1">
          {isUploaded
            ? file.name.substring(0, 12) + "..."
            : hasError
              ? errors[field]
              : "PDF, PNG or JPG"}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full animate-fadeIn pb-4">
      {!showReview ? (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#FFF8ED] rounded-xl flex items-center justify-center shrink-0">
              <HiOutlineCloudUpload className="text-[#F2B53D]" size={22} />
            </div>
            <div>
              <h3 className="font-black text-[17px] text-gray-900 leading-tight">
                Compliance & Documents
              </h3>
              <p className="text-[12px] text-gray-500">
                Upload your business credentials.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-2">
            <div
              className={`p-3 rounded-xl border transition-colors ${errors.opening_time ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}
            >
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                Opening Time
              </p>
              <input
                type="time"
                value={formData.opening_time || ""}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, opening_time: null }));
                  dispatch({
                    type: ACTIONS.UPDATE_FORM,
                    payload: { opening_time: e.target.value },
                  });
                }}
                className="bg-transparent font-bold text-gray-800 outline-none w-full text-sm"
              />
            </div>
            <div
              className={`p-3 rounded-xl border transition-colors ${errors.closing_time ? "border-red-300 bg-red-50" : "bg-gray-50 border-gray-100"}`}
            >
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">
                Closing Time
              </p>
              <input
                type="time"
                value={formData.closing_time || ""}
                onChange={(e) => {
                  setErrors((prev) => ({ ...prev, closing_time: null }));
                  dispatch({
                    type: ACTIONS.UPDATE_FORM,
                    payload: { closing_time: e.target.value },
                  });
                }}
                className="bg-transparent font-bold text-gray-800 outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="upload-grid grid grid-cols-3 gap-3 mb-3">
            <UploadCard label="Govt Issued ID" field="government_issued_id" />
            <UploadCard label="Country Issued ID" field="country_issued_id" />
            <UploadCard label="Business License" field="business_license" />
            <UploadCard label="Tax Certificate" field="tax_certificate" />
            <UploadCard label="Inc. Certificate" field="incorporation_cert" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
              className="flex-1 h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full text-sm hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleReviewClick}
              className="flex-1 h-11 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg text-sm hover:bg-[#e0a630] transition-all"
            >
              Review All Details
            </button>
          </div>
        </>
      ) : (
        <ReviewPhase
          formData={formData}
          onEdit={() => setShowReview(false)}
          onSubmit={handleFinalSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default OperationCompliance;
