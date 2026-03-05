import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="w-full h-[56px] bg-white border-b border-gray-100 flex items-center justify-between px-16 shrink-0 z-50 shadow-sm">
      <div className="flex items-center select-none">
        <img src="/ekilogo.png" alt="EKI Logo" className="h-20 w-auto" />
      </div>

      <div className="flex items-center gap-8">
        {/* Home Link */}
        <Link 
          to="/" 
          className="text-[14px] font-semibold text-gray-800 hover:text-[#235E5D] transition-all cursor-pointer"
        >
          Home
        </Link>

        {/* Help Link */}
        <Link 
          to="/help" 
          className="text-[14px] font-medium text-gray-500 hover:text-gray-800 transition-all cursor-pointer"
        >
          Help
        </Link>

        <div className="h-4 w-[1px] bg-gray-200"></div>

        {/* Sign in Link */}
        <Link 
          to="/signIn" 
          className="text-[14px] font-bold text-[#1A1A1A] hover:text-[#235E5D] transition-colors cursor-pointer"
        >
          Sign in
        </Link>
      </div>

      {/* The commented out section was fine, but the unclosed <button> above was the culprit */}
    </nav>
  );
};

export default Navbar;