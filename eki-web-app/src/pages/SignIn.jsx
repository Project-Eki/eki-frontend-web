import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import resetIllustration from '../assets/signin.jpeg';
import logoImage from '../assets/logo.jpeg';

import { signInUser as manualSignIn } from "../services/authService"; 
import { googleAuthService } from "../services/GoogleAuth";

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
        await googleAuthService.initializeGoogle(GOOGLE_CLIENT_ID);
        
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

  // ✅ FIX 1: improved error matching with lowercase checks
  const formatErrorMessage = (err) => {
    const rawMessage = err.message || "";
    if (rawMessage.toLowerCase().includes("verify")) {
      return "Please verify your email before signing in.";
    }
    if (rawMessage.toLowerCase().includes("expired")) {
      return "Your verification link has expired. Please request a new one.";
    }
    return rawMessage || "Invalid email or password";
  };

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
    setIsLoading(true);
    try {
      const data = await googleAuthService.sendTokenToBackend(response.credential, 'vendor');
      handleAuthSuccess(data);
    } catch (err) {
      setFieldErrors(prev => ({ 
        ...prev, 
        general: formatErrorMessage(err) 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name] || fieldErrors.general) {
      setFieldErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setFieldErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : "",
        general: ""
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await manualSignIn(formData);
      handleAuthSuccess(data);
    } catch (err) {
      setFieldErrors({ 
        email: "", 
        password: "", 
        general: formatErrorMessage(err) 
      });
      setFormData(prev => ({ ...prev, password: '' })); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInTrigger = () => {
    window.google?.accounts.id.prompt();
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
     
        <div className="hidden md:flex md:w-1/2 h-full">
          <img 
            alt="Sign In Visual" 
            className="h-full w-full object-cover" 
            src={resetIllustration}
          />
        </div>

        <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-8 lg:p-12 bg-white">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="h-40 w-40 mb-2 flex items-center justify-center">
              <img 
                alt="Logo" 
                className="h-full w-full object-contain" 
                src={logoImage} 
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>
            <p className="text-gray-500 text-sm mt-1">Ready to start selling today?</p>
          </div>

          <div className="w-full max-w-md">
            {fieldErrors.general && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                {fieldErrors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-3 px-4 focus:outline-none transition-all ${
                    fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#234E4D]'
                  }`}
                />
                {fieldErrors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.email}</p>}
              </div>

              <div className="relative w-full">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border py-3 pl-4 pr-12 focus:outline-none transition-all ${
                    fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#234E4D]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[14px] text-gray-400 hover:text-[#234E4D]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {fieldErrors.password && <p className="text-[10px] text-red-500 mt-1 ml-1">{fieldErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center text-gray-600 cursor-pointer">
                  <input className="mr-2 h-3.5 w-3.5 accent-[#234E4D]" type="checkbox" />
                  Remember me
                </label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="font-semibold text-yellow-600 hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-full py-3.5 font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                  isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D99201] hover:bg-[#c28201]'
                }`}
              >
                {isLoading ? 'Processing...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200"></span>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignInTrigger}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-300 bg-white py-3 px-4 font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="h-5 w-5" 
              />
              <span className="text-sm">Sign in with Google</span>
            </button>

            <div className="mt-8 text-center text-xs text-gray-500">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={() => navigate('/vendorOnboarding')} 
                className="font-bold text-[#234E4D] hover:underline"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

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