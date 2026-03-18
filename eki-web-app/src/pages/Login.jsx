import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import loginIllustration from '../assets/login.jpeg';
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/validation';
import { SigninUser as manualLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ 
    email: '', 
    password: '', 
    general: '' 
  });

  // --- Token-Based Auth Success Handler ---
  const handleAuthSuccess = (response) => {
    // 1. Unwrap the JWT payload
    // If your Django response is { "access": "...", "refresh": "..." }
    // It will be in response.data
    const authData = response?.data?.data || response?.data;
    
    const accessToken = authData?.access || authData?.token;
    const refreshToken = authData?.refresh;
    const userRole = (authData?.user?.role || authData?.role || 'vendor').toString().toLowerCase();

    console.log("JWT Access Token Received:", !!accessToken);

    if (accessToken) {
      // 2. Update AuthContext & LocalStorage
      // Note: Ensure your AuthContext login function accepts (token, role, refresh)
      login(accessToken, userRole, refreshToken); 
      
      // 3. Immediate Redirect
      if (userRole.includes('vendor')) {
        navigate('/vendordashboard');
      } else {
        navigate('/');
      }
    } else {
      console.error("Authentication failed: No access token in response body.");
      setFieldErrors(prev => ({ 
        ...prev, 
        general: "Authentication successful, but no security token was received." 
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
      // Pass the whole result to the handler
      handleAuthSuccess(result);
    } catch (err) {
      const apiError = err.response?.data?.message || err.response?.data?.detail || "Invalid credentials";
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
            
            <div className="flex h-32 w-32 mb-4 items-center justify-center overflow-hidden">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
              <p className="text-gray-500 mt-1 text-xs uppercase tracking-widest">Sign in to manage your store today</p>
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
                  className={`w-full rounded-md border h-12 px-4 focus:outline-none transition-all text-sm text-gray-900
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
                    className={`w-full rounded-md border h-12 pl-4 pr-12 focus:outline-none transition-all text-sm text-gray-900
                      ${fieldErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#EFB034]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors
                      ${fieldErrors.password ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
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
                className="flex items-center justify-center transition-all active:scale-[0.98] hover:brightness-105 shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : 'Sign In'}
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
      
      <footer className="w-full bg-[#234E4D] text-white py-3 px-6 text-[10px] uppercase tracking-widest">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="font-bold">Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 eki™ | Ijoema Ltd</div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Support</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;