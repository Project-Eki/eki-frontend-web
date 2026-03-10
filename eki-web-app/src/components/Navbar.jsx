import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={logoImage} alt="Eki Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>

       {/* Search Bar */}
<div className="hidden sm:flex flex-1 justify-center px-6">
  <div className="relative w-full max-w-[320px] lg:max-w-[420px]">
    <FontAwesomeIcon
      icon={faSearch}
      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
    <input
      type="text"
      placeholder="Search products..."
      className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-full outline-none focus:border-[#efb034] focus:ring-1 focus:ring-[#efb034] transition-all text-sm"
    />
  </div>
</div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center">
          <ul className="flex list-none gap-6 items-center">
            <li>
              <a href="#home" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#products" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                Products
              </a>
            </li>
            <li>
              <a href="#services" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                Services
              </a>
            </li>
            <li>
              <Link to="/signin" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                Sign in
              </Link>
            </li>
            <li>
              <Link
                to="/vendorOnboarding"
                className="bg-[#efb034] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#d99c1c] transition-all active:scale-95"
              >
                Sign Up
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-gray-700 font-semibold hover:text-[#efb034] focus:outline-none"
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span>{selectedLanguage}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        selectedLanguage === lang.code
                          ? 'text-[#efb034] bg-orange-50'
                          : 'text-gray-700 hover:bg-gray-50'
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

        {/* Mobile Menu Button */}
        <div className="lg:hidden ml-4" onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faBars}
            className="text-2xl text-gray-800 cursor-pointer"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-white ${
          isOpen ? 'max-h-screen border-t' : 'max-h-0'
        }`}
      >
        <div className="p-6 space-y-4">
          <Link
            to="/signin"
            className="block font-medium text-gray-800"
            onClick={() => setIsOpen(false)}
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="block w-full text-center bg-[#efb034] text-white py-3 rounded-lg font-bold"
            onClick={() => setIsOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar