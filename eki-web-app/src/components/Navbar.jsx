import { useState } from 'react'
import logoImage from '../assets/eki-white-logo.png'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('EN')

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'KS', name: 'Kiswahili' },
    { code: 'FR', name: 'French' },
    { code: 'SP', name: 'Spanish' },
    { code: 'IT', name: 'Italiano' },
    { code: 'PT', name: 'Português' },
  ]

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode)
    setIsLanguageOpen(false)
    console.log(`Language changed to: ${langCode}`)
  }

  return (
    <nav className="bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="logo">
          <img src={logoImage} alt="Eki Logo" className="logo-img h-20 w-20" />
        </div>

        {/* Search Bar with Icon on Left */}
        <div className="flex-1 max-w-sm mx-4 relative">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor" 
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
            />
          </svg>
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full px-4 py-2.5 text-base border border-black rounded-full outline-none focus:border-[#efb034ff] transition-colors duration-300 pl-10"
          />
        </div>

        {/* Desktop Navigation */}
        <div className={`lg:flex ${isOpen ? 'block' : 'hidden'}`}>
          <ul className="flex flex-col lg:flex-row list-none gap-8 items-center">
            <li><a href="#home" className="text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 no-underline">Home</a></li>
            <li><a href="#products" className="text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 no-underline">Products</a></li>
            <li><a href="#services" className="text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 no-underline">Services</a></li>
            <li><a href="#login" className="text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 no-underline">Login</a></li>
            <li>
              <a 
                href="#signup" 
                className="bg-[#efb034] text-black font-medium px-4 py-2 rounded no-underline hover:bg-[#efb034] hover:text-black transition-colors duration-300"
              >
                Sign Up
              </a>
            </li>
            
            {/* Language Selector - Now after Sign Up */}
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                <span>{selectedLanguage}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                        selectedLanguage === lang.code ? 'bg-gray-50 text-[#efb034ff] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>

        {/* Hamburger Menu */}
        <div 
          className="flex lg:hidden flex-col cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`w-6 h-0.5 bg-gray-800 my-0.5 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-800 my-0.5 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-gray-800 my-0.5 transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`lg:hidden fixed left-0 w-full bg-white shadow-lg rounded-b-lg text-center transition-all duration-300 ${
          isOpen ? 'top-20' : '-top-full'
        }`}
      >
        <div className="py-5">
          <ul className="flex flex-col gap-4">
            <li><a href="#home" className="block text-black font-medium hover:text-[#efb034ff] py-2">Home</a></li>
            <li><a href="#products" className="block text-black font-medium hover:text-[#efb034ff] py-2">Products</a></li>
            <li><a href="#services" className="block text-black font-medium hover:text-[#efb034ff] py-2">Services</a></li>
            <li><a href="#login" className="block text-black font-medium hover:text-[#efb034ff] py-2">Login</a></li>
            <li>
              <a 
                href="#signup" 
                className="inline-block bg-[#efb034] text-black font-medium px-4 py-2 rounded no-underline hover:bg-[#efb034]"
              >
                Sign Up
              </a>
            </li>
            
            {/* Mobile Language Selector - Now after Sign Up */}
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center justify-center gap-1 text-black font-medium hover:text-[#efb034ff] py-2 mx-auto"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className="w-5 h-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                  />
                </svg>
                <span>{selectedLanguage}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth="1.5" 
                  stroke="currentColor" 
                  className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              
              {/* Mobile Language Dropdown */}
              {isLanguageOpen && (
                <div className="mt-2 bg-gray-50 rounded-md py-1 max-h-48 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`block w-full text-center px-4 py-2 text-sm hover:bg-gray-200 transition-colors duration-200 ${
                        selectedLanguage === lang.code ? 'bg-gray-200 text-[#efb034ff] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar