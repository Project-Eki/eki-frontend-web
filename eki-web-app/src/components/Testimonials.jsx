import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import adaezeImage from '../assets/adaefe.jpg'
import kwameImage from '../assets/kwame.jpg'
import fatimaImage from '../assets/fatima.jpg'

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Adaefe Okonkwo',
      role: 'Vendor - Lagos, Nigeria',
      image: adaezeImage, 
      rating: 4,
      quote: 'As a vendor, I\'ve seen my sales double since moving here. The listing tools are just so much faster and the payout process is flawless.'
    },
    {
      name: 'Kwame Asante',
      role: 'Vendor - Electronics Accra, Ghana',
      image: kwameImage,
      rating: 5,
      quote: 'As a vendor, Eki has helped me reach customers I never could before. The dashboard is intuitive, and the confirmation code system eliminates disputes. My sales have grown 300% since joining.'
    },
    {
      name: 'Fatima Hassan',
      role: 'Service Provider Nairobi, Kenya',
      image: fatimaImage,
      rating: 5,
      quote: 'Running my beauty studio through Eki has been amazing. Clients book and pay in advance, so I can focus on delivering great service. The platform handles everything else.'
    }
  ]

  return (
    <section className="bg-[linear-gradient(180deg,#F3FBFAFF_0%,#A7E2DBFF_100%)] py-12 md:py-10 sm:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <h2 className="text-4xl md:text-3xl sm:text-2xl font-bold text-center mb-2 text-gray-800">
          Trusted by Thousands
        </h2>
        <p className="text-lg md:text-base text-center text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
          See what our community of buyers and vendors have to say about their <br className="hidden sm:block" />
          experience with Eki
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 md:p-5 rounded-lg relative shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Author section */}
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 md:w-11 md:h-11 rounded-full object-cover border-3 border-[#EFB034]"
                />

                <div>
                  <h4 className="text-gray-800 font-semibold mb-0.5 text-base md:text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-500 text-xs">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              
              {/* Star rating */}
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className={`text-lg md:text-base ${
                      i < testimonial.rating ? 'text-[#EFB034]' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Quote text */}
              <p className="italic text-gray-600 leading-relaxed text-sm md:text-sm relative z-10">
                {testimonial.quote}
              </p>

            </div>
          ))}
        </div>

      </div>  
    </section>
  )
}

export default Testimonials