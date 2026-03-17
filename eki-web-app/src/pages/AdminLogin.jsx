import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import adminIllustration from '../assets/login.jpeg'; 
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/validation';
import { signInUser as manualLogin } from "../services/authService";
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

  // Handle successful login
  const handleAuthSuccess = (data) => {
    const token = data?.access || data?.token || data?.access_token;
    const role = data?.role?.toLowerCase() || 'admin';

    if (token) login(token, role); 
    navigate('/admindashboard'); 
  };

  // --- Real-Time Handle Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Run validation on every keystroke
    const { errors } = validateLoginForm(newFormData);

    // If typing and format is wrong, show the error label below
    if (value.length > 0 && errors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: errors[name], general: '' }));
    } else {
      setFieldErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  // --- Handle Blur (When user clicks away) ---
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
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="flex flex-1 overflow-hidden">

        {/* Left Side Illustration */}
        <div className="hidden lg:flex lg:w-1/2 h-full">
          <img
            src={adminIllustration}
            alt="Admin Login"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="flex w-full lg:w-1/2 h-full flex-col justify-center items-center p-6 bg-white overflow-y-auto">
          <div className="w-full max-w-md flex flex-col items-center">

            {/* Logo */}
            <div className="flex h-32 w-32 mb-4 items-center justify-center overflow-hidden">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Admin Login</h2>
              <p className="text-gray-500 mt-1 text-xs uppercase tracking-widest">
                Authorized Personnel Only
              </p>
            </div>

            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleSubmit} noValidate>

              {fieldErrors.general && (
                <p className="text-red-600 text-[11px] font-semibold text-center bg-red-50 py-2 rounded-md border border-red-100">
                  {fieldErrors.general}
                </p>
              )}

              {/* Email Input Group */}
              <div className="flex flex-col gap-1">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Admin Email"
                  className={`w-full rounded-md border h-12 px-4 focus:outline-none transition-all text-sm text-gray-900
                    ${fieldErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#EFB034]'}`}
                />
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
                    onClick={() => setShowPassword(prev => !prev)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors
                      ${fieldErrors.password ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  background: '#EFB034FF',
                  borderRadius: '24px',
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
                ) : 'Login'}
              </button>

              {/* Exit */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-xs text-gray-500 font-bold hover:text-[#234E4D] hover:underline"
                >
                  Exit to Public Portal
                </button>
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