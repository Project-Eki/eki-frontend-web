import React, { useState } from "react";
import {
  HiCheckCircle,
  HiOutlinePencil,
  HiOutlinePhone,
  HiXCircle,
} from "react-icons/hi";
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

  const countryName =
    countries.getName(formData.country, "en") || formData.country;

  const documents = Object.entries(formData.documents || {}).filter(
    ([_, file]) => file,
  );

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

    const businessIdentityFields = [
      "business_name",
      "business_type",
      "business_category",
      "owner_full_name",
      "registration_number",
      "tax_id",
      "business_description",
    ];

    const requiredContactFields = [
      "business_phone",
      "country",
      "city",
      "opening_time",
      "closing_time",
    ];

    const allRequiredFields = [...businessIdentityFields, ...requiredContactFields];

    const missingFields = allRequiredFields.filter((field) => {
      const value = formData[field];
      if (Array.isArray(value)) return value.length === 0;
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      setSubmitError(`Missing required fields: ${missingFields.join(", ")}`);
      setIsLoading(false);
      return;
    }

    const requiredDocs = [
      "government_issued_id",
      "business_license",
      "tax_certificate",
      "incorporation_cert",
    ];

    const missingDocs = requiredDocs.filter((doc) => {
      const file = formData.documents?.[doc];
      return !(file instanceof File);
    });

    if (missingDocs.length > 0) {
      setSubmitError(`Missing required documents: ${missingDocs.join(", ")}`);
      setIsLoading(false);
      return;
    }

    const requiredExpiryDates = [
      "government_issued_id_expiry",
      "business_license_expiry",
      "tax_certificate_expiry",
    ];

    const missingExpiries = requiredExpiryDates.filter(
      (expiry) => !formData.documents?.[expiry],
    );

    if (missingExpiries.length > 0) {
      setSubmitError(`Missing expiry dates for: ${missingExpiries.join(", ")}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await submitVendorApplication(formData);
      console.log("Submit response:", response);
      dispatch({ type: ACTIONS.UPDATE_FORM, payload: { isSubmitted: true } });
      onSubmitSuccess();
    } catch (error) {
      console.error("Submission Error:", error);
      if (error.response) console.error("Error data:", error.response.data);
      const apiData = error.response?.data || {};
      const serverMessage =
        apiData.message || apiData.detail || apiData.error || error.message;
      setSubmitError(serverMessage || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Section wrapper ──
  // Section title matches ContactLocation's section labels: text-[10px] font-semibold
  const ReviewSection = ({ title, children }) => (
    <div className="border-b border-gray-100 pb-2.5 last:border-0 pt-2.5 first:pt-0">
      <p className="text-[10px] font-black text-[#F2B53D] uppercase tracking-wider mb-1.5">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
        {children}
      </div>
    </div>
  );

  // ── Individual field ──
  // Label  → text-[10px] font-semibold  (same as ContactLocation labels)
  // Value  → text-[11px]                (same as ContactLocation inputs)
  const ReviewItem = ({ label, value, colSpan = false, children, fieldName }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-[10px] font-semibold text-gray-700 mb-0.5">{label}</p>
      {children ? (
        children
      ) : (
        <>
          <span
            className={`text-[11px] font-medium leading-snug block truncate ${
              fieldErrors[fieldName] ? "text-red-600" : "text-gray-800"
            }`}
          >
            {value || "—"}
          </span>
          {fieldErrors[fieldName] && (
            <p className="text-red-500 text-[9px] mt-0.5">
              {Array.isArray(fieldErrors[fieldName])
                ? fieldErrors[fieldName][0]
                : fieldErrors[fieldName]}
            </p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="w-full">

      {/* ── Header ── matches ContactLocation's h3 text-[12px] + p text-[9px] */}
      <div className="mb-2">
        <h2 className="text-[12px] font-bold text-gray-800">Review & Submit</h2>
        <p className="text-[9px] text-gray-500 mt-0.5">
          Verify your details before submitting
        </p>
      </div>

      {/* ── Error Banner ── */}
      {submitError && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <HiXCircle className="text-red-500 shrink-0 mt-0.5" size={14} />
            <div>
              <p className="text-[11px] font-semibold text-red-600">Submission Failed</p>
              <p className="text-[10px] text-red-500 mt-0.5">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Field Errors Summary ── */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="mb-3 p-2.5 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-[10px] font-semibold text-yellow-700 mb-1">
            Please fix these fields:
          </p>
          <ul className="list-disc list-inside text-[9px] text-yellow-600 space-y-0.5">
            {Object.entries(fieldErrors).map(([field, errors]) => (
              <li key={field}>
                <span className="font-medium">{field.replace(/_/g, " ")}:</span>{" "}
                {Array.isArray(errors) ? errors.join(", ") : errors}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Review Sections ── */}
      <div className="space-y-0">

        {/* Business Identity */}
        <ReviewSection title="Business Identity">
          <ReviewItem label="Business Name"    value={formData.business_name}       fieldName="business_name" />
          <ReviewItem label="Business Type"    value={formData.business_type}       fieldName="business_type" />
          <ReviewItem
            label="Category"
            value={
              Array.isArray(formData.business_category)
                ? formData.business_category.join(", ")
                : formData.business_category
            }
            fieldName="business_category"
          />
          <ReviewItem label="Owner Name"   value={formData.owner_full_name}     fieldName="owner_full_name" />
          <ReviewItem label="Tax ID"       value={formData.tax_id}              fieldName="tax_id" />
          <ReviewItem label="Reg Number"   value={formData.registration_number} fieldName="registration_number" />
          <ReviewItem
            label="Description"
            value={formData.business_description?.substring(0, 60)}
            colSpan
            fieldName="business_description"
          />
        </ReviewSection>

        {/* Contact & Location */}
        <ReviewSection title="Contact & Location">
          <ReviewItem label="Phone"    value={formData.business_phone}   fieldName="business_phone" />
          <ReviewItem label="Email"    value={formData.email}            fieldName="email" />
          <ReviewItem label="Address"  value={formData.address || "—"}  fieldName="address" />
          <ReviewItem label="City"     value={formData.city}             fieldName="city" />
          <ReviewItem label="Landmark" value={formData.landmark || "—"} fieldName="landmark" />
          <ReviewItem label="Zip Code" value={formData.zip_code || "—"} fieldName="zip_code" />

          {/* Country with flag */}
          <ReviewItem label="Country" fieldName="country">
            <div className="flex items-center gap-1 mt-0.5">
              <Flag
                code={formData.country}
                className="w-3.5 h-2.5 rounded-sm object-cover shadow-sm"
              />
              <span
                className={`text-[11px] font-medium ${
                  fieldErrors.country ? "text-red-600" : "text-gray-800"
                }`}
              >
                {countryName}
              </span>
              {fieldErrors.country && (
                <p className="text-red-500 text-[9px] mt-0.5">{fieldErrors.country}</p>
              )}
            </div>
          </ReviewItem>

          <ReviewItem
            label="Operating Hours"
            value={`${formData.opening_time || "—"} – ${formData.closing_time || "—"}`}
            fieldName="opening_time"
          />
        </ReviewSection>

        {/* Branch Locations (conditional) */}
        {formData.branch_locations && formData.branch_locations.length > 0 && (
          <ReviewSection title="Branch Locations">
            <div className="col-span-2 space-y-1.5">
              {formData.branch_locations.map((branch, idx) => (
                <div
                  key={idx}
                  className="text-[11px] text-gray-700 border-l-2 border-[#F2B53D] pl-2.5"
                >
                  <div className="flex items-center gap-1.5">
                    <HiOutlineBuildingStorefront size={11} className="text-gray-500 shrink-0" />
                    <span className="font-semibold">{branch.address}</span>
                    {branch.city && <span className="text-gray-500">, {branch.city}</span>}
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlinePhone size={9} className="text-gray-400" />
                      <span className="text-gray-500 text-[10px]">{branch.phone}</span>
                    </div>
                  )}
                  {branch.landmark && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlineMapPin size={9} className="text-gray-400" />
                      <span className="text-gray-500 text-[10px]">{branch.landmark}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ReviewSection>
        )}

        {/* Documents */}
        <div className="pt-2.5 pb-1">
          <p className="text-[10px] font-black text-[#F2B53D] uppercase tracking-wider mb-1.5">
            Documents
          </p>
          <div className="flex flex-wrap gap-1">
            {documents.length === 0 ? (
              <span className="text-gray-400 text-[11px] italic">No documents uploaded</span>
            ) : (
              documents.map(([key]) => (
                <div
                  key={key}
                  className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100 text-[10px] font-semibold"
                >
                  <HiCheckCircle size={10} />
                  {getDisplayName(key)}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ── Buttons — mobile-friendly tap targets ── */}
      <div className="flex justify-end items-center gap-2 mt-5">

        <button
          onClick={onBack}
          disabled={isLoading}
          className="
            flex items-center justify-center gap-1.5
            h-9 px-4 sm:h-8 sm:px-3
            rounded-full
            text-gray-500 font-semibold
            text-[11px]
            border border-gray-200
            hover:bg-gray-50
            disabled:opacity-50
            transition-all
            min-w-[72px]
          "
        >
          <HiOutlinePencil size={11} />
          Edit
        </button>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="
            flex items-center justify-center gap-1.5
            h-9 px-5 sm:h-8 sm:px-4
            rounded-full
            text-white font-bold
            text-[11px]
            bg-[#D99201] hover:bg-[#e0a630]
            disabled:opacity-50
            transition-all
            min-w-[88px]
          "
        >
          {isLoading ? (
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Submit"
          )}
        </button>

      </div>
    </div>
  );
};

export default ReviewAndSubmit;