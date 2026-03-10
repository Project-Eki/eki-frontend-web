import { Link } from "react-router-dom";

const Navbar2 = () => {
  return (
    <nav className="w-full h-[56px] bg-white border-b border-gray-100 flex items-center justify-between px-16 shrink-0 z-50 shadow-sm">
      
      {/* Logo */}
      <div className="flex items-center select-none">
        <img src="/ekilogo.png" alt="EKI Logo" className="h-20 w-auto" />
      </div>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">

        <Link to="/">
          <button className="text-[14px] font-semibold cursor-pointer">
            Home
          </button>
        </Link>

        <Link to="/help">
          <button className="text-[14px] font-medium text-gray-500 hover:text-gray-800 transition-all cursor-pointer">
            Help
          </button>
        </Link>

        <div className="h-4 w-[1px] bg-gray-200"></div>

        <Link to="/signin">
          <button className="text-[14px] bg-[#efb034] rounded-lg  px-6 font-bold text-white hover:bg-[#d99c1c] transition-colors cursor-pointer px-4 py-2 rounded">
            Sign in
          </button>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar2;