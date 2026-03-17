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

  const handleAuthSuccess = (data) => {
    const token = data?.access || data?.token || data?.access_token;
    const role = data?.role?.toLowerCase() || '';

    if (token && role) {
      login(token, role); 
      role.includes('vendor') ? navigate('/VendorDashboard') : navigate('/');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // REAL-TIME VALIDATION
    const { errors } = validateLoginForm(newFormData);

    // Only show "Invalid" message if the user has actually started typing (length > 0)
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
      const data = await manualLogin(formData);
      handleAuthSuccess(data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid email or password";
      setFieldErrors({ email: '', password: '', general: msg });
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
          <img src={loginIllustration} alt="Login" className="h-full w-full object-cover" />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full lg:w-1/2 h-full flex-col justify-center items-center p-6 bg-white overflow-y-auto">
          <div className="w-full max-w-md flex flex-col items-center">
            
            <div className="flex h-32 w-32 mb-4 items-center justify-center">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
              <p className="text-gray-500 mt-1 text-xs">Ready to start selling today?</p>
            </div>

            <form className="w-full space-y-6" onSubmit={handleSubmit} noValidate>
              
              {fieldErrors.general && (
                <p className="text-red-600 text-[11px] font-semibold text-center bg-red-50 py-2 rounded-md border border-red-100">
                  {fieldErrors.general}
                </p>
              )}

              {/* Email Input Group */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Email Address"
                    className={`w-full rounded-md border h-12 px-4 focus:outline-none transition-all text-sm text-gray-900
                      ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#EFB034]'}`}
                  />
                </div>
                {fieldErrors.email && (
                  <span className="text-[10px] text-red-500 font-medium ml-1">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password Input Group */}
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Password"
                    className={`w-full rounded-md border h-12 pl-4 pr-12 focus:outline-none transition-all text-sm text-gray-900
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
                {fieldErrors.password && (
                  <span className="text-[10px] text-red-500 font-medium ml-1">
                    {fieldErrors.password}
                  </span>
                )}
              </div>

              {/* Remember/Forgot options */}
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
                {isLoading ? 'Processing...' : 'Login'}
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
      
      {/* Footer */}
      <footer className="w-full font-sans">
        <div className="w-full bg-[#234E4D] text-white py-3 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-wide">
            <div className="flex-shrink-0 font-bold">Buy Smart. Sell Fast. Grow Together...</div>
            <div className="flex items-center gap-1 text-center">
              <span>© 2026 Vendor Portal. All rights reserved.</span>
              <span className="ml-1 font-bold">eki<span className="text-[8px] font-normal ml-0.5">TM</span></span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:opacity-80">Support</a>
              <a href="#" className="hover:opacity-80">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400">Terms of Service</a>
              <span className="font-bold border-l border-white/30 pl-6">Ijoema ltd</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default Login;