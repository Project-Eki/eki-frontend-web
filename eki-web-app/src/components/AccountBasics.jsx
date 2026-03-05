import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6"; 
import { FiLock } from "react-icons/fi"; 
import { validateAccountBasics } from "../utils/onboardingValidation";

const AccountBasics = ({ onNext, formData, updateFormData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // HELPER: Handles input changes AND clears errors in real-time
  const handleChange = (field, value) => {
    // 1. Update the master form data
    updateFormData({ [field]: value });

    // 2. Re-run validation for just this update to see if the error is fixed
    const validationErrors = validateAccountBasics({ ...formData, [field]: value });
    
    // 3. Update the error state (this makes errors disappear as you type)
    setErrors(validationErrors);
  };

  const handleContinue = () => {
    const validationErrors = validateAccountBasics(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onNext();
    }
  };

  return (
    <div className="w-full animate-fadeIn max-w-[580px] pb-12">
      <div className="space-y-2">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="First Name" 
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className={`w-full h-11 pl-11 pr-4 bg-white border ${errors.first_name ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`} 
            />
            {errors.first_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.first_name}
              </span>
            )}
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Last Name" 
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-11 px-4 bg-white border ${errors.last_name ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`} 
            />
            {errors.last_name && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
                {errors.last_name}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="email" 
            placeholder="john@example.com" 
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full h-11 pl-11 pr-4 bg-white border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`} 
          />
          {errors.email && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Create a strong password" 
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className={`w-full h-11 pl-11 pr-12 bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`} 
          />
          
          <div 
            onClick={() => setShowPassword(!showPassword)} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 hover:text-gray-600 transition-colors z-10"
          >
            {showPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
          </div>

          {errors.password && (
            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none bg-white px-1">
              {errors.password}
            </span>
          )}
        </div>

        {/* Terms & Conditions Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 py-1">
            <input 
              type="checkbox" 
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[#235E5D] cursor-pointer" 
            />
            <label className={`text-[12px] transition-colors ${errors.terms ? ' font-bold' : 'text-gray-500'}`}>
              I agree to the <span className="text-[#F2B53D] font-bold cursor-pointer">Terms of Service</span> and <span className="text-[#F2B53D] font-bold cursor-pointer">Privacy Policy</span>.
            </label>
          </div>
          {/* Error Message */}
          {errors.terms && (
            <span className="text-red-500 text-[10px] ml-7 font-bold animate-fadeIn">
              {errors.terms}
            </span>
          )}
        </div>

        <button 
          onClick={handleContinue}
          className="w-full h-12 rounded-full text-white font-bold text-[16px] bg-[#F2B53D] hover:bg-[#e0a630] transition-all  shadow-yellow-200/50 mt-2 cursor-pointer"
        >
          Continue
        </button>

        {/* Divider and Google buttons*/}
        <div className="flex items-center py-1">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="px-2 text-gray-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <button type="button" className="w-full h-10 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-bold text-[14px] text-gray-700 cursor-pointer">
          <FcGoogle size={18} /> Sign up with Google
        </button>
      </div>
      
      <p className="text-center text-[14px] text-gray-500 mt-3">
        Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer hover:underline">Sign in</span>
      </p>
    </div>
  );
};

export default AccountBasics;

// import React , {useState}from 'react';
// import { FcGoogle } from "react-icons/fc";
// import { FaRegUser, FaRegEnvelope, FaRegEye } from "react-icons/fa6";
// import { FiLock } from "react-icons/fi"; 

// const AccountBasics = ({ onNext, formData, updateFormData }) => {
//   // logic
//   const [showPassword, setShowPassword] = useState(false);
//   const [errors, setErrors] = useState({});

//   const validateForm = () => {
//     let newErrors = {};
//     if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
//     if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
//     if (!formData.email.includes("@")) newErrors.email = "Enter a valid email";
//     if (formData.password.length < 6) newErrors.password = "Password must be 6+ chars";
//     if (!formData.agreeToTerms) newErrors.terms = "You must agree to terms";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0; // Returns true if no errors
//   };

//   const handleContinue = () => {
//     if (validateForm()) {
//       onNext();
//     }
//   };
//   return (
//     <div className="w-full animate-fadeIn max-w-[580px]">
//       {/* FORM FIELDS */}
//       <div className="space-y-3">
        
//         {/* Name Row */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="relative">
//             <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//             <input 
//               type="text" 
//               placeholder="First Name" 
//               value={formData.firstName}
//               onChange={(e) => updateFormData({ firstName: e.target.value })}
//               className="w-full h-12  pl-11 bg-white border ${errors.firstName ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px]" 
//             />
//           </div>
//           <input 
//             type="text" 
//             placeholder=" Last Name" 
//             value={formData.lastName}
//             onChange={(e) => updateFormData({ lastName: e.target.value })}
//             className="w-full h-12 px-4 bg-white border ${errors.lastName ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px] transition-all" 
//           />
//         </div>

//         {/* Email */}
//         <div className="relative">
//           <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//           <input 
//             type="email" 
//             placeholder="john@example.com" 
//             value={formData.email}
//             onChange={(e) => updateFormData({ email: e.target.value })}
//             className="w-full h-12 pl-11 bg-white border ${errors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px] transition-all" 
//           />
//         </div>

//         {/* Password */}
// <div className="relative">
//           <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
//           <input 
//             type={showPassword ? "text" : "password"} // Logic for visibility
//             placeholder="Create a strong password" 
//             value={formData.password}
//             onChange={(e) => updateFormData({ password: e.target.value })}
//             className={`w-full h-12 pl-11 pr-11 bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px]`} 
//           />
//           {/* Eye Icon Button */}
//           <div 
//             onClick={() => setShowPassword(!showPassword)} 
//             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1"
//           >
//             {showPassword ? <FaRegEyeSlash size={14}/> : <FaRegEye size={14}/>}
//           </div>
//         </div>

//         {/* Terms */}
// <div className="flex items-center gap-3 py-1">
//           <input 
//             type="checkbox" 
//             checked={formData.agreeToTerms}
//             onChange={(e) => updateFormData({ agreeToTerms: e.target.checked })}
//             className="w-4 h-4 rounded border-gray-300 accent-[#235E5D] cursor-pointer" 
//           />
//           <label className={`text-[12px] ${errors.terms ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
//             I agree to the Terms of Service and Privacy Policy.
//           </label>
//         </div>

//         {/* Main Button */}
//       {/* Error Message (General) */}
//         {Object.keys(errors).length > 0 && (
//           <p className="text-red-500 text-[11px] font-bold text-center">Please fill in all required fields correctly.</p>
//         )}

//         <button 
//           onClick={handleContinue} // Calls our validation first
//           className="w-full h-12 rounded-full text-white font-bold text-[16px] bg-[#F2B53D] hover:bg-[#e0a630] transition-all shadow-lg mt-2 cursor-pointer"
//         >
//           Continue
//         </button>

//         {/* Divider */}
//         <div className="flex items-center py-2">
//           <div className="flex-grow border-t border-gray-100"></div>
//           <span className="px-3 text-gray-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
//           <div className="flex-grow border-t border-gray-100"></div>
//         </div>

//         {/* Google Button */}
//         <button className="w-full h-12 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-bold text-[14px] text-gray-700 cursor-pointer">
//           <FcGoogle size={20} /> Sign up with Google
//         </button>
//       </div>
      
//       {/* Sign In Footer */}
//       <p className="text-center text-[14px] text-gray-500 mt-4">
//         Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer hover:underline">Sign in</span>
//       </p>
//     </div>
//   );
// };

// export default AccountBasics;
