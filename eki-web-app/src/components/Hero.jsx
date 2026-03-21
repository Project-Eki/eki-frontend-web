import React from 'react'
import heroImage from '../assets/hero-image.jpg'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Hero = () => {
  const { t } = useTranslation()

  return (
    <section
      id="home"
      className="bg-[linear-gradient(270deg,#F3FBFA_0%,#A7E2DB_100%)] w-full relative min-h-screen flex items-center overflow-hidden py-20"
    >
      <div className="max-w-7xl mx-auto px-8 w-full flex flex-col md:flex-row items-start justify-between gap-12 pt-10">

        <div className="flex-1 text-center md:text-left z-10 pt-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-800">
            {t('hero.title')}
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 mb-8 max-w-md mx-auto md:mx-0">
            {t('hero.description')}
          </p>
          <div className="flex justify-center md:justify-start">
            <Link to="/VendorOnboarding">
              <button className="bg-[#efb034] text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-[#d99c1c] hover:-translate-y-1 hover:shadow-lg">
                {t('hero.button')}
              </button>
            </Link>
          </div>
        </div>

        <div className="flex-1 relative flex justify-center items-start mt-8 md:-mt-16 lg:-mt-24">
          <div className="absolute -top-6 -left-6 w-32 h-32 border-4 border-[#235E5DFF] rounded-full opacity-20 hidden sm:block"></div>
          <div className="absolute -bottom-10 -right-6 w-40 h-40 border-4 border-[#EFB034] rounded-lg opacity-20 transform rotate-12 hidden sm:block"></div>

          <div className="relative z-10 w-full max-w-[500px]">
            <img
              src={heroImage}
              alt="Eki Seller"
              className="w-full h-auto object-cover rounded-[40px] shadow-2xl border-4 border-white/20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#235E5D] to-[#EFB034] rounded-[40px] opacity-10 blur-3xl -z-10 scale-105"></div>
          </div>
        </div>

      </div>
    </section>
  )
}

export default Hero