import React from 'react'
import heroImage from '../assets/hero-image.jpg'

const Hero = () => {
  return (
    <section 
      id="home"
      className="bg-gradient-to-l from-[#f3fbfa] to-[#a7e2db] shadow-[0px_4px_9px_rgba(23,26,31,0.11),0px_0px_2px_rgba(23,26,31,0.12)] w-full relative min-h-screen overflow-hidden py-12 md:py-0"
    >
      {/* Hero Image - Right side */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 w-[45%] hidden md:block overflow-visible">
        <div className="relative h-[80vh] max-h-[600px] w-full flex items-center justify-center">
          
          {/* Shape 1: Top left circle */}
          <div className="absolute -top-10 -left-10 w-32 h-32 border-4 border-[#235E5DFF] rounded-full opacity-30 z-0"></div>
          
          {/* Shape 2: Bottom right square rotated */}
          <div className="absolute -bottom-8 -right-8 w-40 h-40 border-4 border-[#EFB034] rounded-lg opacity-30 transform rotate-12 z-0"></div>
          
          {/* Shape 3: Additional decorative element - dotted circle */}
          <div className="absolute top-1/2 -right-16 w-24 h-24 border-4 border-dashed border-[#22365D] rounded-full opacity-20 z-0"></div>
          
          {/* Main Image */}
          <img 
            src={heroImage} 
            alt="Sell Smarter Illustration" 
            className="relative w-auto h-auto max-w-full max-h-full object-contain rounded-[40px] shadow-2xl z-10"
          />
          
          {/* Shape 4: Behind the image glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#235E5D] to-[#EFB034] rounded-[40px] opacity-10 blur-xl -z-10 transform scale-105"></div>
        
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 w-full min-h-screen relative z-10 flex items-center">
        
        {/* Hero Content - Left Side */}
        <div className="max-w-2xl w-full md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-gray-800">
            Start Selling<br />from Eki
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
            Eki connects you to a thriving marketplace of local sellers and service providers, 
            all with verified profiles for secure, pickup-based transactions.
          </p>
          <button className="bg-[#efb034] text-white border-none px-8 py-3.5 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#d99c1c] hover:-translate-y-0.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.2)] inline-block">
            Become a Seller
          </button>
        </div>

        {/* Mobile Image - Below content */}
        <div className="block md:hidden w-full mt-12">
          <div className="relative h-[300px] w-full max-w-md mx-auto flex items-center justify-center">
            
            {/* Mobile Shapes */}
            <div className="absolute -top-6 -left-6 w-20 h-20 border-4 border-[#235E5D] rounded-full opacity-30"></div>
            <div className="absolute -bottom-6 -right-6 w-28 h-28 border-4 border-[#EFB034] rounded-lg opacity-30 transform rotate-12"></div>
            
            <img 
              src={heroImage} 
              alt="Sell Smarter Illustration" 
              className="relative w-auto h-auto max-w-full max-h-full object-contain rounded-3xl shadow-2xl z-10"
            />
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero