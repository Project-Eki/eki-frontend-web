import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetConfirm } from '../services/authService';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const emailFromState = location.state?.email || '';

  const [otp_code, setOtpCode] = useState(location.state?.otp_code || '');
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success state

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new_password.length < 8) {
      setError('Password must be min 8 chars');
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
      
      setIsSuccess(true); // Trigger success UI
      
      // Auto-navigate after 3 seconds
      setTimeout(() => {
        navigate('/signin'); 
      }, 3000);
    } catch (err) {
      setError(err.message || 'Reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-sm">
      {/* Added flex-col md:flex-row for responsiveness */}
      <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
        
        {/* Left Side: Illustration - Hidden on small screens, shown on medium+ */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-4">
          <img src={resetIllustration} alt="Reset Illustration" className="max-w-full h-auto object-contain" />
        </div>

        {/* Right Side: Form Content */}
        <div className="flex w-full md:w-1/2 flex-col justify-center items-center px-8 py-10 md:px-16 bg-white">
          
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img src={logoImage} alt="Logo" className="h-12 w-auto object-contain" />
            </div>

            {/* Success Message UI */}
            {isSuccess ? (
              <div className="text-center animate-fade-in">
                <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 mb-6">
                  <h2 className="text-lg font-bold mb-2">Success!</h2>
                  <p>You have successfully reset your password. Redirecting to the sign in page...</p>
                </div>
                <Link to="/signin" className="text-[#F1B243] font-bold hover:underline">Click here to sign in now</Link>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-10">Secure your account</h2>
                
                <form className="space-y-4" onSubmit={handleSubmit}>
                  
                  {/* Enter Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={new_password}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
                    />
                    {/* Clickable Eye Icon */}
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.012 10.012 0 014.13-5.026m1.83-2.29A10.004 10.004 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.011m-9.424-9.424l10.848 10.848" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirm_password}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-10 focus:outline-none focus:ring-1 focus:ring-gray-300 placeholder-gray-400"
                    />
                    {/* Clickable Eye Icon */}
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.012 10.012 0 014.13-5.026m1.83-2.29A10.004 10.004 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.011m-9.424-9.424l10.848 10.848" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Requirements  */}
                  <div className="bg-gray-50/50 p-4 rounded-lg mt-4 border border-gray-100">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-wide">
                      <div className="w-3 h-3 rounded-full border border-emerald-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      </div>
                      Requirements
                    </div>
                    <ul className="space-y-1.5 text-[10px] text-gray-500 ml-1">
                      <li className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full border ${new_password.length >= 8 ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div> At least 8 characters long</li>
                      <li className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full border ${/[A-Z]/.test(new_password) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div> Contains an uppercase letter</li>
                      <li className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full border ${/[0-9]/.test(new_password) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}></div> Contains a number or symbol</li>
                    </ul>
                  </div>

                  {error && <p className="text-red-500 text-[11px] text-center font-medium">{error}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full rounded-xl py-3.5 mt-2 font-bold text-white shadow-sm transition-all active:scale-[0.98] ${isLoading ? 'bg-gray-400' : 'bg-[#F1B243] hover:bg-[#e0a234]'}`}
                  >
                    {isLoading ? 'Updating...' : 'Reset Password'}
                  </button>
                  
                  {/* Back to Sign In Link */}
                  <div className="text-center mt-6">
                    <p className="text-xs text-gray-500">
                      Remember your password?{' '}
                      <Link to="/login" className="text-[#F1B243] font-bold hover:underline">
                        Back to Login
                      </Link>
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-[#2D5351] text-white py-3 px-6 mt-auto">
        <div className="flex items-center justify-between text-[10px] opacity-90 max-w-6xl mx-auto">
          <div>© 2026 Business Onboard. All rights reserved. Privacy Policy | Terms of Service</div>
        </div>
      </footer>
    </div>
  );
};

export default ResetPasswordPage;