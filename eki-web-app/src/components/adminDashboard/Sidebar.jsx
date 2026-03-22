import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Store,
  Box,
  CreditCard,
  ShoppingCart,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admindashboard" },
  { icon: Users, label: "Vendors", path: "/admin-management" },
  { icon: Store, label: "Buyers", path: "/buyer-management" },
  { icon: Box, label: "Listings", path: "/product-dashboard" },
  { icon: CreditCard, label: "Payments", path: "/admin-payments" },
  { icon: ShoppingCart, label: "Orders", path: "/order-management" },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-[240px] bg-white border-r border-gray-100 h-screen py-4 flex flex-col shrink-0 sticky ">
      {/* Note: sticky top matches the approximate height of your Navbar */}

      <nav className="flex-1 px-4 flex flex-col">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.label}>
              <NavLink to={item.path}>
                {(
                  { isActive }, // Wrap the content in a function to access isActive globally
                ) => (
                  <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-[#FFF8ED] text-[#F2B53D]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span>{item.label}</span>
                  </div>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom Section */}
        <div className="mt-auto pb-20 border-t border-gray-100 pt-6">
          <ul className="space-y-1">
            <li>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-gray-100 text-black"
                      : "text-gray-500 hover:bg-gray-50"
                  }`
                }
              >
                <Settings size={20} strokeWidth={1.5} />
                <span>Settings</span>
              </NavLink>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={20} strokeWidth={1.5} />
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

// import React from 'react';

// import {
//   Users,
//   Store,
//   Box,
//   CreditCard,
//   ShoppingCart,
//   BarChart3,
//   Settings,
//   LogOut
// } from 'lucide-react';

// const menuItems = [
//   { icon: Users, label: 'Users', active: true },
//   { icon: Store, label: 'Vendors' },
//   { icon: Box, label: 'Listings' },
//   { icon: CreditCard, label: 'Payments' },
//   { icon: ShoppingCart, label: 'Orders' },
//   { icon: BarChart3, label: 'Analytics' },
// ];

// const Sidebar = () => {
//   return (
//     <aside className="w-[240px] bg-white border-r border-gray-100 h-screen py-6 flex flex-col shrink-0 sticky top-0">
//       <nav className="flex-1 px-4">

//         <div className="mb-8">
//           <ul className="space-y-2">
//             {menuItems.map((item) => (
//               <li key={item.label}>
//                 <button
//                   className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                     item.active
//                       ? 'bg-gray-50 text-black'
//                       : 'text-gray-500 hover:bg-gray-50 hover:text-black'
//                   }`}
//                 >
//                   <item.icon size={18} strokeWidth={1.5} />
//                   <span>{item.label}</span>
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="px-2 border-t border-gray-100 pt-30">
//           <ul className="space-y-2">

//             <li>
//               <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-black transition-all duration-200">
//                 <Settings size={18} strokeWidth={1.5} />
//                 <span>Settings</span>
//               </button>
//             </li>

//             <li>
//               <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200">
//                 <LogOut size={18} strokeWidth={1.5} />
//                 <span>Log out</span>
//               </button>
//             </li>
//           </ul>
//         </div>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;
