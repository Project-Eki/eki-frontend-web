import React, { useState, useRef, useEffect } from "react";
import { HiOutlineShieldCheck, HiMinus } from "react-icons/hi";
import { MdOutlineMail } from "react-icons/md";
import { verifyEmail, resendOtp } from "../services/api";

//  Import Context and Actions
import { useOnboarding, ACTIONS } from "../context/vendorOnboardingContext";

const VerifyIdentity = () => {
  //  Access Global State and Dispatch
  const { state, dispatch } = useOnboarding();
  const { formData } = state;

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const inputRefs = useRef([]);

  const inputClass = `w-14 h-14 text-center text-2xl font-black border-2 bg-white text-gray-800 rounded-2xl outline-none transition-all shadow-sm 
    ${otp.join("").length === 6 ? "border-green-400" : "border-gray-100"} 
    focus:border-[#F2B53D] focus:ring-2 focus:ring-[#F2B53D]/20`;

  useEffect(() => {
    if (inputRefs.current[0]) inputRefs.current[0].focus();
  }, []);

  useEffect(() => {
    const fullCode = otp.join("");
    if (fullCode.length === 6) {
      const timer = setTimeout(() => handleVerify(fullCode), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = async (code) => {
    setIsLoading(true);
    setError("");
    try {
      // Use the email from our Global Context
      const data = await verifyEmail({ email: formData.email, otp_code: code });

      if (data.data?.access)
        localStorage.setItem("access_token", data.data.access);
      if (data.data?.refresh)
        localStorage.setItem("refresh_token", data.data.refresh);

      //  Success: Tell the Global State to move to next step
      dispatch({ type: ACTIONS.NEXT_STEP });
    } catch (err) {
      const msg = setError(
        err.message || "Invalid or expired code. Please try again.",
      );
      setError(msg);
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError("");
    setResendMessage("");
    try {
      await resendOtp({ email: formData.email });
      setResendMessage("A new code has been sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to resend code. Please try again.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
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

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6).split("");
    if (data.length === 6) {
      setOtp(data);
      inputRefs.current[5].focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      <div className="w-14 h-14 bg-[#FFF8ED] rounded-full flex items-center justify-center mb-4 border border-[#F2B53D]/10">
        <HiOutlineShieldCheck className="text-[#F2B53D]" size={28} />
      </div>

      <h2 className="text-[28px] font-black text-gray-900 leading-tight text-center">
        Verify your identity
      </h2>
      <p className="text-gray-500 mt-2 text-[15px]">
        We've sent a 6-digit security code to
      </p>

      <div className="mt-3 flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
        <MdOutlineMail className="text-[#F2B53D]" size={16} />
        <span className="text-[13px] font-bold text-gray-700">
          {formData.email || "your email"}
        </span>
      </div>

      {/* <div className="flex items-center gap-4 mt-10 mb-4" onPaste={handlePaste}>
        <div className="flex gap-3">
          {otp.slice(0, 3).map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={inputClass}
              disabled={isLoading}
            />
          ))}
        </div>

        <HiMinus className="text-gray-300" size={24} />

        <div className="flex gap-3">
          {otp.slice(3, 6).map((data, index) => (
            <input
              key={index + 3}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index + 3] = el)}
              value={data}
              onChange={(e) => handleChange(e.target.value, index + 3)}
              onKeyDown={(e) => handleKeyDown(e, index + 3)}
              className={inputClass}
              disabled={isLoading}
            />
          ))}
        </div>
      </div> */}
            <div className="otp-wrapper flex items-center gap-4 mt-10 mb-4" onPaste={handlePaste}>
        <div className="otp-group flex gap-3">
          {otp.slice(0, 3).map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`otp-input ${inputClass}`}
              disabled={isLoading}
            />
          ))}
        </div>

        <HiMinus className="text-gray-300" size={24} />

        <div className="otp-group flex gap-3">
          {otp.slice(3, 6).map((data, index) => (
            <input
              key={index + 3}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index + 3] = el)}
              value={data}
              onChange={(e) => handleChange(e.target.value, index + 3)}
              onKeyDown={(e) => handleKeyDown(e, index + 3)}
              className={`otp-input ${inputClass}`}
              disabled={isLoading}
            />
          ))}
        </div>
      </div>

      {isLoading && (
        <p className="text-[#F2B53D] text-[13px] font-bold mb-4 animate-pulse">
          Verifying...
        </p>
      )}
      {error && (
        <p className="text-red-500 text-[13px] font-bold mb-4">{error}</p>
      )}
      {resendMessage && !error && (
        <p className="text-green-600 text-[13px] font-bold mb-4">
          {resendMessage}
        </p>
      )}

      <div className="w-full max-width:340px; flex flex-col items-center gap-4 mt-2">
        <p className="text-gray-500 text-[13px]">
          Didn't receive the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-[#F2B53D] font-bold hover:underline cursor-pointer disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend Code"}
          </button>
        </p>

        <button
          //  Back button uses dispatch now
          onClick={() => dispatch({ type: ACTIONS.PREV_STEP })}
          className="text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default VerifyIdentity;
