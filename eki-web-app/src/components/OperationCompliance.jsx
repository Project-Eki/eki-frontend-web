import React, { useRef, useState } from "react";
import {
  HiOutlineClock,
  HiOutlineCloudUpload,
  HiCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineDocumentText
} from "react-icons/hi";
import ReviewPhase from "./Review all details"
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

const OperationCompliance = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Stable refs for file inputs
  const incorporationRef = useRef(null);
  const taxRef = useRef(null);
  const idRef = useRef(null);
  const licenseRef = useRef(null);

  const fileRefs = {
    incorporation_cert: incorporationRef,
    tax_certificate: taxRef,
    government_issued_id: idRef,
    business_license: licenseRef
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];

    if (!file) return;

    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: {
        documents: {
          ...(formData.documents || {}),
          [field]: file
        }
      }
    });
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      // Simulated API delay
      setTimeout(() => {
        setIsLoading(false);
        dispatch({ type: ACTIONS.NEXT_STEP });
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const truncateFileName = (name) => {
    if (!name) return "";
    return name.length > 20 ? name.substring(0, 20) + "..." : name;
  };

  const UploadCard = ({ label, field, icon: Icon }) => {
    const file = formData.documents?.[field];
    const isUploaded = !!file;

    return (
      <div
        onClick={() => fileRefs[field]?.current?.click()}
        className={`relative p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center text-center
        ${
          isUploaded
            ? "border-green-500 bg-green-50"
            : "border-gray-200 hover:border-[#F2B53D] bg-white"
        }`}
      >
        <input
          type="file"
          ref={fileRefs[field]}
          onChange={(e) => handleFileChange(field, e)}
          className="hidden"
          accept=".pdf,.jpg,.png"
        />

        {isUploaded ? (
          <HiCheckCircle className="text-green-500 mb-2" size={24} />
        ) : (
          <Icon className="text-gray-400 mb-2" size={24} />
        )}

        <span className="text-[12px] font-bold text-gray-700 leading-tight">
          {label}
        </span>

        <span className="text-[10px] text-gray-400 mt-1">
          {isUploaded
            ? truncateFileName(file.name)
            : "Upload PDF or Image"}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full animate-fadeIn pb-4">
      {!showReview ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#FFF8ED] rounded-xl flex items-center justify-center shrink-0">
              <HiOutlineCloudUpload className="text-[#F2B53D]" size={22} />
            </div>

            <div>
              <h3 className="font-black text-[18px] text-gray-900">
                Compliance & Documents
              </h3>

              <p className="text-[13px] text-gray-500 font-medium">
                Almost there! Upload your business credentials.
              </p>
            </div>
          </div>

          {/* Opening & Closing Time */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Opening Time
              </p>

              <input
                type="time"
                value={formData.opening_time || ""}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_FORM,
                    payload: { opening_time: e.target.value }
                  })
                }
                className="bg-transparent font-bold text-gray-800 outline-none w-full"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                Closing Time
              </p>

              <input
                type="time"
                value={formData.closing_time || ""}
                onChange={(e) =>
                  dispatch({
                    type: ACTIONS.UPDATE_FORM,
                    payload: { closing_time: e.target.value }
                  })
                }
                className="bg-transparent font-bold text-gray-800 outline-none w-full"
              />
            </div>
          </div>

          {/* Documents Upload */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <UploadCard
              label="Incorporation Cert."
              field="incorporation_cert"
              icon={HiOutlineDocumentText}
            />

            <UploadCard
              label="Tax Certificate"
              field="tax_certificate"
              icon={HiOutlineDocumentText}
            />

            <UploadCard
              label="National ID (Owner)"
              field="government_issued_id"
              icon={HiOutlineShieldCheck}
            />

            <UploadCard
              label="Business License"
              field="business_license"
              icon={HiOutlineDocumentText}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
              className="flex-1 h-12 border-2 border-gray-100 text-gray-400 font-bold rounded-full"
            >
              Back
            </button>

            <button
              onClick={() => setShowReview(true)}
              className="flex-[1] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg"
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




// import React, { useRef, useState } from 'react';
// import { HiOutlineClock, HiOutlineCloudUpload, HiCheckCircle } from "react-icons/hi";
// import { validateOperationCompliance } from "../utils/onboardingValidation";
// import { submitOperationCompliance } from "../services/api";

// const OperationCompliance = ({ onFinish, onBack, formData, updateFormData }) => {
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);
//   const regInputRef = useRef(null);
//   const idInputRef = useRef(null);

//   const handleUpdate = (field, value) => {
//     const docFields = ['incorporation_cert', 'national_id', 'business_license', 'tax_certificate'];
//     const updatedData = docFields.includes(field)
//       ? { ...formData, documents: { ...formData.documents, [field]: value } }
//       : { ...formData, [field]: value };

//     updateFormData(docFields.includes(field)
//       ? { documents: { ...formData.documents, [field]: value } }
//       : { [field]: value });

//     setErrors(validateOperationCompliance(updatedData));
//   };

//   const handleSubmit = async () => {
//     const validationErrors = validateOperationCompliance(formData);
//     setErrors(validationErrors);
//     if (Object.keys(validationErrors).length === 0) {
//       setIsLoading(true);
//       try {
//         const data = await submitOperationCompliance({
//           opening_time: formData.opening_time,
//           closing_time: formData.closing_time,
//           documents: formData.documents,
//         });
//         console.log("Operation Compliance Saved:", data);
//         onFinish();
//       } catch (error) {
//         console.error("Compliance Error:", error.response?.data);
//         alert(error.response?.data?.detail || "Submission failed. Please try again.");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="w-full animate-fadeIn pb-4">
//       <div className="flex items-center gap-3 mb-6">
//         <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
//            <HiOutlineClock className="text-[#F2B53D]" size={20} />
//         </div>
//         <div>
//           <h3 className="font-bold text-[17px] text-gray-800 leading-tight">Compliance & Hours</h3>
//           <p className="text-[12px] text-gray-500">Finalize your profile and upload documents.</p>
//         </div>
//       </div>

//       {/* Business Hours */}
//       <div className={`mb-6 flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-2xl border ${errors.opening_time || errors.closing_time ? 'border-red-400 bg-red-50' : 'bg-gray-50 border-gray-100'} gap-3 transition-all`}>
//         <label className="text-[13px] font-bold text-gray-700">Business Hours (Mon-Fri)</label>
//         <div className="flex items-center gap-2">
//           <input type="time" value={formData.opening_time} onChange={(e) => handleUpdate('opening_time', e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" />
//           <span className="text-gray-400 text-xs font-bold">to</span>
//           <input type="time" value={formData.closing_time} onChange={(e) => handleUpdate('closing_time', e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" />
//         </div>
//       </div>

//       {/* Upload Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//         <input type="file" ref={regInputRef} hidden onChange={(e) => handleUpdate('incorporation_cert', e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
//         <input type="file" ref={idInputRef} hidden onChange={(e) => handleUpdate('national_id', e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />

//         {/* Reg Doc Box */}
//         <div 
//           onClick={() => regInputRef.current.click()}
//           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
//             ${formData.documents.incorporation_cert ? 'border-green-500 bg-green-50' : errors.incorporation_cert ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
//         >
//           {formData.documents.incorporation_cert ? <HiCheckCircle className="text-green-500 mb-1" size={28} /> : <HiOutlineCloudUpload className={`${errors.incorporation_cert ? 'text-red-400' : 'text-gray-400'} mb-1`} size={24} />}
//           <p className={`text-[13px] font-bold ${errors.incorporation_cert ? 'text-red-500' : 'text-gray-700'}`}>Registration Doc</p>
//           <p className="text-[10px] text-gray-400 text-center">{formData.documents.incorporation_cert ? formData.documents.incorporation_cert.name : errors.incorporation_cert || 'PDF or JPG (max 5MB)'}</p>
//         </div>

//         {/* ID Proof Box */}
//         <div 
//           onClick={() => idInputRef.current.click()}
//           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
//             ${formData.documents.national_id ? 'border-green-500 bg-green-50' : errors.national_id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}
//         >
//           {formData.documents.national_id ? <HiCheckCircle className="text-green-500 mb-1" size={28} /> : <HiOutlineCloudUpload className={`${errors.national_id ? 'text-red-400' : 'text-gray-400'} mb-1`} size={24} />}
//           <p className={`text-[13px] font-bold ${errors.national_id ? 'text-red-500' : 'text-gray-700'}`}>Owner ID Proof</p>
//           <p className="text-[10px] text-gray-400 text-center">{formData.documents.national_id ? formData.documents.national_id.name : errors.national_id || 'PDF or JPG (max 5MB)'}</p>
//         </div>
//       </div>

//       <div className="flex items-center justify-center gap-4 w-full">
//         <button onClick={onBack} disabled={isLoading} className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px] disabled:opacity-50">Back</button>
//         <button onClick={handleSubmit} disabled={isLoading} className={`flex-1 max-w-[140px] h-11 text-white font-bold rounded-full shadow-lg transition-all text-[14px] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F2B53D] hover:bg-[#e0a630]'}`}>
//           {isLoading ? "Submitting..." : "Submit"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OperationCompliance;
// // import React, { useRef } from 'react';
// // import { HiOutlineClock, HiOutlineCloudUpload, HiCheckCircle } from "react-icons/hi";

// // const OperationCompliance = ({ onFinish, onBack, formData, updateFormData }) => {
// //   const regInputRef = useRef(null);
// //   const idInputRef = useRef(null);

// //   const handleTimeChange = (field, value) => {
// //     updateFormData({ [field]: value });
// //   };

// //   const handleFileChange = (documentType, file) => {
// //     if (!file) return;
// //     // Update the nested documents object in our master state
// //     updateFormData({
// //       documents: {
// //         ...formData.documents,
// //         [documentType]: file
// //       }
// //     });
// //   };

// //   return (
// //     <div className="w-full animate-fadeIn pb-4">
// //       {/* Header */}
// //       <div className="flex items-center gap-3 mb-6">
// //         <div className="w-9 h-9 bg-[#FFF8ED] rounded-lg flex items-center justify-center shrink-0">
// //            <HiOutlineClock className="text-[#F2B53D]" size={20} />
// //         </div>
// //         <div>
// //           <h3 className="font-bold text-[17px] text-gray-800 leading-tight">Compliance & Hours</h3>
// //           <p className="text-[12px] text-gray-500">Finalize your profile and upload documents.</p>
// //         </div>
// //       </div>

// //       {/* Business Hours Section */}
// //       <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 gap-3">
// //         <label className="text-[13px] font-bold text-gray-700">Business Hours (Mon-Fri)</label>
// //         <div className="flex items-center gap-2">
// //           <input 
// //             type="time" 
// //             value={formData.opening_time} 
// //             onChange={(e) => handleTimeChange('opening_time', e.target.value)}
// //             className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" 
// //           />
// //           <span className="text-gray-400 text-xs font-bold">to</span>
// //           <input 
// //             type="time" 
// //             value={formData.closing_time} 
// //             onChange={(e) => handleTimeChange('closing_time', e.target.value)}
// //             className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#F2B53D]" 
// //           />
// //         </div>
// //       </div>

// //       {/* Document Upload Grid */}
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
// //         {/* Hidden Inputs */}
// //         <input 
// //           type="file" 
// //           ref={regInputRef} 
// //           hidden 
// //           onChange={(e) => handleFileChange('incorporation_cert', e.target.files[0])} 
// //           accept=".pdf,.jpg,.jpeg,.png"
// //         />
// //         <input 
// //           type="file" 
// //           ref={idInputRef} 
// //           hidden 
// //           onChange={(e) => handleFileChange('national_id', e.target.files[0])} 
// //           accept=".pdf,.jpg,.jpeg,.png"
// //         />

// //         {/* Registration Doc Box */}
// //         <div 
// //           onClick={() => regInputRef.current.click()}
// //           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
// //             ${formData.documents.incorporation_cert ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
// //         >
// //           {formData.documents.incorporation_cert ? (
// //             <HiCheckCircle className="text-green-500 mb-1" size={28} />
// //           ) : (
// //             <HiOutlineCloudUpload className="text-gray-400 mb-1" size={24} />
// //           )}
// //           <p className="text-[13px] font-bold text-gray-700 text-center">Registration Doc</p>
// //           <p className="text-[10px] text-gray-400">
// //             {formData.documents.incorporation_cert ? formData.documents.incorporation_cert.name : 'PDF or JPG (max 5MB)'}
// //           </p>
// //         </div>

// //         {/* ID Proof Box */}
// //         <div 
// //           onClick={() => idInputRef.current.click()}
// //           className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer min-h-[120px]
// //             ${formData.documents.national_id ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}
// //         >
// //           {formData.documents.national_id ? (
// //             <HiCheckCircle className="text-green-500 mb-1" size={28} />
// //           ) : (
// //             <HiOutlineCloudUpload className="text-gray-400 mb-1" size={24} />
// //           )}
// //           <p className="text-[13px] font-bold text-gray-700 text-center">Owner ID Proof</p>
// //           <p className="text-[10px] text-gray-400">
// //              {formData.documents.national_id ? formData.documents.national_id.name : 'PDF or JPG (max 5MB)'}
// //           </p>
// //         </div>
// //       </div>

// //       {/* Buttons */}
// //       <div className="flex items-center justify-center gap-4 w-full">
// //         <button 
// //           onClick={onBack}
// //           className="flex-1 max-w-[140px] h-11 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 transition-all text-[14px]"
// //         >
// //           Back
// //         </button>
// //         <button 
// //           onClick={onFinish} 
// //           className="flex-1 max-w-[140px] h-11 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all text-[14px]"
// //         >
// //           Submit
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default OperationCompliance;