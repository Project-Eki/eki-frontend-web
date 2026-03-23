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
  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded-md px-1.5 py-0.5 whitespace-nowrap pointer-events-none z-20">
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

  const getPlaceholder = (field, defaultPlaceholder) => {
    // Name fields use placeholder as error; all other fields show inline error tag
    const fieldsWithInlineErrors = ['email', 'password', 'confirmPassword'];
    if (fieldsWithInlineErrors.includes(field)) return defaultPlaceholder;
    return errors[field] ? errors[field] : defaultPlaceholder;
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
    <div className="w-full animate-slideUp max-w-[580px] mx-auto">
      <form className="space-y-3" onSubmit={handleContinue}>
        {errors.general && <MessageAlert message={errors.general} type="error" />}

        {/* Name Fields — error shown via red placeholder text */}
        <div className="account-basics-grid grid grid-cols-2 gap-4">
          <div className="relative">
            <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
            <input
              type="text"
              placeholder={getPlaceholder('first_name', 'First Name')}
              value={formData.first_name}
              onChange={(e) => handleChange('first_name', e.target.value)}
              className={`w-full h-11 pl-11 pr-4 bg-white border rounded-2xl focus:outline-none text-[14px] ${
                errors.first_name
                  ? 'placeholder:text-red-400 border-red-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder={getPlaceholder('last_name', 'Last Name')}
              value={formData.last_name}
              onChange={(e) => handleChange('last_name', e.target.value)}
              className={`w-full h-11 px-4 bg-white border rounded-2xl focus:outline-none text-[14px] ${
                errors.last_name
                  ? 'placeholder:text-red-400 border-red-400'
                  : 'border-gray-200 placeholder:text-gray-400'
              }`}
            />
          </div>
        </div>

        {/* Email Field — inline error tag floats inside the right of the input */}
        <div className="relative">
          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={`w-full h-11 pl-11 bg-white border rounded-2xl focus:outline-none text-[14px] transition-all ${
              errors.email
                ? 'pr-28 border-red-400 placeholder:text-gray-400'
                : 'pr-4 border-gray-200 placeholder:text-gray-400'
            }`}
          />
          {errors.email && <InlineError message={errors.email} />}
        </div>

        {/* Password Fields — eye icon hidden when error tag is showing to avoid overlap */}
        <div className="grid grid-cols-2 gap-4">

          {/* Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className={`w-full h-11 pl-11 bg-white border rounded-2xl focus:outline-none text-[14px] transition-all ${
                errors.password
                  ? 'pr-28 border-red-400 placeholder:text-gray-400'
                  : 'pr-12 border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {!errors.password && (
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 z-10"
              >
                {showPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
              </div>
            )}
            {errors.password && <InlineError message={errors.password} />}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword || ''}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className={`w-full h-11 pl-11 bg-white border rounded-2xl focus:outline-none text-[14px] transition-all ${
                errors.confirmPassword
                  ? 'pr-28 border-red-400 placeholder:text-gray-400'
                  : 'pr-12 border-gray-200 placeholder:text-gray-400'
              }`}
            />
            {!errors.confirmPassword && (
              <div
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 z-10"
              >
                {showConfirmPassword ? <FaRegEyeSlash size={16} /> : <FaRegEye size={16} />}
              </div>
            )}
            {errors.confirmPassword && <InlineError message={errors.confirmPassword} />}
          </div>

        </div>

        {/* Password Strength Indicator — only appears once the user starts typing */}
        {formData.password?.length > 0 && (
          <div className="px-1 space-y-1.5">
            <div className="flex gap-1.5">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    strength && strength.bars >= bar ? strength.barColor : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {strength && (
              <p className={`text-[10px] font-semibold ${strength.color}`}>
                {strength.label} password
              </p>
            )}
          </div>
        )}

        <p className="text-[11px] text-gray-500 leading-relaxed px-1">
          At least 8 chars, upper/lower case, unique from email, and non-numeric.
        </p>

        <div className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#235E5D]"
            />
            <label className="text-[12px] text-gray-500">
              I agree to the <span className="text-[#F2B53D] font-bold">Terms</span> and{' '}
              <span className="text-[#F2B53D] font-bold">Privacy Policy</span>.
            </label>
          </div>
          {errors.terms && (
            <span className="text-red-500 text-[10px] ml-7 font-bold">{errors.terms}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full h-10 rounded-full text-white font-bold text-[15px] transition-all mt-3 ${
            isLoading || !isFormValid ? 'bg-gray-400' : 'bg-[#D99201] hover:bg-[#e0a630]'
          }`}
        >
          {isLoading ? "Creating Account..." : "Continue"}
        </button>
      </form>

      <p className="text-center text-[14px] text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-[#F2B53D] font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
};

export default AccountBasics;



// import React, { useState, useMemo } from 'react';
// import { Link } from "react-router-dom";
// import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
// import { FiLock } from "react-icons/fi"; 

// // Import Context and Actions
// import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";
// import { validateAccountBasics } from "../utils/onboardingValidation";
// import { registerVendor } from '../services/api';
// import MessageAlert from "../components/MessageAlert";

// const AccountBasics = () => {
//   // Access Global State and Dispatch
//   const { state, dispatch } = useOnboarding();
//   const { formData } = state;

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false);

//   const [passwordRules, setPasswordRules] = useState({
//     length: false,
//     upperLower: false,
//     notEmail: false,
//     notNumeric: false,
//   });

//   // --- HELPERS ---
//   const isFieldValid = (field) => {
//     return formData[field] && formData[field].toString().trim() !== '' && !errors[field];
//   };

//   const isFormValid = useMemo(() => {
//     return (
//       isFieldValid('first_name') &&
//       isFieldValid('last_name') &&
//       isFieldValid('email') &&
//       isFieldValid('password') &&
//       isFieldValid('confirmPassword') &&
//       formData.agreeToTerms &&
//       Object.values(passwordRules).every(Boolean)
//     );
//   }, [formData, errors, passwordRules]);

//   // Update handleChange to use dispatch
//   const handleChange = (field, value) => {
//     dispatch({
//       type: ACTIONS.UPDATE_FORM,
//       payload: { [field]: value }
//     });
    
//     const validationErrors = validateAccountBasics({ ...formData, [field]: value });
//     setErrors(validationErrors);

//     if (field === 'password') {
//       setPasswordRules({
//         length: value.length >= 8,
//         upperLower: /[a-z]/.test(value) && /[A-Z]/.test(value),
//         notEmail: value !== formData.email,
//         notNumeric: !/^\d+$/.test(value),
//       });
//     }
//   };

//   const getPlaceholder = (field, defaultPlaceholder) => {
//     // Only use error as placeholder for name fields (no inline error text there)
//     // For fields that show inline error messages, always return the default placeholder
//     const fieldsWithInlineErrors = ['email', 'password', 'confirmPassword'];
//     if (fieldsWithInlineErrors.includes(field)) return defaultPlaceholder;
//     return errors[field] ? errors[field] : defaultPlaceholder;
//   };

//   // Manual Registration Logic
//   const handleContinue = async (e) => {
//     if (e) e.preventDefault();
    
//     const validationErrors = validateAccountBasics(formData);
//     setErrors(validationErrors);

//     if (Object.keys(validationErrors).length === 0) {
//       setIsLoading(true);

//       // THE CLEAN SLATE
//       // We clear these so the api.js Interceptor doesn't attach 
//       // an old/expired token to the registration request.
//       localStorage.removeItem("access_token");
//       localStorage.removeItem("refresh_token");
//       localStorage.removeItem("userRole");

//       try {
//         // API CALL: Creates the user and triggers the OTP email
//         await registerVendor({
//           first_name: formData.first_name,
//           last_name: formData.last_name,
//           email: formData.email,
//           password: formData.password,
//           confirm_password: formData.confirmPassword, // Matches Django expectations
//           accepted_terms: formData.agreeToTerms,
//         });

//         localStorage.removeItem('is_google_user'); 
        
//         // Success: Move to Step 2 (Verify Identity) via Global Dispatch
//         dispatch({ type: ACTIONS.NEXT_STEP });
       
//       } catch (error) {
//         console.error("DEBUG - SERVER ERROR:", JSON.stringify(error.response?.data, null, 2));
//         const errData = error.response?.data;
        
//         if (errData) {
//           // Flattening Django's error response for the UI
//           setErrors(prev => ({
//             ...prev,
//             // Duplicate email from server lands directly on the email field
//             ...(errData.email && { email: Array.isArray(errData.email) ? errData.email[0] : errData.email }),
//             ...(errData.password && { password: Array.isArray(errData.password) ? errData.password[0] : errData.password }),
//             ...(errData.non_field_errors && { general: errData.non_field_errors[0] }),
//             ...(errData.detail && { general: errData.detail }),
//             ...(errData.message && { general: errData.message }),
//           }));
//         } else {
//           setErrors({ general: "Connection failed. Please ensure Django is running on port 8000." });
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   return (
//     <div className="w-full animate-slideUp max-w-[580px] mx-auto">
//       <form className="space-y-3" onSubmit={handleContinue}>
//         {errors.general && <MessageAlert message={errors.general} type="error" />}

//         {/* Name Fields */}
//         <div className="account-basics-grid grid grid-cols-2 gap-4">
//           <div className="relative">
//             <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
//             <input 
//               type="text" 
//               placeholder={getPlaceholder('first_name', 'First Name')}
//               value={formData.first_name}
//               onChange={(e) => handleChange('first_name', e.target.value)}
//               className={`w-full h-11 pl-11 pr-4 bg-white border rounded-2xl focus:outline-none text-[14px] ${
//                 errors.first_name ? 'placeholder:text-red-500 border-red-400' : 'border-gray-200 placeholder:text-gray-400'
//               }`}
//             />
//           </div>

//           <div className="relative">
//             <input 
//               type="text" 
//               placeholder={getPlaceholder('last_name', 'Last Name')}
//               value={formData.last_name}
//               onChange={(e) => handleChange('last_name', e.target.value)}
//               className={`w-full h-11 px-4 bg-white border rounded-2xl focus:outline-none text-[14px] ${
//                 errors.last_name ? 'placeholder:text-red-500 border-red-400' : 'border-gray-200 placeholder:text-gray-400'
//               }`}
//             />
//           </div>
//         </div>

//         {/* Email Field — shows inline error for both format issues and duplicate email from server */}
//         <div>
//           <div className="relative">
//             <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14} />
//             <input
//               type="email"
//               placeholder="Email Address"
//               value={formData.email}
//               onChange={(e) => handleChange('email', e.target.value)}
//               className={`w-full h-11 pl-11 pr-4 bg-white border rounded-2xl focus:outline-none text-[14px] ${
//                 errors.email ? 'border-red-400 placeholder:text-gray-400' : 'border-gray-200 placeholder:text-gray-400'
//               }`}
//             />
//           </div>
//           {errors.email && (
//             <p className="text-red-500 text-[10px] font-semibold mt-1 ml-2">{errors.email}</p>
//           )}
//         </div>

//         {/* Password Fields — each column owns its own error message */}
//         <div className="grid grid-cols-2 gap-4">

//           {/* Password */}
//           <div>
//             <div className="relative">
//               <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
//               <input
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={(e) => handleChange('password', e.target.value)}
//                 className={`w-full h-11 pl-11 pr-12 bg-white border rounded-2xl focus:outline-none text-[14px] ${
//                   errors.password ? 'border-red-400 placeholder:text-gray-400' : 'border-gray-200 placeholder:text-gray-400'
//                 }`}
//               />
//               <div
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 z-10"
//               >
//                 {showPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
//               </div>
//             </div>
//             {errors.password && (
//               <p className="text-red-500 text-[10px] font-semibold mt-1 ml-2">{errors.password}</p>
//             )}
//           </div>

//           {/* Confirm Password */}
//           <div>
//             <div className="relative">
//               <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={14}/>
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 placeholder="Confirm Password"
//                 value={formData.confirmPassword || ''}
//                 onChange={(e) => handleChange('confirmPassword', e.target.value)}
//                 className={`w-full h-11 pl-11 pr-12 bg-white border rounded-2xl focus:outline-none text-[14px] ${
//                   errors.confirmPassword ? 'border-red-400 placeholder:text-gray-400' : 'border-gray-200 placeholder:text-gray-400'
//                 }`}
//               />
//               <div
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-1 z-10"
//               >
//                 {showConfirmPassword ? <FaRegEyeSlash size={16}/> : <FaRegEye size={16}/>}
//               </div>
//             </div>
//             {errors.confirmPassword && (
//               <p className="text-red-500 text-[10px] font-semibold mt-1 ml-2">{errors.confirmPassword}</p>
//             )}
//           </div>

//         </div>

//         <p className="text-[11px] text-gray-500 leading-relaxed px-1">
//           At least 8 chars, upper/lower case, unique from email, and non-numeric.
//         </p>

//         <div className="flex flex-col gap-1 pt-1">
//           <div className="flex items-center gap-3">
//             <input 
//               type="checkbox" 
//               checked={formData.agreeToTerms}
//               onChange={(e) => handleChange('agreeToTerms', e.target.checked)}
//               className="w-4 h-4 rounded cursor-pointer accent-[#235E5D]"
//             />
//             <label className="text-[12px] text-gray-500">
//               I agree to the <span className="text-[#F2B53D] font-bold">Terms</span> and <span className="text-[#F2B53D] font-bold">Privacy Policy</span>.
//             </label>
//           </div>
//           {errors.terms && <span className="text-red-500 text-[10px] ml-7 font-bold">{errors.terms}</span>}
//         </div>

//         <button 
//           type="submit"
//           disabled={isLoading || !isFormValid}
//           className={`w-full h-10 rounded-full text-white font-bold text-[15px] transition-all mt-3 ${
//             isLoading || !isFormValid ? 'bg-gray-400' : 'bg-[#D99201] hover:bg-[#e0a630]'
//           }`}
//         >
//           {isLoading ? "Creating Account..." : "Continue"}
//         </button>
//       </form>
      
//       <p className="text-center text-[14px] text-gray-500 mt-4">
//         Already have an account? <Link to="/signin" className="text-[#F2B53D] font-bold hover:underline">Sign in</Link>
//       </p>
//     </div>
//   );
// };

// export default AccountBasics;




