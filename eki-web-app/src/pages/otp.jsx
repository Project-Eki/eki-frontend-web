import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/authService";
import logoImage from '../assets/logo.jpeg';

const OTPVerify = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const email = state?.email || "";
  const inputRefs = useRef([]);

  useEffect(() => {
    // Redirect back if email is missing (page refresh issue)
    if (!email) {
      navigate('/reset-password-request'); 
    }
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, email, navigate]);

  const handleChange = (element, index) => {
    const value = element.value;
    if (isNaN(value)) return false;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const submitOtp = async (code) => {
    if (code.length < 6) return;
    
    setIsLoading(true);
    setError("");
    try {
      // FIX: Ensure you are passing the email and the 6-digit code
      await verifyOtp({ 
        email: email.trim().toLowerCase(), 
        otp_code: code 
      });
      
      // Navigate to Reset Password page, passing email and otp for the final step
      navigate("/reset-password", { 
        state: { 
          email: email, 
          otp_code: code 
        } 
      });
    } catch (err) {
      // Show the specific error from the backend
      setError(err.message || "Invalid or expired code.");
      setOtp(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp(email);
      setTimer(60);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <img src={logoImage} alt="Logo" className="h-28 mb-8" />
      <h2 className="text-2xl font-bold mb-2">Verify Identity</h2>
      <p className="text-gray-500 mb-10 text-sm">Code sent to <b>{email}</b></p>
      
      <div className="flex justify-center gap-2 mb-6">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-12 h-16 md:w-14 md:h-20 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all ${
              error ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-yellow-500'
            }`}
          />
        ))}
      </div>
      
      {error && <p className="text-red-500 text-sm mb-6 font-bold text-center">{error}</p>}
      
      <button 
        onClick={() => submitOtp(otp.join(""))} 
        disabled={isLoading || otp.join("").length < 6}
        className="w-full max-w-sm bg-[#F1B243] text-white font-bold py-4 rounded-full shadow-lg transition-transform active:scale-95 disabled:bg-gray-300"
      >
        {isLoading ? "Verifying..." : "Verify Code"}
      </button>

      <button 
        disabled={timer > 0} 
        onClick={handleResend} 
        className={`mt-8 text-sm font-bold ${timer > 0 ? "text-gray-300" : "text-yellow-600 hover:underline"}`}
      >
        {timer > 0 ? `Resend Code in ${timer}s` : "Resend New Code"}
      </button>
    </div>
  );
};

export default OTPVerify;