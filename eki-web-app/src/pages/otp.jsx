import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resendOtp } from "../services/authService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const submitOtp = (code) => {
    if (code.length < 6) return;
    setIsLoading(true);
    setError("");

    
    navigate("/reset-password", {
      state: {
        email: email,
        otp_code: code,
      },
    });

    setIsLoading(false);
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
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-[28px] font-black text-gray-900 leading-tight mb-2">
              Verify Identity
            </h2>
            <p className="text-gray-500 text-[14px]">
              Code sent to <span className="font-semibold text-gray-700">{email}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`w-12 h-12 text-center text-2xl font-bold border-2 rounded-lg outline-none transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 focus:border-red-500'
                    : 'border-[#EFB034] focus:border-[#EFB034] focus:ring-2 focus:ring-[#EFB034]/30'
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-6 font-bold text-center">
              {error}
            </p>
          )}

          <button
            onClick={() => submitOtp(otp.join(""))}
            disabled={isLoading || otp.join("").length < 6}
            className={`w-full h-12 rounded-full font-bold transition-all duration-300
              ${!isLoading && otp.join("").length === 6
                ? 'bg-[#efb034] hover:bg-[#d99c1c] hover:-translate-y-1 hover:shadow-lg text-white cursor-pointer'
                : 'bg-gray-300 cursor-not-allowed text-white/70'
              }`}
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          <div className="text-center mt-6">
            <button
              disabled={timer > 0}
              onClick={handleResend}
              className={`text-sm font-medium transition-colors ${
                timer > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#EFB034] hover:underline cursor-pointer"
              }`}
            >
              {timer > 0 ? `Resend Code in ${timer}s` : "Resend New Code"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OTPVerify;