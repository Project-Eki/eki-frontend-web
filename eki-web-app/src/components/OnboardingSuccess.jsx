import React, { useEffect } from 'react';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useNavigate } from 'react-router-dom'; 
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

const OnboardingSuccess = () => {
  const navigate = useNavigate();
  const { dispatch } = useOnboarding();

  useEffect(() => {
    dispatch({ type: ACTIONS.RESET_FORM }); 
    localStorage.removeItem("onboarding_step");
  }, [dispatch]);

  return (
    <div className="flex flex-col items-center text-center py-2 animate-fadeIn overflow-hidden">
      
      {/* Icon Section - Slightly smaller */}
      <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-3 border-2 border-teal-100 shadow-sm">
        <HiOutlineBadgeCheck className="text-[#235E5D]" size={32} />
      </div>

      {/* Heading */}
      <h2 className="text-xl font-black text-gray-900 leading-tight">
        You're all set!
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-500 mt-1 text-[13px] max-w-[380px]">
        Your application is under review by the{' '}
        <span className="text-[#235E5D] font-bold">EKI Team</span>.
      </p>

      {/* Timeline Section - More compact */}
      <div className="mt-5 p-4 bg-white rounded-xl border border-gray-100 w-full max-w-[420px]">
        <h4 className="font-bold text-gray-800 text-[14px] mb-3">
          What happens next?
        </h4>
        <ul className="text-left space-y-2.5">
          <li className="flex gap-3 text-[12px] text-gray-600">
            <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
              1
            </span>
            <span>Document verification within <strong>24-48 hours</strong>.</span>
          </li>
          <li className="flex gap-3 text-[12px] text-gray-600">
            <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
              2
            </span>
            <span>Check your email for a <strong>confirmation link</strong>.</span>
          </li>
          <li className="flex gap-3 text-[12px] text-gray-600">
            <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[10px]">
              3
            </span>
            <span>Log in and start <strong>listing your products and services</strong>!</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-6 px-8 py-2.5 bg-[#F2B53D] text-white font-bold text-[13px] rounded-full shadow-md hover:bg-[#e0a630] transition-all cursor-pointer"
      >
        Return to Login
      </button>
      
      {/* Simple help text */}
      <p className="mt-4 text-[11px] text-gray-400">
        Questions? <span className="text-[#235E5D] font-medium cursor-pointer">support@eki.com</span>
      </p>
    </div>
  );
};

export default OnboardingSuccess;