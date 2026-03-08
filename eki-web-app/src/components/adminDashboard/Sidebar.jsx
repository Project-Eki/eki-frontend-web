import React from 'react';
// Import the specific Lucide icons that match your PNG
import { 
  Users, 
  Store, 
  Box, 
  CreditCard, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { icon: Users, label: 'Users', active: true },
  { icon: Store, label: 'Vendors' },
  { icon: Box, label: 'Listings' },
  { icon: CreditCard, label: 'Payments' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: BarChart3, label: 'Analytics' },
];

const Sidebar = () => {
  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 h-screen py-6 flex flex-col shrink-0 sticky top-0">
      <nav className="flex-1 px-4">
        
        {/* Main Menu Group */}
        <div className="mb-8">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-gray-50 text-black' // Updated to match the clean PNG look
                      : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="px-2 border-t border-gray-100 pt-30">
          <ul className="space-y-2">
            {/* Settings - Normal Styling */}
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200">
                <Settings size={18} strokeWidth={1.5} />
                <span>Settings</span>
              </button>
            </li>
            
            {/* Log Out - Red Styling */}
            <li>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200">
                <LogOut size={18} strokeWidth={1.5} />
                <span>Log out</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;