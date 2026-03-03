import React, { useState } from 'react';
import logoImage from '../image/logo.jpeg';
import resetIllustration from '../image/reset.jpeg';

const ForgotPassword = ({ 
  logoUrl = logoImage, 
  illustrationUrl = resetIllustration,
  onBackToLogin = () => console.log("Navigate back") 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = (e) => {
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
    console.log('Reset link sent');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
       
        <div className="hidden md:flex w-2/5 h-full">
          <img src={illustrationUrl} alt="Forgot Password" title="Forgot Password" className="h-full w-full object-cover" />
        </div>

        <div className="flex w-full md:w-3/5 h-full flex-col justify-center items-center p-12 bg-white">
          <div className="mb-10 flex flex-col items-center">
            <div className="flex h-60 w-60 mt-10 items-center justify-center overflow-hidden -translate-y-12">
              <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 text-center -mt-10">Forgot Password?</h2>
            <p className="text-gray-500 text-center mt-3 text-xs max-w-sm">
              Enter your email and we'll send you a recovery link.
            </p>
          </div>

          <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit} noValidate>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder={error || "Enter email"}
              className={`w-full rounded-md border py-3 pl-4 pr-4 focus:outline-none bg-white
                ${error ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-gray-400 placeholder-gray-500'}`}
            />
            
            <button type="submit" className="w-full rounded-full bg-yellow-500 py-3.5 font-bold text-white shadow-md hover:bg-yellow-600 transition-all active:scale-[0.98]">
              Reset Password
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={onBackToLogin}
                className="text-xs font-semibold text-gray-600 hover:text-yellow-600 hover:underline"
              >
                Back to Sign in
              </button>
            </div>
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

export default ForgotPassword;
