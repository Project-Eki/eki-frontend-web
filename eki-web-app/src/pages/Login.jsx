import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import loginIllustration from '../assets/Login.jpeg';
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/Validation';
import { SigninUser as manualLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Navbar2 from "../components/Navbar2";
import Footer from "../components/Footer"; 

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

  const isFormFilled = formData.email.trim() !== '' && formData.password.trim() !== '';

  const handleAuthSuccess = (response) => {
    const authData = response?.data?.data || response?.data;
    const accessToken = authData?.access || authData?.token;
    const refreshToken = authData?.refresh;
    const userRole = (authData?.user?.role || authData?.role || 'vendor').toString().toLowerCase();

    if (accessToken) {
      login(accessToken, userRole, refreshToken); 

      if (userRole.includes('admin')) {
        navigate('/admindashboard');
      } else if (userRole.includes('vendor')) {
        navigate('/vendordashboard');
      } else {
        navigate('/');
      }
    } else {
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
      handleAuthSuccess(result);
    } catch (err) {
      const apiError = 
        err.response?.status === 403 
          ? "Your account is pending admin approval." 
          : err.response?.data?.message || err.response?.data?.detail || "Invalid credentials";

      setFieldErrors({ email: '', password: '', general: apiError });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <Navbar2 />

      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Left Side: Stagnant Image */}
        <div className="hidden lg:block lg:w-1/2 h-full overflow-hidden">
          <img 
            src={loginIllustration} 
            alt="Login Illustration" 
            className="w-full h-full object-cover pointer-events-none" 
          />
        </div>

        {/* Right Side: Login Form Container */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-12 bg-white overflow-hidden">
          <div className="w-full max-w-md animate-in fade-in duration-500">
            
            <div className="mb-8 text-left">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                Welcome back! ready to sell?
              </h2>
            </div>

            <form className="w-full space-y-5" onSubmit={handleSubmit} noValidate>
              
              {fieldErrors.general && (
                <div className="text-red-600 text-[11px] font-bold py-3 text-center bg-red-50 rounded-xl border border-red-100">
                  {fieldErrors.general}
                </div>
              )}

              {/* Email Input */}
              <div className="relative flex items-center">
                <input
                  name="email"
                  type="email"
                  autoComplete="email" // Fixed: Added for browser context
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email Address"
                  className={`w-full rounded-xl border h-12 px-5 focus:outline-none transition-all text-sm text-slate-900
                    ${fieldErrors.email ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#EFB034]'}`}
                />
                {fieldErrors.email && (
                  <span className="absolute right-4 text-[10px] text-red-500 font-bold italic pointer-events-none">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="relative flex items-center">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password" 
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                  className={`w-full rounded-xl border h-12 pl-5 pr-24 focus:outline-none transition-all text-sm text-slate-900
                    ${fieldErrors.password ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#EFB034]'}`}
                />
                <div className="absolute right-4 flex items-center gap-2">
                  {fieldErrors.password && (
                    <span className="text-[10px] text-red-500 font-bold italic pointer-events-none">
                      {fieldErrors.password}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-[#EFB034] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 font-bold">
                <label className="flex items-center text-slate-500 cursor-pointer">
                  <input className="mr-2 h-4 w-4 accent-[#234E4D] border-slate-300 rounded" type="checkbox" />
                  Remember me
                </label>
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-[#EFB034] hover:underline">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || !isFormFilled}
                className={`w-full h-12 text-sm font-bold text-white rounded-full 
                  flex items-center justify-center transition-all duration-300 active:scale-[0.98] 
                  ${isFormFilled 
                    ? 'bg-[#EFB034] shadow-md shadow-yellow-100 hover:brightness-105' 
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                  ${isLoading ? 'opacity-70' : 'opacity-100'}`}
              >
                {isLoading ? 'Wait...' : 'Login'} 
              </button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => navigate('/vendorOnboarding')} className="text-[#234E4D] hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;