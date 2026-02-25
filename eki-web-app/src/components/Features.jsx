import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faCreditCard, faBoltLightning, faMessage } from '@fortawesome/free-solid-svg-icons'
import featuresImage from '../assets/dashboard-preview.jpg'

const Features = () => {
  const features = [
    {
      title: 'Powerful Listings Engine',
      description: 'Create high-conversion product pages with rich media, SEO tools, and dynamic pricing options that catch customers\' eyes.',
      icon: faList
    },
    {
      title: 'Secure Automated Payments',
      description: 'Get paid instantly through our encrypted gateway. Supports multi-currency, taxes, and automatic payout scheduling.',
      icon: faCreditCard
    },
    {
      title: 'Real-time Order Sync',
      description: 'Keep your inventory in sync across multiple channels. Receive instant push notifications the moment a sale is made.',
      icon: faBoltLightning
    },
    {
      title: 'Unified Review Management',
      description: 'Engage with your customers directly. Respond to feedback and build brand loyalty through our integrated messaging suite.',
      icon: faMessage
    }
  ]

  return (
    <section className="bg-[#F3FBFAFF] py-20 md:py-16 sm:py-12 relative overflow-hidden" id="products">
      <div className="container mx-auto px-8 max-w-7xl">
        
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-center mb-4 text-gray-800 max-w-4xl mx-auto">
          Sell Smarter, Not Harder
        </h2>
        <p className="text-lg md:text-base text-center text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Everything you need to showcase products, handle transactions, and build a reputation in one centralized hub.
        </p>
        
        {/* Two column layout - Left side features list, Right side image */}
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Left side */}
          <div className="w-full lg:w-1/2 space-y-8">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#1A5F591A] to-[#1A5F591A] rounded-lg flex items-center justify-center text-white text-base">
                  <FontAwesomeIcon icon={feature.icon} className="text-[#1A5F59FF]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Right side - Image preview */}
          <div className="w-full lg:w-1/2">
            <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img 
                src={featuresImage} 
                alt="Vendor dashboard preview" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default Features