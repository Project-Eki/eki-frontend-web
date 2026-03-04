import React, { useState } from 'react';
import { HiOutlineBriefcase } from "react-icons/hi";
import { validateBusinessIdentity } from "../utils/onboardingValidation"; 

const BusinessIdentity = ({ onNext, onBack, formData, updateFormData }) => {
  const [errors, setErrors] = useState({}); 

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    const validationErrors = validateBusinessIdentity({ ...formData, [field]: value });
    setErrors(validationErrors);
  };

  const handleContinue = () => {
    const validationErrors = validateBusinessIdentity(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
          <HiOutlineBriefcase className="text-[#F2B53D]" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[16px] text-gray-800">Business Identity</h3>
          <p className="text-[12px] text-gray-500">Provide legal details as they appear on official documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        
        {/* Business Name */}
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Legal Business Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.business_name}
              onChange={(e) => handleChange('business_name', e.target.value)}
              placeholder="e.g. Global Tech Solutions Ltd." 
              className={`w-full h-11 pl-4 pr-16 border ${errors.business_name ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`} 
            />
            {errors.business_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.business_name}
              </span>
            )}
          </div>
        </div>

        {/* Business Type */}
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Type</label>
          <div className="relative">
            <select 
              value={formData.business_type}
              onChange={(e) => handleChange('business_type', e.target.value)}
              className={`w-full h-11 pl-4 pr-10 border ${errors.business_type ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer appearance-none`}
            >
              <option value="">Select type</option>
              <option value="RETAIL">Retailer</option>
              <option value="WHOLESALE">Wholesaler</option>
              <option value="MANUFACTURER">Manufacturer</option>
            </select>
            {/* Positioning error slightly to the left of the dropdown arrow */}
            {errors.business_type && (
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.business_type}
              </span>
            )}
          </div>
        </div>

        {/* Owner Name */}
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-600 mb-1 ml-1">Owner Full Name</label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.owner_full_name}
              onChange={(e) => handleChange('owner_full_name', e.target.value)}
              placeholder="Enter full legal name" 
              className={`w-full h-11 pl-4 pr-16 border ${errors.owner_full_name ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`} 
            />
            {errors.owner_full_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.owner_full_name}
              </span>
            )}
          </div>
        </div>

        {/* Registration Number */}
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Registration Number</label>
          <div className="relative">
            <input 
              type="text" 
              value={formData.registration_number}
              onChange={(e) => handleChange('registration_number', e.target.value)}
              placeholder="RC / BN Number" 
              className={`w-full h-11 pl-4 pr-16 border ${errors.registration_number ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none`} 
            />
            {errors.registration_number && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.registration_number}
              </span>
            )}
          </div>
        </div>

        {/* Tax ID (Optional) */}
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Tax ID (TIN)</label>
          <input 
            type="text" 
            value={formData.tax_id}
            onChange={(e) => handleChange('tax_id', e.target.value)}
            placeholder="VAT / TIN Number" 
            className="h-11 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" 
          />
        </div>

        {/* Business Description */}
        <div className="flex flex-col md:col-span-2">
          <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Description</label>
          <textarea 
            value={formData.business_description}
            onChange={(e) => handleChange('business_description', e.target.value)}
            placeholder="Describe what you sell or your business mission..." 
            className="h-16 p-3 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none resize-none"
          ></textarea>
        </div>
      </div>

      <div className="w-full flex justify-center items-center gap-4 mt-6">
        <button onClick={onBack} className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-500 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px]">
          Back
        </button>
        <button onClick={handleContinue} className="flex-1 max-w-[200px] h-11 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg hover:bg-[#e0a630] transition-all text-[14px]">
          Continue
        </button>
      </div>
    </div>
  );
};

export default BusinessIdentity;


// import React, { useState } from 'react'; // Added { useState }
// import { HiOutlineBriefcase } from "react-icons/hi";
// // Import your validation function (Assuming it's in your validation.js file)
// import { validateBusinessIdentity } from "../utils/onboardingValidation"; 

// const BusinessIdentity = ({ onNext, onBack, formData, updateFormData }) => {
//   const [errors, setErrors] = useState({}); 

//   const handleChange = (field, value) => {
//     updateFormData({ [field]: value });
    
