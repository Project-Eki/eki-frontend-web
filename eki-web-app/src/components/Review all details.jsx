import { HiCheckCircle, HiX } from "react-icons/hi";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import Flag from "react-world-flags";

// Register the locale for the country names
countries.registerLocale(enLocale);

const ReviewPhase = ({ formData, onEdit, onSubmit, isLoading }) => {
  // Translate the ISO code (e.g., 'UG') to full name (e.g., 'Uganda')
  const countryName = countries.getName(formData.country, "en") || formData.country;

  // Safe address rendering (removing country from here so we can show it separately with a flag)
  const streetAndCity = [formData.address, formData.city]
    .filter(Boolean)
    .join(", ");

  const documents = Object.entries(formData.documents || {}).filter(([_, file]) => file);

  const ReviewSection = ({ title, children }) => (
    <div className="border-b border-gray-100 pb-4 last:border-0 pt-4 first:pt-0">
      <p className="text-[10px] font-black text-[#F2B53D] uppercase tracking-widest mb-3 font-display">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-4 text-[13px]">{children}</div>
    </div>
  );

  const ReviewItem = ({ label, value, colSpan = false, children }) => (
    <div className={colSpan ? "col-span-2" : ""}>
      <p className="text-gray-400 block mb-0.5 font-sans">{label}</p>
      {children ? (
        children
      ) : (
        <span className="font-bold text-gray-800 font-sans">{value || "—"}</span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={!isLoading ? onEdit : null}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white border-radius:32px; shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">
        
        {/* Sticky Header */}
        <div className="bg-gray-50 p-6 flex justify-between items-center border-b border-gray-100 shrink-0">
          <div>
            <h4 className="font-black text-[22px] text-gray-900 leading-none font-display">Final Review</h4>
            <p className="text-[14px] text-gray-500 font-medium mt-1 font-sans">Verify your details before submission</p>
          </div>
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <ReviewSection title="Business Identity">
            <ReviewItem label="Business Name" value={formData.business_name} />
            <ReviewItem label="Business Type" value={formData.business_type} />
            <ReviewItem label="Category" value={formData.business_category} />
            <ReviewItem label="Tax ID / Reg No." value={formData.tax_id || formData.registration_number} />
          </ReviewSection>

          <ReviewSection title="Contact & Location">
            <ReviewItem label="Phone" value={formData.business_phone} />
            <ReviewItem label="Email" value={formData.business_email} />
            <ReviewItem label="Address" value={streetAndCity} />
            
            {/* New Country Field with Flag */}
            <ReviewItem label="Country of Operation">
              <div className="flex items-center gap-2 mt-1">
                <Flag code={formData.country} className="w-5 h-3.5 rounded-sm object-cover shadow-sm" />
                <span className="font-bold text-gray-800 font-sans">{countryName}</span>
              </div>
            </ReviewItem>
          </ReviewSection>

          <ReviewSection title="Operations & Docs">
            <ReviewItem 
              label="Daily Hours" 
              value={formData.opening_time && formData.closing_time ? `${formData.opening_time} - ${formData.closing_time}` : null} 
            />
            <div className="col-span-2 mt-2">
              <p className="text-gray-400 mb-2 font-sans">Files Attached</p>
              {documents.length === 0 ? (
                <span className="text-gray-400 text-[11px] font-sans italic">No documents uploaded</span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {documents.map(([key]) => (
                    <div key={key} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-100 text-[11px] font-bold uppercase font-sans">
                      <HiCheckCircle size={14} /> {key.replace(/_/g, " ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ReviewSection>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex gap-4">
            <button
              onClick={onEdit}
              disabled={isLoading}
              className="flex-1 h-12 border-2 border-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all font-display"
            >
              Edit Details
            </button>
            <button
              onClick={onSubmit}
              disabled={isLoading}
              className="flex-1 h-12 bg-[#F2B53D] hover:bg-[#d9a236] text-white font-bold rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:shadow-none font-display"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Complete Submission</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPhase;