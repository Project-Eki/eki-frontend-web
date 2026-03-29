import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import heroImage from '../assets/hero-image.jpg';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Hero = () => {
  const { t } = useTranslation();
  
  // App download URLs
  const appDownloadUrl = "https://your-app-download-page.com";
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=your.app.id";
  const appStoreUrl = "https://apps.apple.com/app/your-app-id";

  return (
    <section
      id="home"
      className="bg-[linear-gradient(135deg,#F3FBFA_0%,#A7E2DB_100%)] w-full relative min-h-screen flex items-center overflow-hidden py-12 md:py-16"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#efb034] rounded-full blur-3xl opacity-10 -z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#235E5D] rounded-full blur-3xl opacity-10 -z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* Left Content - Hero Text */}
          <div className="flex-1 text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-gray-800">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
              {t('hero.description')}
            </p>
            
            <div className="flex justify-center lg:justify-start">
              <Link to="/VendorOnboarding">
                <button className="bg-[#efb034] text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 hover:bg-[#d99c1c] hover:-translate-y-1 hover:shadow-lg">
                  {t('hero.button')}
                </button>
              </Link>
            </div>
          </div>

          {/* Right Content - Combined Hero Image & QR Code */}
          <div className="flex-1 relative">
            <div className="relative flex justify-center items-center">
              {/* Decorative Shapes */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-[#235E5D] rounded-full opacity-20 hidden md:block"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 border-4 border-[#efb034] rounded-lg opacity-20 transform rotate-12 hidden md:block"></div>
              
              {/* Main Image Container */}
              <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                  <img
                    src={heroImage}
                    alt="Eki Seller"
                    className="w-full h-auto object-cover"
                  />
                </div>
                
                {/* QR Code Overlay Card - Positioned on LEFT side */}
                <div className="absolute -bottom-8 -left-6 md:-bottom-12 md:-left-8 z-20">
                  <div className="bg-white rounded-2xl shadow-2xl p-4 backdrop-blur-sm border border-gray-100">
                    <div className="relative inline-block">
                      <div className="bg-white p-3 rounded-xl">
                        <QRCodeSVG 
                          value={appDownloadUrl}
                          size={100}
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#235E5D"
                        />
                      </div>
                      
                      {/* Embedded Platform Logos */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white rounded-full p-1.5 shadow-md flex gap-1 items-center border border-gray-200">
                          <img 
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" 
                            alt="Android"
                            className="w-4 h-4"
                          />
                          <div className="w-px h-3 bg-gray-300"></div>
                          <img 
                            src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" 
                            alt="Apple"
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-center text-gray-600 mt-2 font-medium">
                      Download the Eki App
                    </p>
                  </div>
                </div>
                
                {/* Gradient Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#235E5D] to-[#efb034] rounded-2xl opacity-10 blur-2xl -z-10 scale-105"></div>
              </div>
            </div>
            
            {/* Store Badges - Positioned below */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-16 pt-4">
              <a 
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-10 md:h-11"
                />
              </a>
              <a 
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105"
              >
                <img 
                  src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  className="h-10 md:h-11"
                />
              </a>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Bottom Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
    </section>
  );
};

export default Hero;