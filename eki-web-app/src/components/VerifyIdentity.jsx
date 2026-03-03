import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineShieldCheck, HiMinus } from "react-icons/hi";
import { MdOutlineMail } from "react-icons/md";

const VerifyIdentity = ({ onNext, onBack }) => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // Sync classes in one variable to guarantee they stay exactly the same
  const inputClass = "w-14 h-14 text-center text-2xl font-black border-2 border-gray-100 rounded-2xl focus:border-[#F2B53D] focus:ring-2 focus:ring-[#F2B53D]/20 outline-none transition-all shadow-sm bg-white text-gray-800";

  useEffect(() => {
    const fullCode = otp.join("");
    if (fullCode.length === 6) {
      const timer = setTimeout(() => { onNext(); }, 500);
      return () => clearTimeout(timer);
    }
  }, [otp, onNext]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && otp[index] === "") {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      <div className="w-14 h-14 bg-[#FFF8ED] rounded-full flex items-center justify-center mb-4 border border-[#F2B53D]/10">
        <HiOutlineShieldCheck className="text-[#F2B53D]" size={28} />
      </div>

      <h2 className="text-[28px] font-black text-gray-900 leading-tight">Verify your identity</h2>
      <p className="text-gray-500 mt-2 text-[15px]">We've sent a 6-digit security code to</p>

      <div className="mt-3 flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
        <MdOutlineMail className="text-[#F2B53D]" size={16} />
        <span className="text-[13px] font-bold text-gray-700">alex.smith@example.com</span>
      </div>

      {/* OTP inputs - Fixed mt-8 typo and unified sizing */}
      <div className="flex items-center gap-4 mt-10 mb-10">
        <div className="flex gap-3">
          {otp.slice(0, 3).map((data, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={inputClass}
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
              onChange={(e) => handleChange(e.target, index + 3)}
              onKeyDown={(e) => handleKeyDown(e, index + 3)}
              className={inputClass}
            />
          ))}
        </div>
      </div>

      <p className="text-gray-500 text-[13px]">
        Didn't receive the email?{" "}
        <button className="text-[#F2B53D] font-bold hover:underline cursor-pointer">Resend Code</button>
      </p>

      <div className="w-full max-w-[340px] flex flex-col gap-4">
        {/* <button 
          onClick={onNext}
          className="w-full h-12 bg-[#F2B53D] text-white font-bold rounded-full shadow-lg shadow-yellow-200/50 hover:bg-[#e0a630] transition-all cursor-pointer"
        >
          Verify 
        </button> */}

        <button 
          onClick={onBack}
          className="text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
        >
          Back 
        </button>
      </div>
    </div>
  );
};

export default VerifyIdentity;