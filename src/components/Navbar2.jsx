import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full h-[56px] bg-white border-b border-gray-100 flex items-center justify-between px-16 shrink-0 z-50 shadow-sm">
      <div className="flex items-center select-none">
        <img src="/ekilogo.png" alt="EKI Logo" className="h-20 w-auto" />
      </div>

      <div className="flex items-center gap-8">
        <button 
          onClick={() => navigate('/')} 
          className="text-[14px] font-semibold cursor-pointer"
        >
          Home
        </button>
        <button className="text-[14px] font-medium text-gray-500 hover:text-gray-800 transition-all cursor-pointer">
          Help
        </button>
        <div className="h-4 w-[1px] bg-gray-200"></div>
        <button 
          onClick={() => navigate('/signIn')} 
          className="text-[14px] font-bold text-[#1A1A1A] hover:text-[#235E5D] transition-colors cursor-pointer"
        >
          Signin
        </button>
      </div>
    </nav>
  );
};

export default Navbar;