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
    <div className="flex flex-col items-center text-center py-10 px-6 bg-white rounded-[24px] animate-fadeIn overflow-hidden max-w-[650px] mx-auto">
      
      {/* Icon Section */}
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 border-2 border-teal-100 shadow-sm">
        <HiOutlineBadgeCheck className="text-[#235E5D]" size={48} />
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-gray-900 leading-tight">
        You're all set!
      </h2>
      
      {/* Subtitle */}
      <p className="text-gray-500 mt-3 text-[17px] max-w-[480px]">
        Your application is under review by the{' '}
        <span className="text-[#235E5D] font-bold">EKI Team</span>.
      </p>

      {/* Timeline Section */}
      <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-200 w-full max-w-[520px] shadow-sm">
        <h4 className="font-bold text-gray-800 text-[18px] mb-5">
          What happens next?
        </h4>

        <ul className="text-left space-y-5">
          <li className="flex gap-4 text-[15px] text-gray-600">
            <span className="w-7 h-7 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[13px] border border-[#F2B53D]/20">
              1
            </span>
            <span className="leading-relaxed">
              Document verification within <strong>24-48 hours</strong>.
            </span>
          </li>

          <li className="flex gap-4 text-[15px] text-gray-600">
            <span className="w-7 h-7 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[13px] border border-[#F2B53D]/20">
              2
            </span>
            <span className="leading-relaxed">
              Check your email for a <strong>confirmation link</strong>.
            </span>
          </li>

          <li className="flex gap-4 text-[15px] text-gray-600">
            <span className="w-7 h-7 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[13px] border border-[#F2B53D]/20">
              3
            </span>
            <span className="leading-relaxed">
              Log in and start <strong>listing your products and services</strong>!
            </span>
          </li>
        </ul>
      </div>

      {/* Button */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-10 px-12 py-4 bg-[#F2B53D] text-white font-bold text-[16px] rounded-full shadow-lg shadow-yellow-500/20 hover:bg-[#e0a630] transition-all transform hover:scale-[1.03] cursor-pointer"
      >
        Return to Login
      </button>
      
      {/* Help Text */}
      <p className="mt-6 text-[13px] text-gray-400">
        Questions? <span className="text-[#235E5D] font-semibold cursor-pointer hover:underline">support@eki.com</span>
      </p>
    </div>
  );
};

export default OnboardingSuccess;