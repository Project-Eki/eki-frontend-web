import { Search, Bell } from 'lucide-react'; // 1. Changed Settings to Bell
import { ChevronDown } from 'lucide-react'; // Added for the dropdown arrow
import adaefe from "../../assets/adaefe.jpg";

const Navbar = ({ userName = "Keilar Kirabira", userRole = "Admin" }) => {
  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-50">
      
      {/* Logo Section */}
      <div className="flex items-center">
        <div className="h-12 w-auto flex items-center">
          <img 
            src="/ekilogo.png" 
            alt="Eki Logo" 
            className="h-19 w-30 object-contain" 
          />
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="flex items-center space-x-12">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
          />
        </div>

        <div className="flex items-center space-x-8 font-medium text-gray-600">
          <a href="/" className="hover:text-black transition-colors">Home</a>
          <a href="/product-dashboard" className="hover:text-black transition-colors">Products</a>
          <a href="/Services" className="hover:text-black transition-colors">Services</a>
        </div>
      </div>

      {/* Right Side: Notification and User Profile */}
      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <button className="relative text-gray-500 hover:text-black transition-colors">
          <Bell className="w-6 h-6" />
          {/* Optional: Red dot for active notifications */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile Info */}
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-100">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
            <img src={adaefe} alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          
          <div className="flex flex-col text-left cursor-pointer group">
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

export default Navbar;