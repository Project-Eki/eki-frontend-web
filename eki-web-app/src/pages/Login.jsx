import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import loginIllustration from '../assets/login.jpeg';
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/validation';
import { signInUser as manualLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', general: '' });

  const handleAuthSuccess = (response) => {
    // 1. UNWRAP: Because your Django view uses success_response, 
    // the tokens are inside response.data
    const authData = response?.data || response;
    
    const token = authData?.access || authData?.token;
    // Extract role, defaulting to 'vendor' if not found
    const role = authData?.role?.toLowerCase() || 'vendor'; 

    if (token) {
      // 2. Save token and role to AuthContext
      login(token, role); 
      
      // 3. Redirect
      if (role.includes('vendor')) {
        navigate('/VendorDashboard');
      } else {
        navigate('/');
      }
    } else {
      console.error("Auth Success but tokens missing. Check console for structure.");
      setFieldErrors(prev => ({ 
        ...prev, 
        general: "Authentication successful, but security tokens were not found in the response." 
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    const { errors } = validateLoginForm({ ...formData, [name]: value });
    if (value.length > 0 && errors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: errors[name], general: '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      const { errors } = validateLoginForm(formData);
      setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateLoginForm(formData);

    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await manualLogin(formData);
      handleAuthSuccess(result);
    } catch (err) {
      // Handle the error_response structure from your Django views
      const apiError = err.response?.data?.message || err.response?.data?.detail || "Invalid email or password";
      setFieldErrors({ email: '', password: '', general: apiError });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side Illustration */}
        <div className="hidden lg:flex lg:w-1/2 h-full">
          <img src={loginIllustration} alt="Sign In" className="h-full w-full object-cover" />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full lg:w-1/2 h-full flex-col justify-center items-center p-6 bg-white overflow-y-auto">
          <div className="w-full max-w-md flex flex-col items-center">
            
            <div className="flex h-32 w-32 mb-4 items-center justify-center">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
              <p className="text-gray-500 mt-1 text-xs">Sign in to manage your store today</p>
            </div>

            <form className="w-full space-y-6" onSubmit={handleSubmit} noValidate>
              
              {fieldErrors.general && (
                <p className="text-red-600 text-[11px] font-semibold text-center bg-red-50 py-2 rounded-md border border-red-100">
                  {fieldErrors.general}
                </p>
              )}

              <div className="flex flex-col gap-1">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email Address"
                  className={`w-full rounded-md border h-12 px-4 focus:outline-none transition-all text-sm
                    ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#EFB034]'}`}
                />
                {fieldErrors.email && <span className="text-[10px] text-red-500 font-medium ml-1">{fieldErrors.email}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Password"
                    className={`w-full rounded-md border h-12 pl-4 pr-12 focus:outline-none transition-all text-sm
                      ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#EFB034]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="text-[10px] text-red-500 font-medium ml-1">{fieldErrors.password}</span>}
              </div>

              <div className="flex items-center justify-between text-[11px] px-1">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input className="mr-2 h-3.5 w-3.5 accent-[#234E4D]" type="checkbox" />
                  Remember me
                </label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="font-bold text-yellow-600 hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', height: '48px', fontSize: '16px', fontWeight: '600',
                  color: '#FFFFFF', background: '#EFB034FF', borderRadius: '24px',
                  opacity: isLoading ? 0.5 : 1,
                }}
                className="flex items-center justify-center transition-all active:scale-[0.95]"
              >
                {isLoading ? 'Processing...' : 'Sign In'}
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => navigate('/vendorOnboarding')} className="font-bold text-[#234E4D] hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <footer className="w-full bg-[#234E4D] text-white py-3 px-6 text-[10px]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-bold">Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. All rights reserved. <span className="font-bold ml-1">eki</span></div>
          <div className="flex gap-6">
            <a href="#">Support</a>
            <a href="#">Privacy Policy</a>
            <span className="font-bold border-l border-white/30 pl-6">Ijoema ltd</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;