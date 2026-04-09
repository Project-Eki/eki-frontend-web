import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSearch,
  faGlobe,
  faChevronDown,
  faBars,
  faTimes
} from '@fortawesome/free-solid-svg-icons'
import logoImage from '../assets/eki-logo-black.png'
import { useTranslation } from 'react-i18next'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
  ]

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode)
    setIsLanguageOpen(false)
  }

  const currentLanguage = languages.find(lang => lang.code === i18n.resolvedLanguage) || languages[0]

  // Handle home navigation
  const handleHomeClick = (e) => {
    e.preventDefault()
    if (window.location.pathname === '/') {
      const homeSection = document.getElementById('home')
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate('/')
      setTimeout(() => {
        const homeSection = document.getElementById('home')
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }

  // Helper function to get nav item classes
  const getNavItemClasses = (path) => {
    const isActive = location.pathname === path
    return isActive
      ? 'bg-[#efb034] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-[#d99c1c] transition-all active:scale-95'
      : 'text-gray-700 text-sm font-semibold hover:text-[#efb034] transition-colors cursor-pointer'
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-14">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/">
            <img 
              src={logoImage} 
              alt="Eki Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center">
          <ul className="flex list-none gap-4 items-center">
            <li>
              <button
                onClick={handleHomeClick}
                className={getNavItemClasses('/')}
              >
                {t('nav.home')}
              </button>
            </li>
            <li>
              <Link 
                to="/Login" 
                className={getNavItemClasses('/Login')}
              >
                {t('nav.login')}
              </Link>
            </li>
            <li>
              <Link
                to="/vendorOnboarding"
                className={getNavItemClasses('/vendorOnboarding')}
              >
                {t('nav.signup')}
              </Link>
            </li>
            <li className="relative ml-2">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-1 text-gray-700 text-sm font-semibold hover:text-[#efb034] focus:outline-none"
              >
                <FontAwesomeIcon icon={faGlobe} className="text-sm" />
                <span>{currentLanguage.code.toUpperCase()}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-xs transition-transform duration-300 ${isLanguageOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        i18n.resolvedLanguage === lang.code
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
        <div className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          <FontAwesomeIcon
            icon={isOpen ? faTimes : faBars}
            className="text-xl text-gray-800 cursor-pointer"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-white ${
          isOpen ? 'max-h-screen border-t' : 'max-h-0'
        }`}
      >
        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              handleHomeClick()
              setIsOpen(false)
            }}
            className={`block w-full text-left ${
              location.pathname === '/' 
                ? 'bg-[#efb034] text-white px-4 py-2 rounded-lg text-sm font-bold'
                : 'font-medium text-gray-800 text-sm'
            }`}
          >
            {t('nav.home')}
          </button>
          <Link
            to="/Login"
            className={`block w-full text-left ${
              location.pathname === '/Login'
                ? 'bg-[#efb034] text-white px-4 py-2 rounded-lg text-sm font-bold'
                : 'font-medium text-gray-800 text-sm'
            }`}
            onClick={() => setIsOpen(false)}
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/vendorOnboarding"
            className={`block w-full text-left ${
              location.pathname === '/vendorOnboarding'
                ? 'bg-[#efb034] text-white px-4 py-2 rounded-lg text-sm font-bold'
                : 'font-medium text-gray-800 text-sm'
            }`}
            onClick={() => setIsOpen(false)}
          >
            {t('nav.signup')}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar