import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetConfirm } from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Grab email passed from the OTP page state
  const emailFromState = location.state?.email || '';

  const [otp_code, setOtpCode] = useState('');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validations
    if (!otp_code.trim()) {
      setError('OTP code is required');
      setOtpCode('');
      return;
    }
    if (new_password.length < 8) {
      setError('Password must be min 8 chars');
      setNewPassword('');
      setConfirmPassword('');
      return;
    }
    if (new_password !== confirm_password) {
      setError('Passwords do not match');
      setConfirmPassword('');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await passwordResetConfirm({
        email: emailFromState,
        otp_code,
        new_password,
        confirm_password,
      });
      
      // SUCCESS: Navigate to Login
      alert("Password reset successful! Please sign in.");
      navigate('/login'); 
    } catch (err) {
      // Show server error inside the fields
      setError(err.message || 'Reset failed. Please try again.');
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
        
        {/* Illustration */}
        <div className="hidden md:flex w-1/2 h-full">
          <img src={resetIllustration} alt="Reset" className="h-full w-full object-cover" />
        </div>

        {/* Form Content */}
        <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-12 bg-white">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-40 w-60 mt-10 items-center justify-center overflow-hidden -translate-y-12">
              <img src={logoImage} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center -mt-24">Set New Password</h2>
            {emailFromState && (
              <p className="text-xs text-gray-500 mt-1">Resetting for: <b>{emailFromState}</b></p>
            )}
          </div>
          
          <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>

            {/* OTP Code Field */}
            <input
              type="text"
              value={otp_code}
              onChange={(e) => { setOtpCode(e.target.value); setError(''); }}
              placeholder={error && !otp_code ? error : "Enter 6-digit OTP code"}
              maxLength={6}
              className={`w-full rounded-md border py-3 px-4 focus:outline-none transition-all
                ${error && !otp_code ? 'border-red-500 placeholder-red-500 bg-red-50' : 'border-gray-300 focus:border-yellow-500'}`}
            />

            {/* New Password Field */}
            <input
              type="password"
              value={new_password}
              onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
              placeholder={error && !new_password ? error : "Enter new password"}
              className={`w-full rounded-md border py-3 px-4 focus:outline-none transition-all
                ${error && !new_password ? 'border-red-500 placeholder-red-500 bg-red-50' : 'border-gray-300 focus:border-yellow-500'}`}
            />
            
            {/* Confirm Password Field */}
            <input
              type="password"
              value={confirm_password}
              onChange={(e) => { setConfirmPassword(e.target.value); if (new_password === e.target.value) setError(''); }}
              placeholder={error && confirm_password !== new_password ? 'Passwords must match' : "Confirm new password"}
              className={`w-full rounded-md border py-3 px-4 focus:outline-none transition-all
                ${error && confirm_password !== new_password ? 'border-red-500 placeholder-red-500 bg-red-50' : 'border-gray-300 focus:border-yellow-500'}`}
            />

            {/* Password Requirements */}
            <div className="text-gray-600 text-[11px] bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2 font-bold text-emerald-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                SECURITY REQUIREMENTS
              </div>
              <ul className="grid grid-cols-1 gap-1 ml-1">
                <li className="flex items-center gap-2">• Min. 8 characters</li>
                <li className="flex items-center gap-2">• Use numbers or symbols</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-4 font-bold text-white shadow-md transition-all active:scale-[0.98] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>

            <div className="text-center">
              <button 
                type="button" 
                onClick={() => navigate('/login')} 
                className="text-xs font-semibold text-gray-500 hover:text-yellow-600"
              >
                Cancel and return to Login
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-[#234E4D] text-white py-3 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px]">
          <div className="font-bold">Buy Smart. Sell Fast. Grow Together...</div>
          <div>© 2026 Vendor Portal. ekiTM</div>
          <div className="font-bold">Ijoema ltd</div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;