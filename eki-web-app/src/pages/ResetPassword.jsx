import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

import resetIllustration from '../assets/reset.jpeg';
import { passwordResetConfirm } from '../services/authService';
import Navbar2 from "../components/Navbar2";
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
      setError('Min 8 characters required');
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
        navigate('/sign-in'); // Matches your file name 'sign in'
      }, 3000);
    } catch (err) {
      setError(err.message || 'Reset failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <Navbar2 />

      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Left Side: Stagnant Image */}
        <div className="hidden lg:block lg:w-1/2 h-full overflow-hidden">
          <img 
            src={resetIllustration} 
            alt="Reset Illustration" 
            className="w-full h-full object-cover pointer-events-none" 
          />
        </div>

        {/* Right Side: Stagnant Form Container */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center p-8 md:p-12 bg-white overflow-hidden">
          <div className="w-full max-w-md animate-in fade-in duration-500 text-sm">
            
            {isSuccess ? (
              <div className="text-center">
                <div className="bg-emerald-50 text-emerald-700 p-8 rounded-2xl border border-emerald-100 mb-6">
                  <h2 className="text-2xl font-bold mb-2">Success!</h2>
                  <p className="text-sm">Password reset successfully. Redirecting you to sign in...</p>
                </div>
                <Link to="/sign-in" className="text-[#EFB034] font-bold hover:underline">
                  Click here to go now
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-8 text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                    Secure your account
                  </h2>
                  <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-[0.2em] font-bold">
                    Create a strong new password below
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  
                  {/* New Password Input */}
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={new_password}
                      onChange={(e) => { setNewPassword(e.target.value); if(error) setError(''); }}
                      placeholder="New Password"
                      className={`w-full rounded-xl border h-12 px-5 focus:outline-none transition-all text-slate-900
                        ${error && error.includes('8') ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#EFB034]'}`}
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      {error && error.includes('8') && (
                        <span className="text-[10px] text-red-500 font-bold italic pointer-events-none">{error}</span>
                      )}
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="text-slate-400">
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm_password}
                      onChange={(e) => { setConfirmPassword(e.target.value); if(error) setError(''); }}
                      placeholder="Confirm Password"
                      className={`w-full rounded-xl border h-12 px-5 focus:outline-none transition-all text-slate-900
                        ${error && error.includes('match') ? 'border-red-500 bg-red-50/10' : 'border-slate-200 focus:border-[#EFB034]'}`}
                    />
                    <div className="absolute right-4 flex items-center gap-2">
                      {error && error.includes('match') && (
                        <span className="text-[10px] text-red-500 font-bold italic pointer-events-none">{error}</span>
                      )}
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-slate-400">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Requirements Box */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-[10px] font-bold text-[#234E4D] mb-2 uppercase tracking-widest">Requirements</div>
                    <ul className="space-y-1.5 text-[10px] text-gray-500 font-medium">
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${new_password.length >= 8 ? 'bg-emerald-500' : 'bg-gray-300'}`}></div> 
                        At least 8 characters long
                      </li>
                      <li className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(new_password) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div> 
                        Contains an uppercase letter
                      </li>
                    </ul>
                  </div>

                  {/* General Error (API errors) */}
                  {error && !error.includes('8') && !error.includes('match') && (
                    <p className="text-red-500 text-[10px] text-center font-bold">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !isFormFilled}
                    className={`w-full h-12 text-sm font-bold text-white rounded-full 
                      flex items-center justify-center transition-all duration-300 active:scale-[0.98] 
                      ${isFormFilled 
                        ? 'bg-[#EFB034] shadow-md shadow-yellow-100 hover:brightness-105' 
                        : 'bg-gray-300 cursor-not-allowed opacity-80'
                      }`}
                  >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </button>

                  <div className="text-center pt-2">
                    <button type="button" onClick={() => navigate('/sign-in')} className="text-xs font-bold text-[#234E4D] hover:underline uppercase tracking-widest">
                      Back to login
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