import React from 'react';
import { HiOutlineLocationMarker } from "react-icons/hi";

const ContactLocation = ({ onNext, onBack }) => { // Added onBack
  return (
    <div className="w-full animate-fadeIn">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FFF8ED] rounded-full flex items-center justify-center">
           <HiOutlineLocationMarker className="text-[#F2B53D]" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-[18px] text-gray-800 leading-tight">Contact & Location</h3>
          <p className="text-[13px] text-gray-500">How should customers and EKI reach you?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Business Email</label>
          <input type="email" placeholder="contact@company.com" className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" />
        </div>

        <div className="flex flex-col">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Phone Number</label>
          <input type="tel" placeholder="+1 (555) 000-0000" className="h-12 px-4 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none" />
        </div>

        <div className="flex flex-col md:col-span-2">
          <label className="text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Physical Address</label>
          <textarea placeholder="Street, Suite, City, Country" className="h-16 p-3 border border-gray-200 rounded-xl text-[14px] focus:border-[#F2B53D] outline-none resize-none"></textarea>
        </div>
      </div>

      {/* Buttons - Side by Side */}
      <div className="mt-8 flex items-center justify-center gap-4 w-full">
        <button 
          onClick={onBack}
          className="flex-1 max-w-[140px] h-12 border-2 border-gray-100 text-gray-400 font-bold rounded-full hover:bg-gray-50 hover:text-gray-600 transition-all cursor-pointer"
        >
          Back
        </button>
        <button 
          onClick={onNext} 
          className="flex-1 max-w-[260px] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all cursor-pointer"
        >
          Continue
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-4 text-center italic">By continuing, you agree to our Service Terms and Business Policies.</p>
    </div>
  );
};

export default ContactLocation;