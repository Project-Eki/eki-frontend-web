import React from 'react';
import { FcGoogle } from "react-icons/fc";
import { FaRegUser, FaRegEnvelope, FaRegEye } from "react-icons/fa6";
import { FiLock } from "react-icons/fi"; 

const AccountBasics = ({ onNext }) => {
  return (
    <div className="w-full animate-fadeIn max-w-[580px]">
      {/* FORM FIELDS */}
      <div className="space-y-3">
        
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="John" 
              className="w-full h-12  pl-11 bg-white border border-gray-200 rounded-2xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px]" 
            />
          </div>
          <input 
            type="text" 
            placeholder=" Doe" 
            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-2xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px] transition-all" 
          />
        </div>

        {/* Email */}
        <div className="relative">
          <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input 
            type="email" 
            placeholder="john@example.com" 
            className="w-full h-12 pl-11 bg-white border border-gray-200 rounded-xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px] transition-all" 
          />
        </div>

        {/* Password */}
        <div className="relative">
          <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"  size={14}/>
          <input 
            type="password" 
            placeholder="Create a strong password" 
            className="w-full h-12 pl-11 pr-11 bg-white border border-gray-200 rounded-2xl focus:border-[#F2B53D] focus:ring-1 focus:ring-[#F2B53D] outline-none text-[14px] transition-all" 
          />
          <FaRegEye className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"  size={14}/>
        </div>

        {/* Terms */}
        <div className="flex items-center gap-3 py-1">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-[#235E5D] cursor-pointer" />
          <label className="text-[12px] text-gray-500">
            I agree to the <span className="text-[#F2B53D] font-bold cursor-pointer">Terms of Service</span> and <span className="text-[#F2B53D] font-bold cursor-pointer">Privacy Policy</span>.
          </label>
        </div>

        {/* Main Button */}
        <button 
          onClick={onNext} 
          className="w-full h-12 rounded-full text-white font-bold text-[16px] bg-[#F2B53D] hover:bg-[#e0a630] transition-all shadow-lg shadow-yellow-200/50 mt-2 cursor-pointer"
        >
          Continue
        </button>

        {/* Divider */}
        <div className="flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="px-3 text-gray-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Google Button */}
        <button className="w-full h-12 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-bold text-[14px] text-gray-700 cursor-pointer">
          <FcGoogle size={20} /> Sign up with Google
        </button>
      </div>
      
      {/* Sign In Footer */}
      <p className="text-center text-[14px] text-gray-500 mt-4">
        Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer hover:underline">Sign in</span>
      </p>
    </div>
  );
};

export default AccountBasics;
// import React from 'react';
// import { FcGoogle } from "react-icons/fc";
// import { FaRegUser, FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
// // lock from Feather Icons
// import { FiLock } from "react-icons/fi"; 
// const AccountBasics = ({ onNext }) => {
//   return (
//     <div className="w-full animate-fadeIn">
//       {/* Wrap in the same card style as the other steps */}
//       <div className="bg-white border border-gray-100 rounded-[16px] p-6 shadow-sm">
        
//         <div className="space-y-3">
//           {/* Name Row */}
//           <div className="grid grid-cols-2 gap-4">
//             <div className="relative">
//               <FaRegUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input type="text" placeholder="e.g. John" className="w-full h-12 pl-11 border border-gray-200 rounded-xl focus:border-[#F2B53D] outline-none text-[14px]" />
//             </div>
//             <input type="text" placeholder="e.g. Doe" className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:border-[#F2B53D] outline-none text-[14px]" />
//           </div>

//           {/* Email */}
//           <div className="relative">
//             <FaRegEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input type="email" placeholder="john@example.com" className="w-full h-12 pl-11 border border-gray-200 rounded-xl focus:border-[#F2B53D] outline-none text-[14px]" />
//           </div>

//           {/* Password */}
//           <div className="relative">
//             <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input type="password" placeholder="Create a strong password" className="w-full h-12 pl-11 pr-11 border border-gray-200 rounded-xl focus:border-[#F2B53D] outline-none text-[14px]" />
//             <FaRegEye className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
//           </div>

//           {/* Terms */}
//           <div className="flex items-start gap-3 py-1">
//             <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-gray-300 accent-[#235E5D] cursor-pointer" />
//             <label className="text-[12px] text-gray-500 leading-tight">
//               I agree to the <span className="text-[#F2B53D] font-bold underline cursor-pointer">Terms of Service</span> and <span className="text-[#F2B53D] font-bold underline cursor-pointer">Privacy Policy</span>.
//             </label>
//           </div>

//           <button onClick={onNext} className="w-full h-12 rounded-full text-white font-bold bg-[#F2B53D] hover:bg-[#e0a630] transition-all shadow-md mt-2 cursor-pointer">
//             Continue
//           </button>

//           <div className="flex items-center py-2">
//             <div className="flex-grow border-t border-gray-100"></div>
//             <span className="px-3 text-gray-400 text-[10px] font-bold">OR</span>
//             <div className="flex-grow border-t border-gray-100"></div>
//           </div>

//           <button className="w-full h-12 border border-gray-200 rounded-full flex justify-center items-center gap-3 bg-white hover:bg-gray-50 transition font-semibold text-[14px] cursor-pointer">
//             <FcGoogle size={20} /> Sign in with Google
//           </button>
//         </div>
//       </div>
      
//       <p className="text-center text-[13px] text-gray-500 mt-6">
//         Already have an account? <span className="text-[#F2B53D] font-bold cursor-pointer underline">Sign in</span>
//       </p>
//     </div>
//   );
// };

// export default AccountBasics;

