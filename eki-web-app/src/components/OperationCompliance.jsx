import React, { useRef, useState } from 'react';
import { HiOutlineClock, HiOutlineCloudUpload, HiCheckCircle } from "react-icons/hi";
import { validateOperationCompliance } from "../utils/onboardingValidation";
import { submitOperationCompliance } from "../services/api";

const OperationCompliance = ({ onFinish, onBack, formData, updateFormData }) => {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const regInputRef = useRef(null);
  const idInputRef = useRef(null);

  const handleUpdate = (field, value) => {
    const docFields = ['incorporation_cert', 'national_id', 'business_license', 'tax_certificate'];
    const updatedData = docFields.includes(field)
      ? { ...formData, documents: { ...formData.documents, [field]: value } }
      : { ...formData, [field]: value };

    updateFormData(docFields.includes(field)
      ? { documents: { ...formData.documents, [field]: value } }
      : { [field]: value });

    setErrors(validateOperationCompliance(updatedData));
  };

  const handleSubmit = async () => {
    const validationErrors = validateOperationCompliance(formData);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const data = await submitOperationCompliance({
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          documents: formData.documents,
        });
        console.log("Operation Compliance Saved:", data);
        onFinish();
      } catch (error) {
        console.error("Compliance Error:", error.response?.data);
        alert(error.response?.data?.detail || "Submission failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full animate-fadeIn pb-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
           <HiOutlineClock className="text-[#F2B53D]" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[17px] text-gray-800 leading-tight">Compliance & Hours</h3>
          <p className="text-[12px] text-gray-500">Finalize your profile and upload documents.</p>
        </div>
      </div>

      {/* Business Hours */}
      <div className={`mb-6 flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border ${errors.opening_time || errors.closing_time ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100'} gap-3 transition-all`}>
        <label className="text-[13px] font-bold text-gray-700">Business Hours (Mon-Fri)</label>
        <div className="flex items-center gap-2">
          <input type="time" value={formData.opening_time} onChange={(e) => handleUpdate('opening_time', e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" />
          <span className="text-gray-400 text-xs font-bold">to</span>
          <input type="time" value={formData.closing_time} onChange={(e) => handleUpdate('closing_time', e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" />
        </div>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <input type="file" ref={regInputRef} hidden onChange={(e) => handleUpdate('incorporation_cert', e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
        <input type="file" ref={idInputRef} hidden onChange={(e) => handleUpdate('national_id', e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />

        {/* Reg Doc Box */}
        <div 
          onClick={() => regInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
            ${formData.documents.incorporation_cert ? 'border-green-500 bg-green-50' : errors.incorporation_cert ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          {formData.documents.incorporation_cert ? <HiCheckCircle className="text-green-500 mb-1" size={28} /> : <HiOutlineCloudUpload className={`${errors.incorporation_cert ? 'text-red-400' : 'text-gray-400'} mb-1`} size={24} />}
          <p className={`text-[13px] font-bold ${errors.incorporation_cert ? 'text-red-500' : 'text-gray-700'}`}>Registration Doc</p>
          <p className="text-[10px] text-gray-400 text-center">{formData.documents.incorporation_cert ? formData.documents.incorporation_cert.name : errors.incorporation_cert || 'PDF or JPG (max 5MB)'}</p>
        </div>

        {/* ID Proof Box */}
        <div 
          onClick={() => idInputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
            ${formData.documents.national_id ? 'border-green-500 bg-green-50' : errors.national_id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
        >
          {formData.documents.national_id ? <HiCheckCircle className="text-green-500 mb-1" size={28} /> : <HiOutlineCloudUpload className={`${errors.national_id ? 'text-red-400' : 'text-gray-400'} mb-1`} size={24} />}
          <p className={`text-[13px] font-bold ${errors.national_id ? 'text-red-500' : 'text-gray-700'}`}>Owner ID Proof</p>
          <p className="text-[10px] text-gray-400 text-center">{formData.documents.national_id ? formData.documents.national_id.name : errors.national_id || 'PDF or JPG (max 5MB)'}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 w-full">
        <button onClick={onBack} disabled={isLoading} className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px] disabled:opacity-50">Back</button>
        <button onClick={handleSubmit} disabled={isLoading} className={`flex-1 max-w-[140px] h-11 text-white font-bold rounded-full shadow-lg transition-all text-[14px] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F2B53D] hover:bg-[#e0a630]'}`}>
          {isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default OperationCompliance;
// import React, { useRef } from 'react';
// import { HiOutlineClock, HiOutlineCloudUpload, HiCheckCircle } from "react-icons/hi";

// const OperationCompliance = ({ onFinish, onBack, formData, updateFormData }) => {
//   const regInputRef = useRef(null);
//   const idInputRef = useRef(null);

//   const handleTimeChange = (field, value) => {
//     updateFormData({ [field]: value });
//   };

//   const handleFileChange = (documentType, file) => {
//     if (!file) return;
//     // Update the nested documents object in our master state
//     updateFormData({
//       documents: {
//         ...formData.documents,
//         [documentType]: file
//       }
//     });
//   };

//   return (
//     <div className="w-full animate-fadeIn pb-4">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
//            <HiOutlineClock className="text-[#F2B53D]" size={20} />
//         </div>
//         <div>
//           <h3 className="font-bold text-[17px] text-gray-800 leading-tight">Compliance & Hours</h3>
//           <p className="text-[12px] text-gray-500">Finalize your profile and upload documents.</p>
//         </div>
//       </div>

//       {/* Business Hours Section */}
//       <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3">
//         <label className="text-[13px] font-bold text-gray-700">Business Hours (Mon-Fri)</label>
//         <div className="flex items-center gap-2">
//           <input 
//             type="time" 
//             value={formData.opening_time} 
//             onChange={(e) => handleTimeChange('opening_time', e.target.value)}
//             className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" 
//           />
//           <span className="text-gray-400 text-xs font-bold">to</span>
//           <input 
//             type="time" 
//             value={formData.closing_time} 
//             onChange={(e) => handleTimeChange('closing_time', e.target.value)}
//             className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" 
//           />
//         </div>
//       </div>

//       {/* Document Upload Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//         {/* Hidden Inputs */}
//         <input 
//           type="file" 
//           ref={regInputRef} 
//           hidden 
//           onChange={(e) => handleFileChange('incorporation_cert', e.target.files[0])} 
//           accept=".pdf,.jpg,.jpeg,.png"
//         />
//         <input 
//           type="file" 
//           ref={idInputRef} 
//           hidden 
//           onChange={(e) => handleFileChange('national_id', e.target.files[0])} 
//           accept=".pdf,.jpg,.jpeg,.png"
//         />

//         {/* Registration Doc Box */}
//         <div 
//           onClick={() => regInputRef.current.click()}
//           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
//             ${formData.documents.incorporation_cert ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
//         >
//           {formData.documents.incorporation_cert ? (
//             <HiCheckCircle className="text-green-500 mb-1" size={28} />
//           ) : (
//             <HiOutlineCloudUpload className="text-gray-400 mb-1" size={24} />
//           )}
//           <p className="text-[13px] font-bold text-gray-700 text-center">Registration Doc</p>
//           <p className="text-[10px] text-gray-400">
//             {formData.documents.incorporation_cert ? formData.documents.incorporation_cert.name : 'PDF or JPG (max 5MB)'}
//           </p>
//         </div>

//         {/* ID Proof Box */}
//         <div 
//           onClick={() => idInputRef.current.click()}
//           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
//             ${formData.documents.national_id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
//         >
//           {formData.documents.national_id ? (
//             <HiCheckCircle className="text-green-500 mb-1" size={28} />
//           ) : (
//             <HiOutlineCloudUpload className="text-gray-400 mb-1" size={24} />
//           )}
//           <p className="text-[13px] font-bold text-gray-700 text-center">Owner ID Proof</p>
//           <p className="text-[10px] text-gray-400">
//              {formData.documents.national_id ? formData.documents.national_id.name : 'PDF or JPG (max 5MB)'}
//           </p>
//         </div>
//       </div>

//       {/* Buttons */}
//       <div className="flex items-center justify-center gap-4 w-full">
//         <button 
//           onClick={onBack}
//           className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px]"
//         >
//           Back
//         </button>
//         <button 
//           onClick={onFinish} 
//           className="flex-1 max-w-[140px] h-11 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all text-[14px]"
//         >
//           Submit
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OperationCompliance;