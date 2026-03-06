import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6"; 
import { FiLock } from "react-icons/fi"; 
import { validateAccountBasics } from "../utils/onboardingValidation";
import { registerVendor } from '../services/api';

const AccountBasics = ({ onNext, formData, updateFormData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password rules state
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upperLower: false,
    notEmail: false,
    notNumeric: false,
  });

  // HELPER: Handles input changes AND clears errors in real-time
  const handleChange = (field, value) => {
    // Update form data
    updateFormData({ [field]: value });

    // Run field validation
    const validationErrors = validateAccountBasics({ ...formData, [field]: value });
    setErrors(validationErrors);

    // Update password rules if password field
    if (field === 'password') {
      setPasswordRules({
        length: value.length >= 8,
        upperLower: /[a-z]/.test(value) && /[A-Z]/.test(value),
        notEmail: value !== formData.email,
        notNumeric: !/^\d+$/.test(value),
      });
    }
  };

  // CONTINUE HANDLER
  const handleContinue = async () => {
    const validationErrors = validateAccountBasics(formData);
    setErrors(validationErrors);

    // Ensure all password rules pass before sending request
    if (!Object.values(passwordRules).every(Boolean)) {
      setErrors(prev => ({
        ...prev,
        password: "Password does not meet all requirements."
      }));
      return;
    }

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const data = await registerVendor({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          password2: formData.confirmPassword,
          accepted_terms: formData.agreeToTerms,
          role: 'vendor',
        });

        console.log("Registration Successful:", data);

        if (data.access) localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

        onNext(); // Move to Step 2
      } catch (error) {
        const errData = error.response?.data;
        console.error("Full Backend Error:", error);
        console.log("Response Data:", errData);

        if (error.response?.status === 400 && errData) {
          // Handle both { errors: {...} } and flat { field: [...] } structures
          const fields = errData.errors || errData;
          setErrors(prev => ({
            ...prev,
            ...(fields.password && { password: Array.isArray(fields.password) ? fields.password[0] : fields.password }),
            ...((fields.confirm_password || fields.password2) && {
              confirmPassword: Array.isArray(fields.confirm_password || fields.password2)
                ? (fields.confirm_password || fields.password2)[0]
                : (fields.confirm_password || fields.password2)
            }),
            ...(fields.email && { email: Array.isArray(fields.email) ? fields.email[0] : fields.email }),
            ...(fields.first_name && { first_name: Array.isArray(fields.first_name) ? fields.first_name[0] : fields.first_name }),
            ...(fields.last_name && { last_name: Array.isArray(fields.last_name) ? fields.last_name[0] : fields.last_name }),
            ...(fields.non_field_errors && { general: Array.isArray(fields.non_field_errors) ? fields.non_field_errors[0] : fields.non_field_errors }),
            ...(!fields.email && errData.message && { email: errData.message }),
          }));
        } else if (error.response?.status === 500) {
          setErrors(prev => ({
            ...prev,
            general: "A server error occurred. Please try again later or contact support.",
          }));
        } else if (!error.response) {
          setErrors(prev => ({
            ...prev,
            general: "Network error. Please check your connection and try again.",
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            general: "Something went wrong. Please try again.",
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full animate-fadeIn max-w-[580px] pb-12">
      <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
        {errors.general && (
          <div className="bg-red-50 border border-red-300 text-red-600 text-[12px] font-bold rounded-xl px-4 py-2 animate-fadeIn">
            {errors.general}
          </div>
        )}
        
        {/* First & Last Name */}
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
            {errors.first_name && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">{errors.first_name}</span>}
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="Last Name" 
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-11 px-4 bg-white border ${errors.last_name ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`} 
            />
            {errors.last_name && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">{errors.last_name}</span>}
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
          {errors.email && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-[10px] font-bold pointer-events-none">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={formData.password}
              autoComplete="new-password"
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border ${errors.password ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 hover:text-gray-600 transition-colors z-10"
            >
              {showPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </div>
          </div>
          {errors.password && <span className="text-red-500 text-[10px] font-bold ml-2 animate-fadeIn">{errors.password}</span>}

          {/* Password Rules */}
          <div className="flex flex-col mt-1 ml-3 text-[10px]">
            <span className={passwordRules.length ? 'text-green-500' : 'text-gray-400'}>• At least 8 characters</span>
            <span className={passwordRules.upperLower ? 'text-green-500' : 'text-gray-400'}>• Includes uppercase & lowercase</span>
            <span className={passwordRules.notEmail ? 'text-green-500' : 'text-gray-400'}>• Cannot be your email</span>
            <span className={passwordRules.notNumeric ? 'text-green-500' : 'text-gray-400'}>• Cannot be entirely numeric</span>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword || ''}
              autoComplete="new-password"
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} rounded-2xl focus:border-[#F2B53D] outline-none text-[14px] transition-all`}
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 hover:text-gray-600 transition-colors z-10"
            >
              {showConfirmPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </div>
          </div>
          {errors.confirmPassword && <span className="text-red-500 text-[10px] font-bold ml-2 animate-fadeIn">{errors.confirmPassword}</span>}
        </div>

        {/* Terms */}
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
          {errors.terms && <span className="text-red-500 text-[10px] ml-7 font-bold animate-fadeIn">{errors.terms}</span>}
        </div>

        {/* Continue Button */}
        <button 
          onClick={handleContinue}
          disabled={isLoading}
          className={`w-full h-12 rounded-full text-white font-bold text-[16px] transition-all mt-2 ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F2B53D] hover:bg-[#e0a630] cursor-pointer'
          }`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>

        {/* Divider & Google */}
        <div className="flex items-center py-1">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="px-2 text-gray-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>
        <button type="button" className="w-full h-10 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-bold text-[14px] text-gray-700 cursor-pointer">
          <FcGoogle size={18} /> Sign up with Google
        </button>
      </form>
      <p className="text-center text-[14px] text-gray-500 mt-3">
        Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer hover:underline">Sign in</span>
      </p>
    </div>
  );
};

export default AccountBasics;