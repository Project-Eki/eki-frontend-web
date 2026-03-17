import { Search, MessageSquare } from 'lucide-react';

import adaefe from "../assets/adaefe.jpg";

const  VendorNavbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 sticky top-0 z-50">
      
 
<div className="flex items-center">
 
  <div className="h-12 w-auto flex items-center">
    <img 
      src="/ekilogo.png" 
      alt="Eki Logo" 
      className="h-19 w-30 object-contain" 
    />
  </div>
</div>

     
      <div className="flex items-center space-x-12">
        <div className="relative group mr-30">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-3" />
          <input 
            type="text" 
            placeholder="Search" 
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
          />
        </div>

        <div className="flex items-center space-x-20 font-medium text-gray-600">
          <a href="/" className="hover:text-black transition-colors">Home</a>
          <a href="/products" className="hover:text-black transition-colors">Products</a>
          <a href="/Services" className="hover:text-black transition-colors">Services</a>
        </div>
      </div>

      
      <div className="flex items-center space-x-20">
       <a 
          href="/messages" 
          className="relative text-gray-400 hover:text-[#F2B53D] transition-all active:scale-90"
          title="Messages"
        >
          <MessageSquare className="w-6 h-6" />
          {/* Notification Badge (Optional) */}
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        </a>
        

        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 cursor-pointer">
          
          <img src={adaefe} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

    </nav>
  );
};

export default VendorNavbar;