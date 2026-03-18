import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
import resetIllustration from '../assets/reset.jpeg';
import { passwordResetRequest } from '../services/authService'; 

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email is required');
      setEmail('');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await passwordResetRequest(email);
      // Link to OTP page and pass the email address
      navigate('/otp', { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      setError(err.message);
      setEmail(''); 
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex flex-grow h-[calc(100vh-60px)]">
        <div className="hidden md:block w-2/5 h-full">
          <img src={resetIllustration} alt="Reset" className="h-full w-full object-cover" />
        </div>
        <div className="w-full md:w-3/5 flex flex-col justify-center items-center p-8 text-center">
          <img src={logoImage} alt="Logo" className="h-40 mb-10 object-contain" />
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Forgot Password?</h2>
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
            <input 
              type="email" placeholder={error || "Enter your email"} value={email}
              onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
              className={`w-full p-4 border rounded-lg outline-none transition-all ${
                error ? 'border-red-500 placeholder-red-500 bg-red-50' : 'border-gray-300 focus:border-yellow-500'
              }`}
            />
            <button disabled={isLoading} className="w-full bg-yellow-500 text-white font-bold py-4 rounded-full shadow-md">
              {isLoading ? "Sending..." : "Reset Password"}
            </button>
            <button type="button" onClick={() => navigate('/login')} className="text-xs font-semibold text-gray-400 hover:text-yellow-600">
              Back to Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ForgotPassword;