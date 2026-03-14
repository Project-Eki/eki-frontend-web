import React, { useEffect } from 'react';
import { HiOutlineBadgeCheck } from "react-icons/hi";
import { useNavigate } from 'react-router-dom'; 

const OnboardingSuccess = () => {
  const navigate = useNavigate();

  // Optional: You could trigger a cleanup of your Context here if needed
  // useEffect(() => { dispatch({ type: ACTIONS.RESET_FORM }) }, []);

  return (
    <div className="w-full flex flex-col items-center text-center animate-fadeIn py-8">
      {/* Icon Section */}
      <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100">
        <HiOutlineBadgeCheck className="text-[#235E5D]" size={48} />
      </div>

      <h2 className="text-[32px] font-black text-gray-900 leading-tight">You're all set!</h2>
      <p className="text-gray-500 mt-3 text-[16px] max-w-[400px]">
        Your application has been received and is currently under review by the <span className="text-[#235E5D] font-bold">EKI Team</span>.
      </p>

      {/* Timeline Section */}
      <div className="mt-10 p-6 bg-gray-50 rounded-3xl border border-gray-100 w-full max-w-[450px]">
        <h4 className="font-bold text-gray-800 text-[15px] mb-4">What happens next?</h4>
        <ul className="text-left space-y-4">
          <li className="flex gap-3 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">1</span>
            <span>Our team will verify your business documents within <b>24-48 hours</b>.</span>
          </li>
          <li className="flex gap-3 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">2</span>
            <span>You'll receive a <b>confirmation email</b> once your account is activated.</span>
          </li>
          <li className="flex gap-3 text-[13px] text-gray-600">
            <span className="w-6 h-6 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold text-[11px]">3</span>
            <span>Once approved, you can log in and start <b>listing your products</b>!</span>
          </li>
        </ul>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => navigate('/login')} 
        className="mt-10 w-full max-w-[300px] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transform hover:scale-[1.02] transition-all cursor-pointer"
      >
        Return to Login
      </button>
      
      <p className="mt-4 text-[11px] text-gray-400">
        Need help? Contact <span className="underline cursor-pointer">support@eki.com</span>
      </p>
    </div>
  );
};

export default OnboardingSuccess;

// import React from 'react';
// import { HiOutlineBadgeCheck } from "react-icons/hi";

// const OnboardingSuccess = () => {
//   return (
//     <div className="w-full flex flex-col items-center text-center animate-fadeIn py-8">
//       <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mb-6 border border-teal-100">
//         <HiOutlineBadgeCheck className="text-[#235E5D]" size={48} />
//       </div>

//       <h2 className="text-[32px] font-black text-gray-900 leading-tight">You're all set!</h2>
//       <p className="text-gray-500 mt-3 text-[16px] max-w-[400px]">
//         Your application has been received and is currently under review by the <span className="text-[#235E5D] font-bold">EKI Team</span>.
//       </p>

//       <div className="mt-10 p-6 bg-gray-50 rounded-3xl border border-gray-100 w-full max-w-[450px]">
//         <h4 className="font-bold text-gray-800 text-[15px] mb-2">What happens next?</h4>
//         <ul className="text-left space-y-3">
//           <li className="flex gap-3 text-[13px] text-gray-600">
//             <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold">1</span>
//             Our team will verify your business documents within 24-48 hours.
//           </li>
//           <li className="flex gap-3 text-[13px] text-gray-600">
//             <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold">2</span>
//             You'll receive a confirmation email once your account is activated.
//           </li>
//           <li className="flex gap-3 text-[13px] text-gray-600">
//             <span className="w-5 h-5 rounded-full bg-[#FFF8ED] text-[#F2B53D] flex items-center justify-center flex-shrink-0 font-bold">3</span>
//             Once approved, you can log in and start listing your products!
//           </li>
//         </ul>
//       </div>

//       {/* <button 
//         onClick={() => window.location.href = '/login'} 
//         className="mt-10 w-full max-w-[300px] h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all cursor-pointer"
//       >
//         Return to Login
//       </button> */}
//     </div>
//   );
// };

// export default OnboardingSuccess;