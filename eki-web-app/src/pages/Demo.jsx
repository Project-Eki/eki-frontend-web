import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';

import loginIllustration from '../assets/Login.jpeg';
import logoImage from '../assets/logo.jpeg';

import { validateLoginForm } from '../utils/Validation';
import { SigninUser as manualLogin } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

// ─── Field error component ────────────────────────────────────────────────────
const FieldError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 ml-1">
      <AlertCircle size={13} className="text-red-500 shrink-0" />
      <span className="text-[12px] text-red-500 font-medium">{message}</span>
    </div>
  );
};

// ─── Login Page ───────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData]         = useState({ email: '', password: '' });
  const [isLoading, setIsLoading]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({
    email: '',
    password: '',
    apiError: '',
  });

  const isFormFilled =
    formData.email.trim() !== '' && formData.password.trim() !== '';

  // ── Auth success handler ──────────────────────────────────────────────────
  const handleAuthSuccess = (response) => {
    const authData     = response?.data?.data || response?.data;
    const accessToken  = authData?.access || authData?.token;
    const refreshToken = authData?.refresh;
    const userRole     = (authData?.user?.role || authData?.role || 'vendor').toString().toLowerCase();

    if (accessToken) {
      login(accessToken, userRole, refreshToken);
      if (userRole.includes('admin'))       navigate('/admindashboard');
      else if (userRole.includes('vendor')) navigate('/vendordashboard');
      else                                  navigate('/');
    } else {
      setFieldErrors(prev => ({
        ...prev,
        apiError: "Login was successful but no access token was received. Please try again.",
      }));
    }
  };

  // ── Input handlers ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, apiError: '' }));
    const { errors } = validateLoginForm({ ...formData, [name]: value });
    setFieldErrors(prev => ({
      ...prev,
      [name]: value.length > 0 && errors[name] ? errors[name] : '',
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value.trim()) {
      const { errors } = validateLoginForm(formData);
      setFieldErrors(prev => ({ ...prev, [name]: errors[name] }));
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { isValid, errors } = validateLoginForm(formData);
    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, ...errors, apiError: '' }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await manualLogin(formData);
      handleAuthSuccess(result);
    } catch (err) {
      const status    = err.response?.status;
      const serverMsg = err.response?.data?.message || err.response?.data?.detail || '';
      let apiError    = "Something went wrong. Please try again later.";

      if (status === 403) {
        apiError = "Your account is awaiting admin approval. You'll be notified once it's activated.";
      } else if (status === 401 || serverMsg.toLowerCase().includes('invalid') || serverMsg.toLowerCase().includes('credentials')) {
        apiError = "Incorrect email or password. Please check your details and try again.";
      } else if (status === 404 || serverMsg.toLowerCase().includes('not found') || serverMsg.toLowerCase().includes('not registered')) {
        apiError = "No account found with this email address. Please sign up to get started.";
      } else if (serverMsg) {
        apiError = serverMsg;
      }

      setFieldErrors({ email: '', password: '', apiError });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col min-h-screen bg-white overflow-hidden"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* ── Main split layout — strict 50/50 ── */}
      <div
        className="flex flex-1 w-full"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >

        {/* ── Left: Illustration — exactly 50% ── */}
        <div
          className="hidden lg:block relative overflow-hidden"
          style={{ width: "50%", flexShrink: 0 }}
        >
          <img
            src={loginIllustration}
            alt="Login Illustration"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.08)", zIndex:1 }} />
          <div style={{ position:"absolute", top:-24, left:-24, width:128, height:128, border:"4px solid #235E5D", borderRadius:"50%", opacity:0.35, zIndex:2 }} />
          <div style={{ position:"absolute", bottom:-40, right:-24, width:160, height:160, border:"4px solid #EFB034", borderRadius:8, opacity:0.35, transform:"rotate(12deg)", zIndex:2 }} />
          <div style={{ position:"absolute", top:"33%", left:-32, width:96, height:96, border:"4px solid #235E5D", borderRadius:8, opacity:0.2, transform:"rotate(-12deg)", zIndex:2 }} />
          <div style={{ position:"absolute", bottom:"25%", right:-32, width:112, height:112, border:"4px solid #EFB034", borderRadius:"50%", opacity:0.35, zIndex:2 }} />
        </div>

        {/* ── Right: Form panel — exactly 50% ── */}
        <div
          className="flex items-center justify-center bg-white overflow-y-auto"
          style={{ width: "50%", flexShrink: 0, position: "relative" }}
        >
          {/*
            Back arrow — absolutely positioned at the very top-left
            corner of the form panel, flush against the image boundary.
          */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group"
            style={{
              position: "absolute",
              top: 28,
              left: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#235E5D",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              zIndex: 10,
            }}
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
              style={{ color: "#235E5D" }}
            />
            <span
              className="text-[13px] font-medium group-hover:underline"
              style={{ color: "#235E5D" }}
            >
              Back to home
            </span>
          </button>

          {/* Centred form content */}
          <div style={{ width: "100%", maxWidth: 420, padding: "32px 48px" }}>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img
                src={logoImage}
                alt="Eki Logo"
                style={{ height: "80px", width: "auto", objectFit: "contain" }}
              />
            </div>

            {/* Heading */}
            <div className="mb-6 text-center">
              <h2 className="text-[22px] font-bold text-gray-900 leading-tight">
                Welcome back! ready to sell?
              </h2>
            </div>

            {/* Form */}
            <form style={{ width: "100%" }} onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="john@example.com"
                    className={`w-full rounded-xl border h-12 pl-10 pr-4 focus:outline-none transition-all text-sm text-slate-900 bg-white
                      ${fieldErrors.email
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                      }`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  />
                </div>
                <FieldError message={fieldErrors.email} />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 14 }}>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Create a strong password"
                    className={`w-full rounded-xl border h-12 pl-10 pr-12 focus:outline-none transition-all text-sm text-slate-900 bg-white
                      ${fieldErrors.password || fieldErrors.apiError
                        ? 'border-red-400 focus:border-red-400'
                        : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                      }`}
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#EFB034] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
                <FieldError message={fieldErrors.apiError} />
              </div>

              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                <label className="flex items-center text-slate-600 cursor-pointer gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    style={{ accentColor: "#235E5D" }}
                  />
                  <span className="text-[13px]">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[13px] font-semibold hover:underline"
                  style={{ color: "#EFB034", background: "none", border: "none", padding: 0, cursor: "pointer" }}
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={isLoading || !isFormFilled}
                style={{
                  display: "block",
                  width: "100%",
                  height: 48,
                  borderRadius: 99,
                  border: "none",
                  backgroundColor: isFormFilled && !isLoading ? "#EFB034" : "#D1D5DB",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: isFormFilled && !isLoading ? "pointer" : "not-allowed",
                  fontFamily: "Poppins, sans-serif",
                  marginBottom: 20,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  if (isFormFilled && !isLoading) {
                    e.target.style.backgroundColor = "#d99c1c";
                    e.target.style.boxShadow = "0 8px 20px rgba(239,176,52,0.35)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = isFormFilled && !isLoading ? "#EFB034" : "#D1D5DB";
                  e.target.style.boxShadow = "none";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                {isLoading ? "Please wait..." : "Login"}
              </button>

              {/* Sign up link */}
              <div style={{ textAlign: "center" }}>
                <p className="text-[13px] text-slate-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate('/vendorOnboarding')}
                    className="font-semibold hover:underline"
                    style={{ color: "#235E5D", background: "none", border: "none", padding: 0, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: 13 }}
                  >
                    Sign up
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
};

export default Login;