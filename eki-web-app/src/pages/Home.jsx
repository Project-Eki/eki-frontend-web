import React from 'react';
// Go up one level (to src) then down into components
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import TrustIndicators from '../components/TrustIndicators';
import CTASection from '../components/CTASection';
import Footer from '../../../src/components/Footer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faHome } from '@fortawesome/free-solid-svg-icons';

const Home = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      <TrustIndicators />
      <CTASection />
      <Footer />
    </>
  );
};

export default Home;