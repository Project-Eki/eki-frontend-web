import React from 'react'

const Footer = () => {
  return (
    <footer className="bg-[#235E5D] text-white py-5">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-center text-white text-sm flex-col md:flex-row md:gap-0 gap-4 text-center md:text-left">
          <p className="m-0 text-white">Buy Smart. Sell Fast. Grow Together...</p>
          <p className="m-0 text-white">&copy; 2024 Vendor Portal. All rights reserved.</p>
          <div className="flex gap-8 justify-center md:justify-start">
            <a href="#support" className="text-white no-underline hover:text-white transition-colors duration-300">
              Support
            </a>
            <a href="#privacy" className="text-white no-underline hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#terms" className="text-white no-underline hover:text-white transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer