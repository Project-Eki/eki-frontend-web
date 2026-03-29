import React, { useRef, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faCreditCard, faQrcode, faBoltLightning } from '@fortawesome/free-solid-svg-icons'

const TrustIndicators = () => {
  const indicators = [
    {
      title: 'Verified Profiles',
      description: 'AI-powered identity verification for all users and vendors',
      icon: faAddressBook
    },
    {
      title: 'Secure Payments',
      description: 'Multiple payment options with encrypted transactions and buyer protection',
      icon: faCreditCard
    },
    {
      title: 'Pickup Codes',
      description: 'Unique confirmation codes ensure order authenticity',
      icon: faQrcode
    },
    {
      title: 'Instant Settlement',
      description: 'Automatic vendor payment after buyer confirmation',
      icon: faBoltLightning
    }
  ]

  const scrollRef = useRef(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = scrollContainer.scrollWidth / 2
    const scrollStep = 1
    
    scrollContainer.scrollLeft = scrollAmount
    
    const autoScroll = setInterval(() => {
      scrollAmount -= scrollStep
      
      if (scrollAmount <= 0) {
        scrollAmount = scrollContainer.scrollWidth / 2
        scrollContainer.scrollLeft = scrollAmount
      } else {
        scrollContainer.scrollLeft = scrollAmount
      }
    }, 30)

    return () => clearInterval(autoScroll)
  }, [])

  // Duplicate indicators to create seamless infinite scroll
  const duplicatedIndicators = [...indicators, ...indicators]

  return (
    <section className="bg-[linear-gradient(0deg,#F3FBFAFF_0%,#A7E2DBFF_100%)] py-12 md:py-10 sm:py-8 w-full overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-center mb-2 text-[#235E5DFF] max-w-4xl mx-auto px-4">
          Built on Trust, Powered by Integrity
        </h2>
        <p className="text-lg md:text-base text-center text-[#235E5DFF] mb-8 max-w-3xl mx-auto leading-relaxed px-4">
          Our payment-first, on-site fulfillment model ensures secure transactions and accountability for both buyers and vendors
        </p>
        
        {/* Horizontal scrolling cards */}
        <div className="w-full overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {duplicatedIndicators.map((indicator, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] text-left p-6 md:p-5 bg-gray-50 rounded-lg hover:-translate-y-1 transition-all duration-300"
                style={{ 
                  minWidth: '280px',
                  boxShadow: 'none',
                  border: 'none',
                  outline: 'none'
                }}
              >
                {/* Icon inline with title */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#235E5DFF] to-[#235E5DFF] rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                    <FontAwesomeIcon icon={indicator.icon} />
                  </div>
                  <h3 className="text-lg md:text-base font-semibold text-gray-800">
                    {indicator.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 leading-relaxed text-sm md:text-sm">
                  {indicator.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}

export default TrustIndicators