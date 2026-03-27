import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const AppDownloadSection = () => {
  // Actual app download landing page
  const appDownloadUrl = "https://your-app-download-page.com";

  // Actual app store links
  const googlePlayUrl = "https://play.google.com/store/apps/details?id=your.app.id";
  const appStoreUrl = "https://apps.apple.com/app/your-app-id";

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 md:py-10 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-gray-900 mb-2">
            Download Eki App
          </h2>
          <p className="text-lg text-gray-600">
            Scan the QR code to get started on iOS and Android
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          {/* QR Code with Embedded Logos */}
          <div className="relative inline-block">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <QRCodeSVG 
                value={appDownloadUrl}
                size={240}
                level="H"
                bgColor="#ffffff"
                fgColor="#235E5D"
              />
            </div>
            
            {/* Embedded Platform Logos */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="bg-white rounded-full p-2 shadow-md flex gap-2 items-center border border-gray-200">
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" 
                  alt="Android"
                  className="w-6 h-6"
                />
                <div className="w-px h-4 bg-gray-300"></div>
                <img 
                  src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" 
                  alt="Apple"
                  className="w-6 h-6"
                />
              </div>
            </div>
          </div>

          {/* Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a 
              href={googlePlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-transform hover:scale-105"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-12"
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
                className="h-12"
              />
            </a>
          </div>

          {/* Helper Text */}
          <p className="mt-6 text-gray-500 text-sm">
            Scan with your phone camera to download instantly
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppDownloadSection;