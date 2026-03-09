import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { signInUser } from '../Api/authService'; 

const SignIn = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    let errors = {};
    if (!formData.email) errors.email = "Email is required";
    if (!formData.password) errors.password = "Password is required";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const data = await signInUser(formData);

      // Save user data/role provided by backend
      if (data.role) {
        localStorage.setItem('userRole', data.role);
      }

      // Simplified: Just navigate to the main entry point. 
      // The Protected Routes or Dashboard wrapper will handle view logic.
      navigate('/dashboard'); 

    } catch (err) {
      setFieldErrors({ 
        email: "Invalid Email", 
        password: "Valid Password Required" 
      });
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsLoading(false);
    }
  };

  {/* Side Image */}
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Visual */}
        <div className="hidden md:flex md:w-1/2 h-full">
          <img 
            alt="Sign In Visual" 
            className="h-full w-full object-cover" 
            src="/src/assets/signin.jpeg" 
          />
        </div>

        {/* Right Side: Form */}
        <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-8 lg:p-12 bg-white">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="h-24 w-40 mb-4 flex items-center justify-center">
              <img alt="Logo" className="h-full w-full object-contain" src="/src/assets/logo.jpeg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back! Ready to sell?</h2>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            <div className="relative">
              <input
                name="email"
                type="text"
                placeholder={fieldErrors.email || "Email Address"}
                value={fieldErrors.email ? "" : formData.email}
                onChange={handleChange}
                className={`w-full rounded-md border py-3 px-4 focus:outline-none transition-all ${
                  fieldErrors.email ? 'border-red-500 bg-red-50 placeholder-red-500' : 'border-gray-300 focus:border-yellow-500'
                }`}
              />
            </div>

            <div className="relative w-full">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={fieldErrors.password || "Enter password"}
                value={fieldErrors.password ? "" : formData.password}
                onChange={handleChange}
                className={`w-full rounded-md border py-3 pl-4 pr-12 focus:outline-none transition-all ${
                  fieldErrors.password ? 'border-red-500 bg-red-50 placeholder-red-500' : 'border-gray-300 focus:border-yellow-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-yellow-500"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center text-gray-600 cursor-pointer">
                <input className="mr-2 h-3.5 w-3.5 accent-yellow-500" type="checkbox" />
                Remember me
              </label>
              <button type="button" onClick={() => navigate('/forgot-password')} className="font-semibold text-yellow-500 hover:underline">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-full py-3 font-bold text-white shadow-md transition-all active:scale-[0.98] ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-xs text-gray-600">
            Don't have an account?{" "}
            <button 
              type="button"
              onClick={() => navigate('/vendorOnboarding')} 
              className="font-semibold text-yellow-500 hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      <footer className="w-full font-sans flex-shrink-0">
        <div className="w-full bg-[#234E4D] text-white py-3 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-wide">
            <div className="flex-shrink-0 font-bold italic">Buy Smart. Sell Fast. Grow Together...</div>
            <div className="flex items-center gap-1 text-center">
              <span>© 2026 Vendor Portal. All rights reserved.</span>
              <span className="ml-1 font-bold">eki<span className="text-[8px] font-normal ml-0.5">TM</span></span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:opacity-80">Support</a>
              <a href="#" className="hover:opacity-80">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400">Terms of Service</a>
              <span className="font-bold border-l border-white/30 pl-6 uppercase">Ijoema ltd</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;