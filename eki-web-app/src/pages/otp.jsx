import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoImage from '../assets/logo.jpeg';
// IMPORT using the names your teammate created
import { verifyEmail, resendOtp } from '../services/authService'; 

const OtpVerify = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendStatus, setResendStatus] = useState("");
    
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    // Gets email from ForgotPassword navigation state
    const userEmail = location.state?.email || "your email"; 

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = async (element, index) => {
        if (isNaN(element.value)) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }

        // Auto-submit when 6 digits are reached
        if (newOtp.join("").length === 6) {
            handleVerify(newOtp.join(""));
        }
    };

    const handleVerify = async (code) => {
        setIsLoading(true);
        setError("");
        try {
            // We call her function 'verifyEmail' 
            // It automatically adds otp_type: "email_verification"
            await verifyEmail({ 
                email: userEmail, 
                otp_code: code 
            });

            // On success, go to the reset page and pass the code
            navigate('/reset-password', { state: { email: userEmail, code: code } });
        } catch (err) {
            // Uses the error message logic she wrote in api.js
            setError(err.message || "Invalid code.");
            setOtp(new Array(6).fill(""));
            inputRefs.current[0].focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const onResend = async () => {
        setResendStatus("Sending...");
        try {
            await resendOtp({ email: userEmail }); // Using her resend function
            setResendStatus("New code sent!");
            setTimeout(() => setResendStatus(""), 3000);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 font-sans">
            <div className="mb-10"><img src={logoImage} alt="Logo" className="max-h-16 w-auto" /></div>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Verify your identity</h2>
                <p className="text-gray-500 mt-2 text-sm">We've sent a 6-digit security code to</p>
                <div className="mt-4 inline-flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-semibold text-gray-700">
                    <span className="mr-2">✉️</span> {userEmail}
                </div>
            </div>

            {error && <p className="mb-4 text-red-500 text-xs font-bold">{error}</p>}
            {resendStatus && <p className="mb-4 text-green-600 text-xs font-bold">{resendStatus}</p>}

            <div className="flex items-center justify-center gap-3">
                {otp.map((data, index) => (
                    <React.Fragment key={index}>
                        <input
                            type="text"
                            maxLength="1"
                            value={data}
                            disabled={isLoading}
                            ref={(el) => (inputRefs.current[index] = el)}
                            onChange={(e) => handleChange(e.target, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-12 h-12 md:w-16 md:h-16 text-center text-xl font-bold rounded-full border-2 border-gray-200 focus:border-yellow-500 outline-none transition-all shadow-sm"
                        />
                        {index === 2 && <span className="text-gray-300 text-2xl">—</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className="mt-12 w-full max-w-xs border-t border-gray-100 pt-8 text-center text-xs">
                <p className="text-gray-500">
                    Didn't receive the email?{" "}
                    <button onClick={onResend} className="text-yellow-500 font-bold hover:underline">Resend Code</button>
                </p>
            </div>
        </div>
    );
};

export default OtpVerify;