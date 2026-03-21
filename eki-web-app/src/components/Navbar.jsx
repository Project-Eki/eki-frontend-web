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
import { useTranslation } from 'react-i18next'  // <-- Add this import

const Navbar = () => {
  const { t, i18n } = useTranslation()  // <-- Add this hook
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  // Remove this line: const [selectedLanguage, setSelectedLanguage] = useState('EN')

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
  ]

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode)  // <-- Use i18n.changeLanguage instead of local state
    setIsLanguageOpen(false)
  }

  // Get current language display
  const currentLanguage = languages.find(lang => lang.code === i18n.resolvedLanguage) || languages[0]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-20">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img src={logoImage} alt="Eki Logo" className="h-16 w-auto object-contain" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center">
          <ul className="flex list-none gap-6 items-center">
            <li>
              <a href="#home" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                {t('nav.home')}  {/* <-- Translate this */}
              </a>
            </li>
            <li>
              <Link to="/Login" className="text-gray-700 font-semibold hover:text-[#efb034] transition-colors">
                {t('nav.login')}  {/* <-- Translate this */}
              </Link>
            </li>
            <li>
              <Link
                to="/vendorOnboarding"
                className="bg-[#efb034] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#d99c1c] transition-all active:scale-95"
              >
                {t('nav.signup')}  {/* <-- Translate this */}
              </Link>
            </li>
            <li className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-gray-700 font-semibold hover:text-[#efb034] focus:outline-none"
              >
                <FontAwesomeIcon icon={faGlobe} />
                <span>{currentLanguage.code.toUpperCase()}</span>  {/* <-- Use currentLanguage from i18n */}
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
                        i18n.resolvedLanguage === lang.code  // <-- Compare with i18n.resolvedLanguage
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
            {t('nav.login')}  {/* <-- Translate this */}
          </Link>
          <Link
            to="/signup"
            className="block w-full text-center bg-[#efb034] text-white py-3 rounded-lg font-bold"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.signup')}  {/* <-- Translate this */}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar