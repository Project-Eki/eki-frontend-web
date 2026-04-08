import React from "react";

const Footer = () => {
  return (
    /* Outer container: Background is now transparent to remove the gray block */
    <footer className="w-full bg-transparent p-2 shrink-0">
      {/* Inner Pill: The only visible part of the footer */}
      <div className="bg-[#235E5DFF] text-white py-1.5 px-8 flex justify-between items-center text-[12px] rounded-xl">
        
        {/* Tagline */}
        <div className="font-normal tracking-tight">
          Buy Smart. Sell Fast. Grow Together...
        </div>

        {/* Right Section: Navigation & Copyright */}
        <div className="flex gap-6 items-center">
          <div className="flex gap-4 items-center border-r border-white/20 pr-4 mr-4">
          <div className="opacity-90">
            © 2026 Vendor Portal. All rights reserved.
          </div>
          
           <span className="relative inline-block cursor-pointer hover:text-teal-200 transition-colors">
              eki
              <span className="absolute text-[6px] -top-1 -right-2 font-bold">TM</span>
            </span>
           
            <span className="cursor-pointer hover:underline underline-offset-4">
              Support
            </span>
            <span className="cursor-pointer hover:underline underline-offset-4">
              Privacy
            </span>
            <span className="cursor-pointer hover:underline underline-offset-4 font-semibold">
              Ijoema ltd
            </span>
          </div>
          

          
        </div>
      </div>
    </footer>
  );
};

export default Footer;