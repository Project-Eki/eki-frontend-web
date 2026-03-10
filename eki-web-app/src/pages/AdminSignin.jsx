import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { signInUser } from '../services/authService';

const AdminSignIn = () => {
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
    
    if (!formData.email || !formData.password) {
      setFieldErrors({
        email: !formData.email ? "Admin Email Required" : "",
        password: !formData.password ? "Security Password Required" : ""
      });
      return;
    }

    setIsLoading(true);
    try {
      const data = await signInUser({ ...formData, role: 'admin' });
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('userRole', 'super_admin');
      navigate('/admin/dashboard'); 
    } catch (err) {
      setFieldErrors({ 
        email: err.message || "Invalid Admin Credentials", 
        password: "" 
      });
      setFormData({ email: '', password: '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 font-sans">
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        

        <div className="hidden md:flex md:w-1/2 h-full bg-[#0f172a]">
          <img 
            alt="Admin Portal Visual" 
            className="h-full w-full object-cover opacity-50 whitescale" 
            src="/src/assets/signin.jpeg" 
          />
        </div>

       
        <div className="flex w-full md:w-1/2 h-full flex-col justify-center items-center p-8 lg:p-12 bg-white">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="h-40 w-40 mb-4 flex items-center justify-center">
              <img alt="Logo" className="h-full w-full object-contain" src="/src/assets/logo.jpeg" />
            </div>
            <h2 className="text-2xl font-black text-[#234E4D] uppercase tracking-tight">Admin Console</h2>
            <p className="text-gray-400 text-[10px] mt-1 font-bold uppercase tracking-[0.2em]">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
            
            <div className="relative">
              <input
                name="email"
                type="email"
                placeholder={fieldErrors.email || "Administrator Email"}
                value={formData.email}
                onChange={handleChange}
                className={`w-full rounded-xl border py-4 px-4 focus:outline-none ${
                  fieldErrors.email 
                    ? 'border-red-500 bg-red-50 placeholder-red-500 font-medium' 
                    : 'border-gray-200 focus:border-[#234E4D]'
                }`}
              />
            </div>

            <div className="relative w-full">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={fieldErrors.password || "Security Password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-xl border py-4 pl-4 pr-12 focus:outline-none ${
                  fieldErrors.password 
                    ? 'border-red-500 bg-red-50 placeholder-red-500 font-medium' 
                    : 'border-gray-200 focus:border-[#234E4D]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 rounded-full py-4 font-bold text-white shadow-xl mt-2 ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#D99201]'
              }`}
            >
              {isLoading ? 'Verifying...' : (
                <>
                  <Lock size={18} />
                  Login to Management
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <button 
              type="button"
              onClick={() => navigate('/')} 
              className="text-[10px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2"
            >
               Exit to Public Portal
            </button>
          </div>
        </div>
      </div>

   
      <footer className="w-full flex-shrink-0 bg-[#234E4D] border-t border-gray-100 py-3 px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] tracking-[0.2em] uppercase">
          <div className="font-bold flex items-center gap-2 text-[white]">
            <ShieldCheck size={12} className="text-[white]" />
            Secure Administrator Session
          </div>
          <div className="text-gray-400">System Console © 2026. eki™</div>
          <div className="text-[white]">
            IJOEMA LTD SECURITY
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminSignIn;