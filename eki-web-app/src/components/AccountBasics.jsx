import React, { useState, useMemo } from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import { validateAccountBasics } from "../utils/onboardingValidation";
import { registerVendor } from '../services/api';
import MessageAlert from "../components/MessageAlert";

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

  // Helper to check if field is filled and valid
  const isFieldValid = (field) => {
    return formData[field] && formData[field].toString().trim() !== '' && !errors[field];
  };

  // Check if form is complete and valid
  const isFormValid = useMemo(() => {
    return (
      isFieldValid('first_name') &&
      isFieldValid('last_name') &&
      isFieldValid('email') &&
      isFieldValid('password') &&
      isFieldValid('confirmPassword') &&
      formData.agreeToTerms &&
      Object.values(passwordRules).every(Boolean)
    );
  }, [formData, errors, passwordRules]);

  // HELPER: Handles input changes AND clears errors in real-time
  const handleChange = (field, value) => {
    updateFormData({ [field]: value }); // Update form data
    
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


  // Get placeholder text (error message or default placeholder without asterisk)
  const getPlaceholder = (field, defaultPlaceholder) => {
    if (errors[field]) {
      return errors[field];
    }
    return defaultPlaceholder;
  };

  // CLEANED UP AND FIXED CONTINUE HANDLER
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
          accepted_terms: formData.agreeToTerms,
        });

        console.log("Registration Successful:", data);

        if (data.access) localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

        onNext(); // Move to Step 2
      } catch (error) {
        const errData = error.response?.data;
        console.error(" Backend Error:", error);
        

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
            ...(!fields.email && errData.message && { general: errData.message }),
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
    <div className="w-full animate-slideUp max-w-[580px]">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
         {/* General error */}
        {errors.general && <MessageAlert message={errors.general} type="error" />}
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
            <input 
              type="text" 
              autoComplete="given-name"
              placeholder={getPlaceholder('first_name', 'First Name')}
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className={`w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-200 text-[14px] ${
                errors.first_name ? 'placeholder:text-red-500' : 'placeholder:text-gray-400'
              }`}
            />
            {!isFieldValid('first_name') && !errors.first_name && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-[14px] pointer-events-none">*</span>
            )}
          </div>

          <div className="relative">
            <input 
              type="text" 
              autoComplete="family-name"
              placeholder={getPlaceholder('last_name', 'Last Name')}
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-11 px-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-200 text-[14px] ${
                errors.last_name ? 'placeholder:text-red-500' : 'placeholder:text-gray-400'
              }`}
            />
            {!isFieldValid('last_name') && !errors.last_name && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-[14px] pointer-events-none">*</span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="relative">
          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
          <input
            type="email"
            placeholder={getPlaceholder('email', 'john@example.com')}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            autoComplete="email"
            className={`w-full h-11 pl-11 pr-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-200 text-[14px] ${
              errors.email ? 'placeholder:text-red-500' : 'placeholder:text-gray-400'
            }`}
          />
          {!isFieldValid('email') && !errors.email && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-[14px] pointer-events-none">*</span>
          )}
        </div>

        {/* Password Fields - Side by Side */}
        <div className="grid grid-cols-2 gap-4">
          {/* Create Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder={getPlaceholder('password', 'Create Password')}
              value={formData.password}
              autoComplete="new-password"
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-200 text-[14px] ${
                errors.password ? 'placeholder:text-red-500' : 'placeholder:text-gray-400'
              }`}
            />
            <div
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 hover:text-gray-600 transition-colors z-10"
            >
              {showPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </div>
            {!isFieldValid('password') && !errors.password && (
              <span className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 text-[14px] pointer-events-none">*</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder={getPlaceholder('confirmPassword', 'Confirm Password')}
              value={formData.confirmPassword || ''}
              autoComplete="new-password"
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-200 text-[14px] ${
                errors.confirmPassword ? 'placeholder:text-red-500' : 'placeholder:text-gray-400'
              }`}
            />
            <div
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 hover:text-gray-600 transition-colors z-10"
            >
              {showConfirmPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </div>
            {!isFieldValid('confirmPassword') && !errors.confirmPassword && (
              <span className="absolute right-12 top-1/2 -translate-y-1/2 text-red-500 text-[14px] pointer-events-none">*</span>
            )}
          </div>
        </div>

        {/* Password Rules - Single Line */}
        <p className="text-[11px] text-gray-500 leading-relaxed px-1">
          Password must be at least 8 characters, include upper and lower case letters, not match your email, and not be entirely numeric.
        </p>

        {/* Terms */}
        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-3">
            <input 
              type="checkbox" 
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className={`w-4 h-4 rounded cursor-pointer ${errors.terms ? 'border-red-400 accent-red-500' : 'border-gray-300 accent-[#235E5D]'}`}
            />
            <label className="text-[12px] text-gray-500">
              I agree to the <span className="text-[#F2B53D] font-bold cursor-pointer">Terms of Service</span> and <span className="text-[#F2B53D] font-bold cursor-pointer">Privacy Policy</span>.
            </label>
          </div>
          {errors.terms && <span className="text-red-500 text-[10px] ml-7 font-bold animate-fadeIn">{errors.terms}</span>}
        </div>

        {/* Continue Button - Dynamic State */}
        <button 
          type= "submit"
          // onClick={handleContinue}
          disabled={isLoading || !isFormValid}
          className={`w-full h-10 rounded-full text-white font-bold text-[15px] transition-all mt-3 ${
            isLoading || !isFormValid 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#D99201] hover:bg-[#e0a630] cursor-pointer'
          }`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>

        {/* Divider & Google */}
        <div className="flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="px-2 text-gray-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>
        <button type="button" className="w-full h-9 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-bold text-[14px] text-gray-700 cursor-pointer">
          <FcGoogle size={18} /> Sign up with Google
        </button>
      </form>
      <p className="text-center text-[14px] text-gray-500 mt-4">
        Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer hover:underline">Sign in</span>
      </p>
    </div>
  );
};

export default AccountBasics;
