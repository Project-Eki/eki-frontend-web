import React, { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCreditCard, faBoltLightning, faMessage, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import listingEngineImg from '../assets/listingEngine.jpg'
import paymentImg from '../assets/Payment.jpg'
import ordersImg from '../assets/Orders.jpg'
import reviewsImg from '../assets/Reviews.jpg'

const Features = () => {
  const features = [
    {
      title: 'Powerful Listings Engine',
      description: 'Create high-conversion product pages with rich media, SEO tools, and dynamic pricing options that catch customers\' eyes.',
      icon: faList,
      image: listingEngineImg,
      imageAlt: 'Product listings dashboard'
    },
    {
      title: 'Secure Automated Payments',
      description: 'Get paid instantly through our encrypted gateway. Supports multi-currency, taxes, and automatic payout scheduling.',
      icon: faCreditCard,
      image: paymentImg,
      imageAlt: 'Secure payment processing'
    },
    {
      title: 'Real-time Order Sync',
      description: 'Keep your inventory in sync across multiple channels. Receive instant push notifications the moment a sale is made.',
      icon: faBoltLightning,
      image: ordersImg,
      imageAlt: 'Real-time analytics dashboard'
    },
    {
      title: 'Unified Review Management',
      description: 'Engage with your customers directly. Respond to feedback and build brand loyalty through our integrated messaging suite.',
      icon: faMessage,
      image: reviewsImg,
      imageAlt: 'Customer review management'
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + features.length) % features.length)
  }

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="bg-[#F8F9FAFF] py-12 md:py-16 sm:py-8" id="products">
      <div className="container mx-auto px-8 max-w-7xl">
        
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-center mb-2 text-gray-800 max-w-4xl mx-auto">
          Sell Smarter, Not Harder
        </h2>
        <p className="text-lg md:text-base text-center text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Everything you need to showcase products, handle transactions, and build a reputation in one centralized hub.
        </p>
        
        {/* Carousel Container */}
        <div className="relative">
          {/* Main Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0">
                  {/* Card with Image Inside - No rounded corners */}
                  <div className={`flex flex-col md:flex-row items-stretch gap-6 md:gap-8 bg-white overflow-hidden shadow-lg p-6 md:p-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}>
                    {/* Image Section */}
                    <div className="w-full md:w-1/2">
                      <div className="h-64 md:h-80 rounded-2xl overflow-hidden">
                        <img 
                          src={feature.image} 
                          alt={feature.imageAlt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Content Section */}
                    <div className="w-full md:w-1/2 flex flex-col justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#1A5F591A] to-[#1A5F591A] rounded-lg flex items-center justify-center mb-5">
                        <FontAwesomeIcon icon={feature.icon} className="text-[#1A5F59FF] text-2xl" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Previous slide"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-[#1A5F59FF] text-xl" />
          </button>
          
          <button 
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Next slide"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-[#1A5F59FF] text-xl" />
          </button>
          
          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'w-6 bg-[#1A5F59FF]' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features