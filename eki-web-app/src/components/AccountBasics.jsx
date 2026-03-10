import React, { useState, useMemo } from 'react';
import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";
import { validateAccountBasics } from "../utils/onboardingValidation";
import { registerVendor } from '../services/api';
import MessageAlert from "../components/MessageAlert";
import { Link } from "react-router-dom";

const AccountBasics = ({ onNext, formData, updateFormData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    upperLower: false,
    notEmail: false,
    notNumeric: false,
  });

  const isFieldValid = (field) => {
    return formData[field] && formData[field].toString().trim() !== '' && !errors[field];
  };

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

  const handleChange = (field, value) => {
    updateFormData({ [field]: value }); // Update form data
    
    // Run field validation
    const validationErrors = validateAccountBasics({ ...formData, [field]: value });
    setErrors(validationErrors);

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

  // CONTINUE HANDLER
  const handleContinue = async () => {
  const validationErrors = validateAccountBasics(formData);

  if (!Object.values(passwordRules).every(Boolean)) {
    validationErrors.password = "Password requirements not met.";
  }

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);

  try {
    const payload = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.toLowerCase().trim(),
      password: formData.password,
      confirm_password: formData.confirmPassword,
      phone_number: formData.phone_number || "0700000000",
      accepted_terms: true,
      role: "vendor",
    };

    const response = await registerVendor(payload);

    if (response?.access) {
      localStorage.setItem("access_token", response.access);
    }

    onNext();

  } catch (error) {
    console.error("Registration Error:", error);

    const serverError = error.response?.data;

    if (serverError && typeof serverError === "object") {
      setErrors(serverError);
    } else {
      setErrors({ general: "Registration failed. Try again." });
    }

  } finally {
    setIsLoading(false);
  }
};
  // const handleContinue = async () => {
  //   const validationErrors = validateAccountBasics(formData);
    
  //   if (!Object.values(passwordRules).every(Boolean)) {
  //     validationErrors.password = "Password requirements not met.";
  //   }

  //   if (Object.keys(validationErrors).length > 0) {
  //     setErrors(validationErrors);
  //     return;
  //   }

  //   if (Object.keys(validationErrors).length === 0) {
  //     setIsLoading(true);
  //     try {
  //       const data = await registerVendor({
  //         first_name: formData.first_name,
  //         last_name: formData.last_name,
  //         email: formData.email,
  //         password: formData.password,
  //         confirm_password: formData.confirmPassword,
  //         accepted_terms: formData.agreeToTerms,
  //       });

  //   try {
  //     // PRO TIP: If you keep getting 500, the email might be taken.
  //     // You can append Date.now() to the email for testing: 
  //     // const testEmail = `test${Date.now()}@gmail.com`;

  //     const payload = {
  //       first_name: formData.first_name.trim(),
  //       last_name: formData.last_name.trim(),
  //       email: formData.email.toLowerCase().trim(),
  //       password: formData.password,
  //       confirm_password: formData.confirmPassword,
  //       phone_number: formData.phone_number || "0700000000", 
  //       accepted_terms: true, 
  //       role: 'vendor',
  //     };

  //       onNext(); // Move to Step 2
  //     } catch (error) {
  //       const errData = error.response?.data;
  //       console.error(" Backend Error:", error);
        

  //     const response = await registerVendor(payload);
      
  //     if (response?.access) localStorage.setItem('access_token', response.access);
      
  //     onNext(); 
  //   } catch (error) {
  //     console.error("Registration Error Details:", error.response);
      
  //     const serverError = error.response?.data;

  //     if (typeof serverError === 'string' && serverError.includes('<!doctype html>')) {
  //       setErrors({ general: "Server crashed (500). The email might be taken or a field is invalid." });
  //     } else if (serverError && typeof serverError === 'object') {
  //       // Map backend field errors to our state
  //       setErrors(serverError);
  //     } else {
  //       setErrors({ general: "Registration failed. Check your connection or try a new email." });
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
              className={`w-full h-11 pl-11 pr-4 bg-white border ${errors.first_name ? 'border-red-500 placeholder-red-400' : 'border-gray-200'} rounded-2xl focus:outline-none text-[14px]`}
            />
          </div>

          <div className="relative">
            <input 
              type="text" 
              autoComplete="family-name"
              placeholder={getPlaceholder('last_name', 'Last Name')}
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-11 px-4 bg-white border ${errors.last_name ? 'border-red-500 placeholder-red-400' : 'border-gray-200'} rounded-2xl focus:outline-none text-[14px]`}
            />
          </div>
        </div>

        <div className="relative">
          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
          <input
            type="email"
            placeholder={errors.email || 'Email Address'}
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full h-11 pl-11 pr-4 bg-white border ${errors.email ? 'border-red-500 placeholder-red-400' : 'border-gray-200'} rounded-2xl focus:outline-none text-[14px]`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:outline-none text-[14px]`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </button>
          </div>

          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full h-11 pl-11 pr-12 bg-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} rounded-2xl focus:outline-none text-[14px]`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {showConfirmPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input 
            type="checkbox" 
            checked={formData.agreeToTerms || false}
            onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#235E5D] cursor-pointer"
          />
          <label className="text-[12px] text-gray-500 cursor-pointer">
            I agree to the <span className="text-[#F2B53D] font-bold">Terms of Service</span> and <span className="text-[#F2B53D] font-bold">Privacy Policy</span>.
          </label>
        </div>

        <button 
          type= "submit"
          // onClick={handleContinue}
          disabled={isLoading || !isFormValid}
          className={`w-full h-11 rounded-full text-white font-bold transition-all mt-4 ${
            isLoading || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D99201] hover:bg-[#e0a630]'
          }`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>
      </form>
    </div>
  );
};

export default AccountBasics;