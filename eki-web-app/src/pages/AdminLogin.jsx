import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import adminIllustration from '../assets/Login.jpeg';
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/Validation';
import { SigninUser as manualLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
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

  const handleAuthSuccess = (data) => {
    const token = data?.access || data?.token || data?.access_token;
    const role = data?.role?.toLowerCase() || 'admin';

    if (token) login(token, role);
    navigate('/admindashboard');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    const { errors } = validateLoginForm(newFormData);
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
      const data = await manualLogin({ ...formData, role: 'admin' });
      handleAuthSuccess(data);
    } catch (err) {
      const msg = err.response?.data?.detail || "Invalid admin credentials";
      setFieldErrors({ email: '', password: '', general: msg });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">

      <div className="flex-1 flex w-full overflow-hidden">
        {/* Left Side: Image Section */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-white">
          {/* Decorative Shapes */}
          <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-[#235E5DFF] rounded-full opacity-20 z-10"></div>
          <div className="absolute -bottom-10 -right-6 w-40 h-40 border-4 border-[#EFB034] rounded-lg opacity-20 transform rotate-12 z-10"></div>
          <div className="absolute top-1/3 -left-8 w-24 h-24 border-4 border-[#235E5DFF] rounded-lg opacity-10 transform -rotate-12 z-10"></div>
          <div className="absolute bottom-1/4 -right-8 w-28 h-28 border-4 border-[#EFB034] rounded-full opacity-20 z-10"></div>

          {/* Image Container */}
          <div className="relative z-20 w-full h-full flex items-center justify-center p-8">
            <div className="relative w-full h-full max-h-[70vh]">
              <img
                src={adminIllustration}
                alt="Admin Login Illustration"
                className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#235E5D] to-[#EFB034] rounded-[40px] opacity-10 blur-3xl -z-10 scale-105"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Section */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white overflow-y-auto">
          <div className="w-full max-w-md px-8 py-6">
            <div className="mb-5 text-left">
              <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
                Admin Login
              </h2>
              <p className="text-gray-500 text-[14px] uppercase tracking-widest">
                Authorized Personnel Only
              </p>
            </div>

            <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>

              {fieldErrors.general && (
                <div className="text-red-600 text-sm font-bold py-2 text-center bg-red-50 rounded-xl border border-red-100 mb-2">
                  {fieldErrors.general}
                </div>
              )}

              {/* Email Input */}
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Admin Email"
                  className={`w-full rounded-xl border h-12 px-4 focus:outline-none transition-all text-sm text-slate-900 bg-white
                    ${fieldErrors.email
                      ? 'border-red-500 bg-red-50/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                    }`}
                />
                {fieldErrors.email && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-bold italic pointer-events-none">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                  className={`w-full rounded-xl border h-12 px-4 pr-24 focus:outline-none transition-all text-sm text-slate-900 bg-white
                    ${fieldErrors.password
                      ? 'border-red-500 bg-red-50/10 focus:border-red-500'
                      : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                    }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
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

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !isFormFilled}
                className={`w-full h-12 rounded-full font-bold transition-all duration-300
                  ${isFormFilled && !isLoading
                    ? 'bg-[#efb034] hover:bg-[#d99c1c] hover:-translate-y-1 hover:shadow-lg text-white cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed text-white/70'
                  }`}
              >
                {isLoading ? 'Please wait...' : 'Login'}
              </button>

              {/* Exit Link */}
              <div className="text-center pt-3">
                <p className="text-[13px] text-slate-600">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="text-[#234E4D] font-semibold hover:underline"
                  >
                    Exit to Public Portal
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#234E4D] text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest">
          <div className="font-bold">Admin Portal — Secure Access Only</div>
          <div>© 2026 eki™ | Ijoema Ltd</div>
        </div>
      </footer>

    </div>
  );
};

export default AdminLogin;