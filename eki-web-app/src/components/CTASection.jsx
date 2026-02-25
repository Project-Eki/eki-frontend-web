import React from 'react'
import ctaBackground from '../assets/vendor1.jpg'

const CTASection = () => {
  return (
    <section 
      className="relative text-center py-20 md:py-16 sm:py-12 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${ctaBackground})` }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      <div className="container mx-auto px-4 max-w-2xl relative z-10">
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold mb-6 text-white">
          Turn Your Skills Into Earnings
        </h2>
        <p className="text-xl md:text-lg mb-8 opacity-90 text-white max-w-lg mx-auto">
          Join Eki's network of trusted sellers and reach thousands of local buyers. It's easy, secure, and rewarding.
        </p>
        <button className="px-10 py-4 text-lg bg-[#EFB034] text-white border-none rounded-lg cursor-pointer font-semibold transition-all duration-300 hover:bg-[#d99c1c] hover:-translate-y-0.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.2)] inline-block">
          Start Selling Today
        </button>
      </div>
    </section>
  )
}

export default CTASection