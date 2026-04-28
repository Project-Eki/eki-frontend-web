import React, { useState, useMemo } from 'react';
import { Link } from "react-router-dom";
import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { FiLock } from "react-icons/fi";

// Import Context and Actions
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
import { validateAccountBasics } from "../utils/onboardingValidation";
import { registerVendor } from '../services/api';
import MessageAlert from "../components/MessageAlert";

// --- PASSWORD STRENGTH HELPERS ---
const getPasswordStrength = (passwordRules) => {
  const passed = Object.values(passwordRules).filter(Boolean).length;
  if (passed === 0) return null;
  if (passed <= 1) return { label: 'Weak', color: 'text-red-500', bars: 1, barColor: 'bg-red-400' };
  if (passed <= 3) return { label: 'Medium', color: 'text-yellow-500', bars: 2, barColor: 'bg-yellow-400' };
  return { label: 'Strong', color: 'text-green-600', bars: 3, barColor: 'bg-green-500' };
};

// Reusable inline error tag rendered inside the input wrapper
const InlineError = ({ message }) => (
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
    {message}
  </span>
);

const AccountBasics = () => {
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

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

  const strength = getPasswordStrength(passwordRules);

  // --- HELPERS ---
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
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: { [field]: value } });

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

  const handleContinue = async (e) => {
    if (e) e.preventDefault();

    const validationErrors = validateAccountBasics(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("userRole");

      try {
        await registerVendor({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
          accepted_terms: formData.agreeToTerms,
        });

        localStorage.removeItem('is_google_user');
        dispatch({ type: ACTIONS.NEXT_STEP });

      } catch (error) {
        console.error("DEBUG - SERVER ERROR:", JSON.stringify(error.response?.data, null, 2));
        const errData = error.response?.data;

        if (errData) {
          setErrors(prev => ({
            ...prev,
            ...(errData.email && { email: Array.isArray(errData.email) ? errData.email[0] : errData.email }),
            ...(errData.password && { password: Array.isArray(errData.password) ? errData.password[0] : errData.password }),
            ...(errData.non_field_errors && { general: errData.non_field_errors[0] }),
            ...(errData.detail && { general: errData.detail }),
            ...(errData.message && { general: errData.message }),
          }));
        } else {
          setErrors({ general: "Connection failed. Please ensure Django is running on port 8000." });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="w-full animate-slideUp">
      <form className="space-y-4" onSubmit={handleContinue}>
        {errors.general && <MessageAlert message={errors.general} type="error" />}

        {/* Name Fields */}
        <div className="account-basics-grid grid grid-cols-2 gap-3">
          {/* First Name */}
          <div className="relative">
            <FaRegUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type="text"
              placeholder="First Name"
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className={`w-full h-8 pl-9 pr-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                errors.first_name
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#F2B53D]'
              }`}
            />
            {errors.first_name && <InlineError message={errors.first_name} />}
          </div>

          {/* Last Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Last Name"
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-8 px-3 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                errors.last_name
                  ? 'border-red-400 focus:border-red-500'
                  : 'border-gray-200 focus:border-[#F2B53D]'
              }`}
            />
            {errors.last_name && <InlineError message={errors.last_name} />}
          </div>
        </div>

        {/* Email Field */}
        <div className="relative">
          <FaRegEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full h-8 pl-9 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
              errors.email
                ? 'pr-28 border-red-400 focus:border-red-500'
                : 'pr-3 border-gray-200 focus:border-[#F2B53D]'
            }`}
          />
          {errors.email && <InlineError message={errors.email} />}
        </div>

        {/* Password Fields */}
        <div className="password-grid grid grid-cols-2 gap-3">
          {/* Password */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-8 pl-9 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                errors.password
                  ? 'pr-28 border-red-400 focus:border-red-500'
                  : 'pr-10 border-gray-200 focus:border-[#F2B53D]'
              }`}
            />
            {!errors.password && formData.password && (
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-0.5 z-10"
              >
                {showPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
              </div>
            )}
            {errors.password && <InlineError message={errors.password} />}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={12} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full h-8 pl-9 bg-white border rounded-xl focus:outline-none text-[11px] transition-colors ${
                errors.confirmPassword
                  ? 'pr-28 border-red-400 focus:border-red-500'
                  : 'pr-10 border-gray-200 focus:border-[#F2B53D]'
              }`}
            />
            {!errors.confirmPassword && formData.confirmPassword && (
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-0.5 z-10"
              >
                {showConfirmPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
              </div>
            )}
            {errors.confirmPassword && <InlineError message={errors.confirmPassword} />}
          </div>
        </div>

        {/* Password Strength Indicator */}
        {formData.password?.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    strength && strength.bars >= bar ? strength.barColor : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {strength && (
              <p className={`text-[9px] font-semibold ${strength.color}`}>
                {strength.label} password
              </p>
            )}
          </div>
        )}

        <p className="text-[9px] text-gray-500 leading-relaxed px-1">
          Password must be at least 8 characters, contain uppercase & lowercase letters, 
          not match your email, and not be only numbers.
        </p>

        <div className="flex flex-col gap-0.5 pt-0.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="w-3.5 h-3.5 rounded cursor-pointer accent-[#235E5D]"
            />
            <label className="text-[11px] text-gray-500">
              I agree to the <span className="text-[#F2B53D] font-bold">Terms</span> and{' '}
              <span className="text-[#F2B53D] font-bold">Privacy Policy</span>.
            </label>
          </div>
          {errors.terms && (
            <span className="text-red-500 text-[9px] ml-6 font-bold">{errors.terms}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full h-8 rounded-full text-white font-bold text-[11px] transition-all mt-2 ${
            isLoading || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D99201] hover:bg-[#e0a630]'
          }`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>
      </form>

      <p className="text-center text-[11px] text-gray-500 mt-3">
        Already have an account?{' '}
        <Link to="/login" className="text-[#F2B53D] font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default AccountBasics;