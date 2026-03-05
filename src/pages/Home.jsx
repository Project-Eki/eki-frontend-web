import React from 'react';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Testimonials from '../components/Testimonials';
import TrustIndicators from '../components/TrustIndicators';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


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