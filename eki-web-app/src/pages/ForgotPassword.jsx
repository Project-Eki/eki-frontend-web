import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetRequest } from '../services/api';

const ForgotPassword = ({
  logoUrl = logoImage,
  illustrationUrl = resetIllustration
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email address');
      setEmail('');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await passwordResetRequest({ email });
      setSuccessMessage('A password reset code has been sent to your email.');
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.email?.[0] ||
        'Failed to send reset code. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
        
        {/* Illustration */}
        <div className="hidden md:flex w-2/5 h-full">
          <img src={illustrationUrl} alt="Forgot Password" title="Forgot Password" className="h-full w-full object-cover" />
        </div>

        {/* Form Content */}
        <div className="flex w-full md:w-3/5 h-full flex-col justify-center items-center p-12 bg-white">
          <div className="mb-10 flex flex-col items-center">
            <div className="flex h-60 w-60 mt-10 items-center justify-center overflow-hidden -translate-y-12">
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center -mt-24">Forgot Password?</h2>
            <p className="text-gray-500 text-center mt-3 text-xs max-w-sm">
              Enter your email and we'll send you a recovery link.
            </p>
          </div>

          <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit} noValidate>
            {successMessage && (
              <p className="text-green-600 text-xs font-semibold text-center">{successMessage}</p>
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={error || "Enter email"}
              className={`w-full rounded-md border py-3 pl-4 pr-4 focus:outline-none bg-white
                ${error ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-gray-400 placeholder-gray-500'}`}
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3.5 font-bold text-white shadow-md transition-all active:scale-[0.98] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
            >
              {isLoading ? 'Sending...' : 'Reset Password'}
            </button>

            <div className="text-center mt-4">
              {/* 3. Updated Button to trigger Navigation */}
              <button 
                type="button"
                onClick={() => navigate('/signin')} 
                className="text-xs font-semibold text-gray-600 hover:text-yellow-600 hover:underline"
              >
                 Sign in
              </button>
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

export default ForgotPassword;