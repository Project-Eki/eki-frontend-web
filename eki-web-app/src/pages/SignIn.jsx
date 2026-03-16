import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import resetIllustration from '../assets/signin.jpeg';
import logoImage from '../assets/logo.jpeg';

import { signInUser as manualSignIn } from "../services/authService";

const SignIn = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', general: '' });

  const handleAuthSuccess = (data) => {
    const token = data.access || data.token;
    const role = data.role?.toLowerCase();

    if (token) localStorage.setItem('access_token', token);
    if (role) localStorage.setItem('userRole', role);

    if (role === 'vendor') {
      navigate('/VendorDashboard');
    } else {
      navigate('/Home');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (fieldErrors.general) {
      setFieldErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let hasError = false;
    const newErrors = { email: '', password: '', general: '' };

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      setFormData({ 
        email: newErrors.email ? '' : formData.email, 
        password: newErrors.password ? '' : formData.password 
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await manualSignIn(formData);
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
        
        {/* Left Side: Visual Illustration */}
        <div className="hidden lg:flex lg:w-1/2 h-full">
          <img 
            src={resetIllustration} 
            alt="Sign In" 
            className="h-full w-full object-cover" 
          />
        </div>

        {/* Right Side: Form Area */}
        <div className="flex w-full lg:w-1/2 h-full flex-col justify-center items-center p-6 bg-white overflow-y-auto">
          
          {/* Form Container - REDUCED WIDTH for professional look (max-w-md is 448px) */}
          <div className="w-full max-w-md flex flex-col items-center">
            
            {/* Logo - Sized appropriately */}
            <div className="flex h-32 w-32 mb-4 items-center justify-center overflow-hidden">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
              <p className="text-gray-500 mt-1 text-xs">Ready to start selling today?</p>
            </div>

            <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
              {fieldErrors.general && (
                <p className="text-red-600 text-[11px] font-semibold text-center bg-red-50 py-2 rounded-md border border-red-100">
                  {fieldErrors.general}
                </p>
              )}

              {/* Email Input */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={fieldErrors.email || "Email Address"}
                  className={`w-full rounded-md border h-12 px-4 focus:outline-none transition-all text-sm
                    ${fieldErrors.email ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-[#EFB034] placeholder-gray-400'}`}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={fieldErrors.password || "Password"}
                  className={`w-full rounded-md border h-12 pl-4 pr-12 focus:outline-none transition-all text-sm
                    ${fieldErrors.password ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-[#EFB034] placeholder-gray-400'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 ${fieldErrors.password ? 'text-red-500' : 'text-gray-400'}`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input className="mr-2 h-3.5 w-3.5 accent-[#234E4D]" type="checkbox" />
                  Remember me
                </label>
                <button 
                  type="button" 
                  onClick={() => navigate('/forgot-password')} 
                  className="font-bold text-yellow-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              
              {/* Submit Button - Using your CSS Specs but constrained to max-w-md container */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', 
                  height: '48px',
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  background: '#EFB034FF',
                  borderRadius: '24px',
                  boxShadow: '0px 4px 9px #171a1f1C, 0px 0px 2px #171a1f1F',
                  opacity: isLoading ? 0.4 : 1,
                }}
                className="flex items-center justify-center transition-all active:scale-[0.98] hover:brightness-105"
              >
                {isLoading ? 'Processing...' : 'Sign In'}
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-500">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => navigate('/vendorOnboarding')} 
                    className="font-bold text-[#234E4D] hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-[#234E4D] text-white py-3 px-6 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest">
          <div className="font-bold">Buy Smart. Sell Fast. Grow Together...</div>
          <div className="flex items-center gap-1">
            <span>© 2026 Vendor Portal.</span>
            <span className="ml-1 font-bold italic">eki<span className="text-[8px] font-normal not-italic ml-0.5">TM</span></span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-yellow-400">Support</a>
            <a href="#" className="hover:text-yellow-400 font-bold">Terms</a>
            <span className="border-l border-white/20 pl-6 hidden md:inline">Ijoema Ltd</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;