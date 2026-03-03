import React from 'react';
import { HiOutlineBriefcase, HiOutlineOfficeBuilding, HiOutlineUser, HiOutlineDocumentText } from "react-icons/hi";

const BusinessIdentity = ({ onNext, onBack }) => {
  return (
    <div className="w-full animate-fadeIn">
      {/* Header section - No Card */}
      <div className="flex items-center gap-3 mb-6">
        <HiOutlineBriefcase className="text-[#F2B53D]" size={24} />
        <div>
          <h3 className="font-bold text-[16px] text-gray-800">Business Identity</h3>
          <p className="text-[13px] text-gray-500"> Provide your legal business name and ownership details as they appear on official documents.</p>
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Legal Business Name</label>
          <input type="text" placeholder="e.g. Global Tech Solutions Ltd." className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none transition-all" />
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Business Type</label>
          <select className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none bg-white cursor-pointer">
            <option value="" disabled selected>Select type</option>
            <option value="sole">Sole Proprietorship</option>
            <option value="llc">LLC</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Owner Full Name</label>
          <input type="text" placeholder="Enter full legal name" className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Tax Identification Number (Optional)</label>
          <input type="text" placeholder="VAT/TIN Number" className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Business Description</label>
          <textarea placeholder="Describe your business" className="h-20 p-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none resize-none"></textarea>
        </div>
      </div>

     {/* Replace the button section in BusinessIdentity.jsx */}
<div className="w-full flex justify-center items-center gap-4 mt-8">
  <button 
    onClick={onBack}
    className="w-full max-w-[160px] h-12 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
  >
    Back
  </button>
  <button 
    onClick={onNext} 
    className="w-full max-w-[240px] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all cursor-pointer"
  >
    Continue
  </button>
</div>
    </div>
  );
};

export default BusinessIdentity;