//     // Validate as they type
//     const validationErrors = validateBusinessIdentity({ ...formData, [field]: value });
//     setErrors(validationErrors);
//   };

//   const handleContinue = () => {
//     const validationErrors = validateBusinessIdentity(formData);
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       onNext();
//     }
//   };

//   return (
//     <div className="w-full animate-fadeIn">
//       <div className="flex items-center gap-3 mb-4">
//         <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
//           <HiOutlineBriefcase className="text-[#F2B53D]" size={20} />
//         </div>
//         <div>
//           <h3 className="font-bold text-[16px] text-gray-800">Business Identity</h3>
//           <p className="text-[12px] text-gray-500">Provide legal details as they appear on official documents.</p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
//         {/* Business Name */}
//         <div className="flex flex-col">
//           <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Legal Business Name</label>
//           <input 
//             type="text" 
//             value={formData.business_name}
//             onChange={(e) => handleChange('business_name', e.target.value)}
//             placeholder="e.g. Global Tech Solutions Ltd." 
//             // FIXED: Backticks and Curly Braces
//             className={`h-11 px-4 border ${errors.business_name ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`} 
//           />
//           {errors.business_name && <span className="text-red-500 text-[10px] mt-1 ml-1">{errors.business_name}</span>}
//         </div>

//         {/* Business Type */}
//         <div className="flex flex-col">
//           <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Type</label>
//           <select 
//             value={formData.business_type}
//             onChange={(e) => handleChange('business_type', e.target.value)}
            
//             className={`h-11 px-4 border ${errors.business_type ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer`}
//           >
//             <option value="">Select type</option>
//             <option value="RETAIL">Retailer</option>
//             <option value="WHOLESALE">Wholesaler</option>
//             <option value="MANUFACTURER">Manufacturer</option>
//           </select>
//           {errors.business_type && <span className="text-red-500 text-[10px] mt-1 ml-1">{errors.business_type}</span>}
//         </div>

//         {/* Owner Name */}
//         <div className="flex flex-col">
//           <label className="text-[13px] font-bold text-gray-600 mb-1 ml-1">Owner Full Name</label>
//           <input 
//             type="text" 
//             value={formData.owner_full_name}
//             onChange={(e) => handleChange('owner_full_name', e.target.value)}
//             placeholder="Enter full legal name" 
//             className={`h-11 px-4 border ${errors.owner_full_name ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all`} 
//           />
//           {errors.owner_full_name && <span className="text-red-500 text-[10px] mt-1 ml-1">{errors.owner_full_name}</span>}
//         </div>

//         {/* Registration Number */}
//         <div className="flex flex-col">
//           <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Registration Number</label>
//           <input 
//             type="text" 
//             value={formData.registration_number}
//             onChange={(e) => handleChange('registration_number', e.target.value)}
//             placeholder="RC / BN Number" 
//             className={`h-11 px-4 border ${errors.registration_number ? 'border-red-400' : 'border-gray-200'} rounded-xl text-[14px] focus:border-[#F2B53D] outline-none`} 
//           />
//           {errors.registration_number && <span className="text-red-500 text-[10px] mt-1 ml-1">{errors.registration_number}</span>}
//         </div>

//         {/* Tax ID */}
//         <div className="flex flex-col">
//           <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Tax ID (TIN)</label>
//           <input 
//             type="text" 
//             value={formData.tax_id}
//             onChange={(e) => handleChange('tax_id', e.target.value)}
//             placeholder="VAT / TIN Number" 
//             className="h-11 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" 
//           />
//         </div>

//         {/* Business Description */}
//         <div className="flex flex-col md:col-span-2">
//           <label className="text-[13px] font-bold text-gray-700 mb-1 ml-1">Business Description</label>
//           <textarea 
//             value={formData.business_description}
//             onChange={(e) => handleChange('business_description', e.target.value)}
//             placeholder="Describe what you sell or your business mission..." 
//             className="h-16 p-3 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none resize-none"
//           ></textarea>
//         </div>
//       </div>

//       <div className="w-full flex justify-center items-center gap-4 mt-6">
//         <button onClick={onBack} className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-500 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px]">
//           Back
//         </button>
//         <button onClick={handleContinue} className="flex-1 max-w-[200px] h-11 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg hover:bg-[#e0a630] transition-all text-[14px]">
//           Continue
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BusinessIdentity;

