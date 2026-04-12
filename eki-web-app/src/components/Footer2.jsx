import React from 'react';

const Footer = () => {
    return(
<footer className="bg-[#1D4D4C] text-white py-3 px-5 sm:px-10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] shrink-0 mx-3 mb-3 rounded-xl">
              <div className="hidden sm:block">Buy Smart. Sell Fast. Grow Together...</div>
              <div>© 2026 Vendor Portal. All rights reserved.</div>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="relative inline-block cursor-pointer hover:underline">
                  eki<span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
                </span>
                <span className="cursor-pointer hover:underline">Support</span>
                <span className="cursor-pointer hover:underline">Privacy Policy</span>
                <span className="cursor-pointer hover:underline">Terms of Service</span>
                <span className="cursor-pointer hover:underline">Ijoema ltd</span>
              </div>
            </footer>
    );
};
export default Footer;



