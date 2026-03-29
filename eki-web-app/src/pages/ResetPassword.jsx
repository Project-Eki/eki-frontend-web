import React, { useState } from 'react';
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

  const [otp_code, setOtpCode] = useState(location.state?.otp_code || '');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dynamic button logic: turns yellow only if both fields are filled
  const isFormFilled = new_password.length > 0 && confirm_password.length > 0;

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

    try {
      await passwordResetConfirm({
        email: emailFromState,
        otp_code: String(otp_code),
        new_password,
        confirm_password,
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/sign-in');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Reset failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 flex w-full overflow-hidden">
        
        {/* Left Side: Image Section with Decorative Shapes */}
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
                src={resetIllustration}
                alt="Reset Illustration"
                className="w-full h-full object-cover rounded-[40px] shadow-2xl border-4 border-white/20"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#235E5D] to-[#EFB034] rounded-[40px] opacity-10 blur-3xl -z-10 scale-105"></div>
            </div>
          </div>
        </div>

        {/* Right Side: Reset Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-white overflow-y-auto">
          <div className="w-full max-w-md px-8 py-6">
            
            {isSuccess ? (
              <div className="text-center">
                <div className="bg-emerald-50 text-emerald-700 p-8 rounded-2xl border border-emerald-100 mb-6">
                  <h2 className="text-[28px] font-black mb-2">Success!</h2>
                  <p className="text-[14px] text-gray-600">Password reset successfully. Redirecting you to sign in...</p>
                </div>
                <Link 
                  to="/sign-in" 
                  className="text-[#EFB034] font-semibold hover:underline text-[14px]"
                >
                  Click here to go now
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-left">
                  <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
                    Secure your account
                  </h2>
                  <p className="text-gray-500 text-[14px]">
                    Create a strong new password below
                  </p>
                </div>

                <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
                  
                  {/* New Password Input */}
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={new_password}
                      onChange={(e) => { setNewPassword(e.target.value); if(error) setError(''); }}
                      placeholder="New Password"
                      className={`w-full rounded-full border h-12 px-5 pr-12 focus:outline-none transition-all text-sm text-slate-900 bg-white
                        ${error && error.includes('8') 
                          ? 'border-red-500 bg-red-50/10 focus:border-red-500' 
                          : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                        }`}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)} 
                        className="text-slate-400 hover:text-[#EFB034] transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm_password}
                      onChange={(e) => { setConfirmPassword(e.target.value); if(error) setError(''); }}
                      placeholder="Confirm Password"
                      className={`w-full rounded-full border h-12 px-5 pr-12 focus:outline-none transition-all text-sm text-slate-900 bg-white
                        ${error && error.includes('match') 
                          ? 'border-red-500 bg-red-50/10 focus:border-red-500' 
                          : 'border-slate-200 focus:border-[#EFB034] focus:ring-1 focus:ring-[#EFB034]/20'
                        }`}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                        className="text-slate-400 hover:text-[#EFB034] transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <p className="text-red-500 text-[11px] font-bold text-center">{error}</p>
                  )}

                  {/* Requirements Box */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-[11px] font-bold text-[#234E4D] mb-2 uppercase tracking-wider">
                      Password Requirements
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-gray-600 font-medium">
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${new_password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div> 
                        At least 8 characters long
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(new_password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div> 
                        Contains an uppercase letter
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(new_password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div> 
                        Contains a number
                      </li>
                    </ul>
                  </div>

                  {/* Reset Password Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !isFormFilled}
                    className={`w-full h-12 rounded-full font-bold transition-all duration-300
                      ${isFormFilled && !isLoading
                        ? 'bg-[#efb034] hover:bg-[#d99c1c] hover:-translate-y-1 hover:shadow-lg text-white cursor-pointer' 
                        : 'bg-gray-300 cursor-not-allowed text-white/70'
                      }`}
                  >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </button>

                  {/* Back to Login Link */}
                  <div className="text-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => navigate('/sign-in')} 
                      className="text-[13px] font-semibold text-[#234E4D] hover:underline"
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
      
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;