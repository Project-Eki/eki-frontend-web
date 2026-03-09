import React from 'react';
import { 
  Briefcase, 
  Lock, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Search, 
  MessageSquare 
} from 'lucide-react';

const SettingsPage = () => {
  const menuItems = [
    { title: 'Business Settings', icon: <Briefcase size={20} /> },
    { title: 'Privacy Settings', icon: <Lock size={20} /> },
    { title: 'Account Settings', icon: <User size={20} /> },
    { title: 'General Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
            e
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search" 
              className="pl-10 pr-4 py-1.5 border rounded-full bg-gray-50 text-sm focus:outline-none w-64"
            />
          </div>
        </div>
        
        <nav className="flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-black">Home</a>
          <a href="#" className="hover:text-black">Products</a>
          <a href="#" className="hover:text-black">Services</a>
          <div className="flex items-center gap-4 ml-4">
            <MessageSquare size={20} className="text-gray-500 cursor-pointer" />
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border">
              <img src="https://via.placeholder.com/32" alt="Profile" />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex justify-center items-start pt-12">
        <div className="bg-white w-full max-w-3xl rounded-xl shadow-sm border border-gray-100 p-12 min-h-[600px]">
          <h1 className="text-2xl font-bold text-gray-800 mb-10">Settings and Privacy</h1>
          
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <button 
                key={index}
                className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4 text-gray-700">
                  <span className="text-gray-500">{item.icon}</span>
                  <span className="font-medium">{item.title}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}

            <div className="pt-16">
              <button className="w-full flex items-center gap-4 p-4 border rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                <LogOut size={20} className="rotate-180" />
                <span className="font-medium">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
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

export default SettingsPage;