import React, { useEffect } from 'react';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useNavigate } from 'react-router-dom'; 
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

const OnboardingSuccess = () => {
  const navigate = useNavigate();
  const { dispatch } = useOnboarding();

  useEffect(() => {
        // This clears the Context state so the form is fresh for next time
    // and prevents the user from "Back-buttoning" into the form
    dispatch({ type: ACTIONS.RESET_FORM }); 

        // Optional: Clear any temp items from localStorage
    localStorage.removeItem("onboarding_step");
  }, [dispatch]);

   // Optional: You could trigger a cleanup of your Context here if needed
  // useEffect(() => { dispatch({ type: ACTIONS.RESET_FORM }) }, []);

  return (
    <div className="w-full flex flex-col items-center text-center animate-fadeIn py-1">
      {/* Icon Section  */}
      <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-3 border border-teal-100">
        <HiOutlineBadgeCheck className="text-[#235E5D]" size={32} />
      </div>

      {/* Heading - */}
      <h2 className="text-[20px] font-black text-gray-900 leading-tight">You're all set!</h2>
      
      {/* Subtitle -  */}
      <p className="text-gray-500 mt-1 text-[12px] max-w-[350px]">
        Your application has been received and is under review by the <span className="text-[#235E5D] font-bold">EKI Team</span>.
      </p>

      {/* Timeline Section  */}
      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 w-full max-w-[400px]">
        <h4 className="font-bold text-gray-800 text-[11px] mb-2">What happens next?</h4>
        <ul className="text-left space-y-2">
          <li className="flex gap-2 text-[10px] text-gray-600">
            <span className="w-4 h-4 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">1</span>
            <span>Our team will verify your business documents within <b>24-48 hours</b>.</span>
          </li>
          <li className="flex gap-2 text-[10px] text-gray-600">
            <span className="w-4 h-4 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">2</span>
            <span>You'll receive a <b>confirmation email</b> once  your account is  activated.</span>
          </li>
          <li className="flex gap-2 text-[10px] text-gray-600">
            <span className="w-4 h-4 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">3</span>
            <span>Once approved, you can log in and start <b>listing your products</b>!</span>
          </li>
        </ul>
      </div>

      {/* Action Button  */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-3 w-full max-w-[160px] h-8 bg-[#F2B53D] text-white font-bold text-[11px] rounded-full shadow-md shadow-yellow-200/50 hover:bg-[#e0a630] transform hover:scale-[1.02] transition-all cursor-pointer"
      >
        Return to Login
      </button>
      
      {/* Footer text  */}
      <p className="mt-2 text-[9px] text-gray-400">
        Need help? Contact <span className="underline cursor-pointer">support@eki.com</span>
      </p>
    </div>
  );
};

export default OnboardingSuccess;