import React from "react";

const Footer = () => {
  return (
    <footer className="footer-root bg-[#235E5DFF] text-white py-4 px-10 flex justify-between items-center text-[11px] shrink-0">
      <div className="footer-tagline">Buy Smart. Sell Easy.</div>
      <div className="footer-copy">© 2026 Vendor Portal. All rights reserved.</div>
      <div className="footer-links flex gap-4">
        <span className="relative inline-block cursor-pointer hover:underline">
          eki
          <span className="absolute text-[5px] -bottom-0 -right-2">TM</span>
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