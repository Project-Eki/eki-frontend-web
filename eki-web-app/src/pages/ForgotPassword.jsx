import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetRequest } from '../services/authService'; 
import Navbar2 from "../components/Navbar2";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Button turns yellow only if email is not empty
  const isEmailFilled = email.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await passwordResetRequest(email);
      // Navigate to OTP page and pass the email address
      navigate('/otp', { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      {/* Navbar fixed at the top */}
      <Navbar2 />

      {/* Main Content Area - stagnant and non-scrollable */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Left Side: Stagnant Image */}
        <div className="hidden lg:block lg:w-1/2 h-full overflow-hidden">
          <img 
            src={resetIllustration} 
            alt="Reset Password Illustration" 
            className="w-full h-full object-cover pointer-events-none" 
          />
        </div>

        {/* Right Side: Form Container */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-16 bg-white overflow-hidden">
          <div className="w-full max-w-md animate-in fade-in duration-500">
            
            <div className="mb-8 text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                Forgot Password?
              </h2>
              <p className="text-slate-400 mt-2 text-xs uppercase tracking-[0.1em] font-medium">
                No worries! Enter your email to receive an OTP.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-6" noValidate>
              
              {/* Email Input with internal validation text */}
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => { 
                    setEmail(e.target.value); 
                    if (error) setError(''); 
                  }}
                  placeholder="Enter your email"
                  className={`w-full rounded-xl border h-14 px-5 focus:outline-none transition-all text-sm text-slate-900
                    ${error ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#EFB034]'}`}
                />
                {error && (
                  <span className="absolute right-4 text-[10px] text-red-500 font-bold italic pointer-events-none">
                    {error}
                  </span>
                )}
              </div>

              {/* Dynamic Submit Button: Gray to Yellow */}
              <button 
                type="submit"
                disabled={isLoading || !isEmailFilled} 
                className={`w-full h-14 text-base font-bold text-white rounded-full 
                  flex items-center justify-center transition-all duration-300 active:scale-[0.98] 
                  ${isEmailFilled 
                    ? 'bg-[#EFB034] shadow-md shadow-yellow-200/50 hover:brightness-105 opacity-100' 
                    : 'bg-gray-300 cursor-not-allowed opacity-80'
                  }
                  ${isLoading ? 'opacity-60 cursor-wait' : ''}`}
              >
                {isLoading ? "Sending..." : "Reset Password"}
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button" 
                  onClick={() => navigate('/sign-in')} // Updated to your file name 'sign in'
                  className="text-xs font-bold uppercase tracking-widest text-[#234E4D] hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer fixed at the bottom */}
      <Footer />
    </div>
  );
};

export default ForgotPassword;