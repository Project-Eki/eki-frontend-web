import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSearch, 
  faGlobe, 
  faChevronDown,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
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
          <FontAwesomeIcon 
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5"
          />
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
                className="bg-[#efb034] text-white border-none px-8 py-3.5 rounded-lg cursor-pointer text-base font-semibold transition-all duration-300 hover:bg-[#d99c1c] hover:-translate-y-0.5 hover:shadow-[0_20px_30px_rgba(0,0,0,0.2)] inline-block"
              >
                Sign Up
              </a>
            </li>
            
            {/* Language Selector */}
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-black font-medium hover:text-[#efb034ff] transition-colors duration-300 focus:outline-none"
              >
                <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
                <span>{selectedLanguage}</span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                />
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
          <FontAwesomeIcon 
            icon={isOpen ? faTimes : faBars} 
            className="text-gray-800 text-2xl"
          />
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
            
            {/* Mobile Language Selector */}
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center justify-center gap-1 text-black font-medium hover:text-[#efb034ff] py-2 mx-auto"
              >
                <FontAwesomeIcon icon={faGlobe} className="w-5 h-5" />
                <span>{selectedLanguage}</span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`w-4 h-4 transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                />
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