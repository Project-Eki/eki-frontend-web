import { Search, Bell, Menu } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import adaefe from "../../assets/adaefe.jpg";

const Navbar3 = ({ userName = "Keilar Kirabira", userRole = "Admin", onMenuClick }) => {
  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-50 h-16 shrink-0">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors mr-2"
      >
        <Menu size={22} />
      </button>

      {/* Logo */}
      <div className="flex items-center shrink-0">
        <img
          src="/ekilogo.png"
          alt="Eki Logo"
          className="h-10 w-auto object-contain"
        />
      </div>

      {/* Search + Nav links */}
      <div className="flex items-center space-x-6 flex-1 justify-center px-4 sm:px-8">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-52 lg:w-64 transition-all text-sm"
          />
        </div>

        {/* Products & Services links — no Home */}
        <div className="hidden md:flex items-center space-x-6 font-medium text-gray-600 text-sm">
          <a href="/product-dashboard" className="hover:text-black transition-colors">Products</a>
          <a href="/Services" className="hover:text-black transition-colors">Services</a>
        </div>
      </div>

      {/* Right: Bell + User */}
      <div className="flex items-center space-x-3 sm:space-x-6 shrink-0">
        <button className="relative text-gray-500 hover:text-black transition-colors">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-2 sm:space-x-3 border-l pl-3 sm:pl-6 border-gray-100">
          {/* Avatar — always visible */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer shrink-0">
            <img src={adaefe} alt="User Avatar" className="w-full h-full object-cover" />
          </div>

          {/* Name + role — hidden on small screens */}
          <div className="hidden sm:flex flex-col text-left cursor-pointer group">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-semibold text-gray-800">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
            </div>
            <span className="text-xs text-gray-500">{userRole}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar3;