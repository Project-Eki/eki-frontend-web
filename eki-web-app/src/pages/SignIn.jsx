import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import resetIllustration from '../assets/signin.jpeg';
import logoImage from '../assets/logo.jpeg';

import { signInUser as manualSignIn } from "../services/authService"; 
// import { googleAuthService } from "../services/GoogleAuth";

const SignIn = () => {
  const navigate = useNavigate();
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', general: '' });

  useEffect(() => {
    const init = async () => {
      try {
        // googleAuthService.initializeGoogle logic here if needed
        window.google?.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
        });
      } catch (err) {
        console.error("Failed to load Google Identity Services", err);
      }
    };
    init();
  }, [GOOGLE_CLIENT_ID]);

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

  const handleGoogleResponse = async (response) => {
    // Google auth logic
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (fieldErrors.general) {
      setFieldErrors(prev => ({ ...prev, general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation matching your ForgotPassword style
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
      // Clear values to show the error in placeholder
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
      // On general failure, clear password to prompt retry
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
        
        {/* Illustration */}
        <div className="hidden md:flex w-2/5 h-full">
          <img 
            src={resetIllustration} 
            alt="Sign In" 
            className="h-full w-full object-cover" 
          />
        </div>

        {/* Form Content */}
        <div className="flex w-full md:w-3/5 h-full flex-col justify-center items-center p-12 bg-white">
          <div className="mb-10 flex flex-col items-center">
            <div className="flex h-60 w-60 mt-10 items-center justify-center overflow-hidden -translate-y-12">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center -mt-24">Welcome back!</h2>
            <p className="text-gray-500 text-center mt-3 text-xs max-w-sm">
              Ready to start selling today?
            </p>
          </div>

          <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit} noValidate>
            {fieldErrors.general && (
              <p className="text-red-600 text-xs font-semibold text-center">{fieldErrors.general}</p>
            )}

            {/* Email Input */}
            <div className="relative">
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={fieldErrors.email || "Email Address"}
                className={`w-full rounded-md border py-3 pl-4 pr-4 focus:outline-none bg-white transition-all
                  ${fieldErrors.email ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-gray-400 placeholder-gray-500'}`}
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
                className={`w-full rounded-md border py-3 pl-4 pr-12 focus:outline-none bg-white transition-all
                  ${fieldErrors.password ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-gray-400 placeholder-gray-500'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-4 top-3.5 transition-colors ${fieldErrors.password ? 'text-red-500' : 'text-gray-400'}`}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] -mt-2">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input className="mr-2 h-3.5 w-3.5 accent-[#234E4D]" type="checkbox" />
                Remember me
              </label>
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')} 
                className="font-semibold text-yellow-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3.5 font-bold text-white shadow-md transition-all active:scale-[0.98] 
                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={() => navigate('/vendorOnboarding')} 
                  className="font-semibold text-[#234E4D] hover:underline"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
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

export default SignIn;