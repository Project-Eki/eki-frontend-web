import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetConfirm } from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [otp_code, setOtpCode] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new_password.length < 8) { setError('Min 8 chars'); return; }
    if (new_password !== confirm_password) { setError('Passwords must match'); return; }
    if (!otp_code.trim()) { setError('OTP code is required'); return; }
    setError('');
    setIsLoading(true);
    try {
      await passwordResetConfirm({
        email: emailFromState,
        otp_code,
        new_password,
        confirm_password,
      });
      navigate('/signin');
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.detail ||
        data?.otp_code?.[0] ||
        data?.new_password?.[0] ||
        data?.non_field_errors?.[0] ||
        'Password reset failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
        <div className="hidden md:flex w-1/2 h-full">
          <img src={resetIllustration} alt="Reset" className="h-full w-full object-cover" />
        </div>
        <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-12 bg-white">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-40 w-60 mt-10 items-center justify-center overflow-hidden -translate-y-12">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-0 text-center -mt-24">Reset Password</h2>
            {emailFromState && (
              <p className="text-xs text-gray-500 mt-1">for {emailFromState}</p>
            )}
          </div>
          
          <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>

            <input
              type="text"
              value={otp_code}
              onChange={(e) => { setOtpCode(e.target.value); setError(''); }}
              placeholder="Enter 6-digit OTP code"
              maxLength={6}
              aria-label="OTP Code"
              className={`w-full rounded-md border py-3 pl-3 pr-4 focus:outline-none bg-gray-50/30
                ${error && !otp_code ? 'border-red-500 placeholder-red-500' : 'border-gray-300 focus:border-yellow-500 placeholder-black'}`}
            />

            <input
              type="password"
              value={new_password}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              aria-label="New Password"
              className={`w-full rounded-md border py-3 pl-3 pr-4 focus:outline-none bg-gray-50/30
                ${error && new_password.length < 8 ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-yellow-500 placeholder-black'}`}
            />
            
            <input
              type="password"
              value={confirm_password}
              onChange={(e) => { setConfirmPassword(e.target.value); if (new_password === e.target.value) setError(''); }}
              placeholder={error && confirm_password !== new_password ? 'Passwords must match' : "Confirm new password"}
              aria-label="Confirm Password"
              className={`w-full rounded-md border py-3 pl-3 pr-4 focus:outline-none bg-gray-50/30
                ${error && confirm_password !== new_password ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-yellow-500 placeholder-black'}`}
            />

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <div className="text-gray-600 text-xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                REQUIREMENTS
              </div>
              <ul className="list-none space-y-1 ml-6">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full border border-gray-400"></div>
                  At least 8 characters long
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full border border-gray-400"></div>
                  Contains an uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full border border-gray-400"></div>
                  Contains a number or symbol
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3 font-bold text-white shadow-md transition-all active:scale-[0.98] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
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

export default ResetPasswordPage;
