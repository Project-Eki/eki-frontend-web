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
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const email = state?.email || "";
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/reset-password-request');
    }
  }, [email, navigate]);

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
    setResendLoading(true);
    setResendSuccess(false);
    setError("");
    try {
      await resendOtp(email);
      setOtp(new Array(6).fill(""));
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch (err) {
      const djangoErrors = err.response?.data?.errors ?? err.response?.data;
      if (djangoErrors && typeof djangoErrors === 'object') {
        const messages = Object.values(djangoErrors)
          .map(msg => Array.isArray(msg) ? msg.join(', ') : msg)
          .join(' ');
        setError(messages);
      } else {
        setError(err.message || "Failed to resend code. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ecece7] font-sans">
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

          <div className="flex justify-center items-center gap-3 mb-6">
            {otp.map((data, index) => (
              <React.Fragment key={index}>
                {index === 3 && (
                  <span className="text-gray-400 text-xl font-bold mx-1">—</span>
                )}
                <input
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`w-12 h-12 text-center text-2xl font-bold rounded-2xl outline-none transition-all bg-gray-50 text-gray-900 ${
                    error
                      ? 'border-2 border-red-500'
                      : data
                      ? 'border-2 border-[#EFB034]'
                      : 'border-2 border-gray-200 focus:border-[#EFB034]'
                  }`}
                />
              </React.Fragment>
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 font-bold text-center">
              {error}
            </p>
          )}

          {resendSuccess && (
            <p className="text-emerald-600 text-sm mb-4 font-semibold text-center">
              A new code has been sent to your email.
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
            <p className="text-xs text-gray-400 mb-2">
              Didn't receive the code?
            </p>
            <button
              disabled={resendLoading}
              onClick={handleResend}
              className={`text-sm font-semibold transition-colors ${
                resendLoading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#EFB034] hover:underline cursor-pointer"
              }`}
            >
              {resendLoading ? "Sending..." : "Resend New Code"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OTPVerify;