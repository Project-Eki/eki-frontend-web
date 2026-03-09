import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import logoImage from '../assets/logo.jpeg';
import sideImage from '../assets/signin.jpeg';

const SignInPage = ({
  logoUrl = logoImage,
  sideImageUrl = sideImage,
  welcomeMessage = "Welcome back! ready to sell?",
  onSignIn = (data) => console.log("Sign in logic here:", data),
  onGoogleSignIn = () => console.log("Google sign in clicked"),
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async(e) => {
    e.preventDefault();
    let hasError = false;
    
    if (!email.trim()) { setEmailError('Email required'); hasError = true; }
    else if (!validateEmail(email)) { setEmailError('Invalid email'); hasError = true; }
    else setEmailError('');
    
    if (!password.trim()) { setPasswordError('Password required'); hasError = true; }
    else setPasswordError('');
    
    if (!hasError) {
      try {
        const data = await loginUser({ email, password });
        console.log("Login Success:", data);

        if (data.access) localStorage.setItem('access_token', data.access);
        if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
        navigate('/dashboard');
      } catch (err) {
        setEmailError(err.message || "Login failed");
      }
    }
  }; 

  {/* Side Image */}
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-sm">
      <div className="flex flex-grow h-[calc(100vh-96px)] overflow-hidden">
      
        <div className="hidden md:flex w-1/2 h-full">
          <img src={sideImageUrl} alt="Sign In Visual" className="h-full w-full object-cover" />
        </div>

        {/* Logo */}
          <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-12 bg-white">
            <div className="mb-6 flex flex-col items-center">
              <div className="flex h-30 w-30 mb-4 items-center justify-center overflow-hidden">
                <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 text-center">{welcomeMessage}</h2>
            </div>

             {/* Sign In Form */}
          <form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (validateEmail(e.target.value)) setEmailError(''); }}
              placeholder={emailError ? emailError : "Enter email"}
              className={`w-full rounded-md border py-3 pl-3 pr-4 focus:outline-none bg-gray-50/30
                ${emailError ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-yellow-500 placeholder-black'}`}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (e.target.value.trim()) setPasswordError(''); }}
                placeholder={passwordError ? passwordError : "Enter password"}
                className={`w-full rounded-md border py-3 pl-3 pr-12 focus:outline-none bg-gray-50/30
                  ${passwordError ? 'border-red-500 placeholder-red-500 text-red-500' : 'border-gray-300 focus:border-yellow-500 placeholder-black'}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
               <label className="flex items-center text-gray-600 cursor-pointer">
                 <input type="checkbox" className="mr-2 h-3.5 w-3.5 rounded border-gray-300 accent-yellow-500" />
                 Remember me
               </label>
               <button type="button" onClick={() => navigate('/forgot-password')} className="font-semibold text-yellow-500 hover:underline">Forgot Password?</button>
            </div>

            <button type="submit" className="w-full rounded-full bg-yellow-500 py-3 font-bold text-white shadow-md hover:bg-yellow-600 transition-all active:scale-[0.98]">
              Sign In
            </button>
          </form>

          <div className="flex items-center w-full max-w-md my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button type="button" onClick={onGoogleSignIn}
            className="flex w-full max-w-md items-center justify-center rounded-full border border-gray-300 py-2.5 hover:bg-gray-50 transition-colors">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="mr-2 h-4 w-4" />
            <span className="text-xs font-semibold text-gray-700">Sign in with Google</span>
          </button>

          <div className="mt-2 text-xs text-gray-600">
            Don't have an account?{" "}
            <button 
              onClick={() => navigate('/vendorOnboarding')} 
              className="font-semibold text-yellow-500 hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
      
      <footer className="w-full font-sans">
        <div className="w-full bg-[#234E4D] text-white py-3 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-wide">
            <div className="flex-shrink-0 font-bold">Buy Smart. Sell Fast. Grow Together...</div>
            <div className="flex items-center gap-1 text-center">
              <span>© 2026 Vendor Portal. All rights reserved.</span>
              <span className="ml-1 font-bold">eki<span className="text-[4px] font-normal ml-0.5">TM</span></span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:opacity-80">Support</a>
              <a href="#" className="hover:opacity-80">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400">Terms of Service</a>
              <span className="font-bold border-l border-white/30 pl-6">Ijoema ltd</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignInPage;