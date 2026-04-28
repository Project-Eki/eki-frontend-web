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
    <div className="flex flex-col items-center text-center py-10 animate-fadeIn overflow-hidden">
      
      {/* Icon Section */}
      <div className="w-19 h-19 bg-teal-50 rounded-full flex items-center justify-center mb-5 border-2 border-teal-100 shadow-sm">
        <HiOutlineBadgeCheck className="text-[#235E5D]" size={44} />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-gray-900 leading-tight">
        You're all set!
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-500 mt-2 text-[15px] max-w-[420px]">
        Your application is under review by the{' '}
        <span className="text-[#235E5D] font-bold">EKI Team</span>.
      </p>

      {/* Timeline Section */}
      <div className="mt-8 p-6 bg-white rounded-xl border border-gray-100 w-full max-w-[520px]">
        <h4 className="font-bold text-gray-800 text-[16px] mb-5">
          What happens next?
        </h4>
        <ul className="text-left space-y-4">
          <li className="flex gap-4 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              1
            </span>
            <span>Document verification within <strong>24-48 hours</strong>.</span>
          </li>
          <li className="flex gap-4 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              2
            </span>
            <span>Check your email for a <strong>confirmation link</strong>.</span>
          </li>
          <li className="flex gap-4 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">
              3
            </span>
            <span>Log in and start <strong>listing your products and services</strong>!</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-8 px-10 py-3 bg-[#F2B53D] text-white font-bold text-[14px] rounded-full shadow-md hover:bg-[#e0a630] transition-all cursor-pointer"
      >
        Return to Login
      </button>
      
      {/* Help text */}
      <p className="mt-5 text-[12px] text-gray-400">
        Questions? <span className="text-[#235E5D] font-medium cursor-pointer">support@eki.com</span>
      </p>
    </div>
  );
};

export default OnboardingSuccess;