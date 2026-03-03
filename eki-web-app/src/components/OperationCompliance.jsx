import React from 'react';
import { HiOutlineClock, HiOutlineCloudUpload } from "react-icons/hi";

const OperationCompliance = ({ onFinish, onBack }) => { // Added onBack
  return (
    <div className="w-full animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FFF8ED] rounded-full flex items-center justify-center">
           <HiOutlineClock className="text-[#F2B53D]" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[18px] text-gray-800 leading-tight">Compliance & Hours</h3>
          <p className="text-[13px] text-gray-500">Finalize your profile and upload documents.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <label className="text-[14px] font-bold text-gray-700">Business Hours (Mon-Fri)</label>
        <div className="flex items-center gap-2">
          <input type="time" defaultValue="09:00" className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none" />
          <span className="text-gray-400 text-xs">to</span>
          <input type="time" defaultValue="17:00" className="h-10 px-3 border border-gray-200 rounded-lg text-[13px] outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <HiOutlineCloudUpload className="text-gray-400 group-hover:text-[#235E5D] mb-1" size={24} />
          <p className="text-[13px] font-bold text-gray-700 text-center">Registration Doc</p>
          <p className="text-[10px] text-gray-400">PDF or JPG (max 5MB)</p>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <HiOutlineCloudUpload className="text-gray-400 group-hover:text-[#235E5D] mb-1" size={24} />
          <p className="text-[13px] font-bold text-gray-700 text-center">Owner ID Proof</p>
          <p className="text-[10px] text-gray-400">PDF or JPG (max 5MB)</p>
        </div>
      </div>

      {/* Buttons - Side by Side */}
      <div className="flex items-center justify-center gap-4 w-full">
        <button 
          onClick={onBack}
          className="flex-1 max-w-[140px] h-12 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
        >
          Back
        </button>
        <button 
          onClick={onFinish} 
          className="flex-1 max-w-[260px] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all cursor-pointer"
        >
          Complete Setup
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-6 text-center max-w-[320px] mx-auto">
        By submitting, you agree to our Business Terms and Data Policies.
      </p>
    </div>
  );
};

export default OperationCompliance;