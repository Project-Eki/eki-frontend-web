import { Search, Settings } from 'lucide-react';
// 1. Keep this import! This is the correct way to handle assets.
import adaefe from "../../assets/adaefe.jpg";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-50">
      
  {/* LEFT: Logo / Brand Image */}
<div className="flex items-center">
  {/* 1. Changed w-10 to w-auto so it can expand horizontally 
      2. Set a height (h-12 or h-14) to control the vertical size 
  */}
  <div className="h-12 w-auto flex items-center">
    <img 
      src="/ekilogo.png" 
      alt="Eki Logo" 
      className="h-19 w-30 object-contain" 
    />
  </div>
</div>

      {/* CENTER: Search and Links */}
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
          <a href="/products" className="hover:text-black transition-colors">Products</a>
          <a href="/Services" className="hover:text-black transition-colors">Services</a>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center space-x-6">
        <button className="text-gray-500 hover:text-black">
          <Settings className="w-6 h-6" />
        </button>
        
        {/* User Profile Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
          {/* 3. Changed from a string path to the imported variable {adaefe} */}
          <img src={adaefe} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

    </nav>
  );
};

export default Navbar;