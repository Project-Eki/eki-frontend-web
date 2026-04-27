import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import resetIllustration from '../assets/reset.jpeg';
import { passwordResetConfirm } from '../services/authService';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || '';
  const [otp_code] = useState(location.state?.otp_code || '');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(60);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormFilled = new_password.length > 0 && confirm_password.length > 0;

  // Lock body scroll on mount, restore on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 60-second countdown before auto-redirect after success
  useEffect(() => {
    if (!isSuccess) return;
    if (redirectCountdown <= 0) {
      navigate('/login');
      return;
    }
    const timer = setInterval(() => setRedirectCountdown(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [isSuccess, redirectCountdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (new_password !== confirm_password) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setIsLoading(true);

    const payload = {
      email: emailFromState,
      otp_code: String(otp_code),
      new_password,
      confirm_password,
    };

    console.log(' Sending to confirm-password-reset:', payload);

    try {
      await passwordResetConfirm(payload);
      setIsSuccess(true);
    } catch (err) {
      const djangoErrors = err.response?.data?.errors ?? err.response?.data;
      if (djangoErrors && typeof djangoErrors === 'object') {
        const messages = Object.entries(djangoErrors)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join(' | ');
        setError(messages);
      } else {
        setError(err.message || 'Reset failed. Try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');`}</style>

      {/* Navbar — shrinks to its natural height */}
      <div className="flex-shrink-0">
        <Navbar />
      </div>

      {/* Body — fills all remaining space between Navbar and Footer */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Left: illustration */}
        <div className="hidden lg:block w-1/2 overflow-hidden flex-shrink-0">
          <img
            src={resetIllustration}
            alt="Reset Password Illustration"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>

        {/* Right: form — centered, no scroll */}
        <div className="flex-1 flex flex-col justify-center items-center overflow-hidden px-8 md:px-16 bg-white">
          <div className="w-full max-w-md">

            {isSuccess ? (
              <div className="text-center">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6">
                  <h2
                    className="text-3xl md:text-4xl text-emerald-700 mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}
                  >
                    Success!
                  </h2>
                  <p
                    className="text-sm text-gray-600 mb-3"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                  >
                    Password reset successfully. You will be redirected to login in{' '}
                    <span className="font-semibold text-emerald-700">{redirectCountdown}s</span>.
                  </p>
                  <div className="w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
                      style={{ width: `${(redirectCountdown / 60) * 100}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/login"
                  className="text-sm text-[#EFB034] hover:underline"
                  style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                >
                  Click here to go now
                </Link>
              </div>
            ) : (
              <>
                {/* Heading */}
                <div className="mb-7 text-left">
                  <h2
                    className="text-3xl md:text-4xl text-slate-900 tracking-tight"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}
                  >
                    Reset Password
                  </h2>
                  <p
                    className="text-slate-400 mt-1 text-[11px] uppercase tracking-[0.1em]"
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
                  >
                    Create a strong new password below.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>

                  {/* New Password */}
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={new_password}
                      onChange={(e) => { setNewPassword(e.target.value); if (error) setError(''); }}
                      placeholder="New Password"
                      className={`w-full rounded-xl border h-14 px-5 pr-12 focus:outline-none transition-all text-sm text-slate-900 ${
                        error && (error.includes('8') || error.includes('new_password'))
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 focus:border-[#EFB034]'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-slate-400 hover:text-[#EFB034] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirm_password}
                      onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                      placeholder="Confirm Password"
                      className={`w-full rounded-xl border h-14 px-5 pr-12 focus:outline-none transition-all text-sm text-slate-900 ${
                        error && (error.includes('match') || error.includes('confirm_password'))
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 focus:border-[#EFB034]'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-slate-400 hover:text-[#EFB034] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Error */}
                  {error && (
                    <p
                      className="text-[11px] text-red-500 italic -mt-2"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Password Requirements */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
                    <p
                      className="text-[11px] text-[#234E4D] uppercase tracking-wider mb-2"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
                    >
                      Password Requirements
                    </p>
                    <ul className="space-y-1.5">
                      {[
                        { label: 'At least 8 characters long', met: new_password.length >= 8 },
                        { label: 'Contains an uppercase letter', met: /[A-Z]/.test(new_password) },
                        { label: 'Contains a number', met: /[0-9]/.test(new_password) },
                      ].map(({ label, met }) => (
                        <li key={label} className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${met ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          <span
                            className="text-[11px] text-gray-600"
                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}
                          >
                            {label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !isFormFilled}
                    className={`w-full h-14 text-base text-white rounded-full flex items-center justify-center transition-all duration-300 active:scale-[0.98] ${
                      isFormFilled
                        ? 'bg-[#EFB034] shadow-md shadow-yellow-200/50 hover:brightness-105'
                        : 'bg-gray-300 cursor-not-allowed'
                    } ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
                    style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
                  >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </button>

                  {/* Back to Login */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="text-[11px] uppercase tracking-widest text-[#234E4D] hover:underline"
                      style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}
                    >
                      Back to Login
                    </button>
                  </div>

                </form>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Footer — shrinks to its natural height */}
      <div className="flex-shrink-0">
        <Footer />
      </div>
    </div>
  );
};

export default ResetPasswordPage;