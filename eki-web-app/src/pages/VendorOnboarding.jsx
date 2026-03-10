import React, { useState } from "react";
import Navbar2 from "../components/Navbar2";
import AccountBasics from "../components/AccountBasics";
import VerifyIdentity from "../components/VerifyIdentity";
import BusinessIdentity from "../components/BusinessIdentity";
import ContactLocation from "../components/ContactLocation";
import OperationCompliance from "../components/OperationCompliance";
import OnboardingSuccess from '../components/OnboardingSuccess'; 
import Footer from "../components/Footer";
import { HiCheck } from "react-icons/hi"; 

const VendorOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Centralized State
  const [formData, setFormData] = useState({
    // Step 1: Account Basics
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "", // Critical for backend 
    password: "",
    confirmPassword: "",
    agreeToTerms: false,

    // Step 3: Business Identity
    business_name: "",
    business_type: "", 
    owner_full_name: "",
    tax_id: "",
    registration_number: "",
    business_description: "",

    // Step 4: Contact & Location
    business_email: "",
    business_phone: "",
    address: "",
    city: "",
    country: "",

    // Step 5: Operations & Compliance
    opening_time: "09:00",
    closing_time: "17:00",

    // Step 5: Documents 
    documents: {
      national_id: null,
      business_license: null,
      tax_certificate: null,
      incorporation_cert: null,
    }
  });

  const handleUpdate = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNextStep = () => {
    if (currentStep === 5) {
      setIsSubmitted(true);
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8F9FA] font-sans overflow-hidden">
      <Navbar2 />
      
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-[320px] bg-[#235E5D] p-6 ml-10 my-6 rounded-[32px] flex flex-col shrink-0 shadow-xl border border-white/10 hidden lg:flex">
          <div className="relative w-full space-y-3 mt-10"> 
            {/* Vertical progress line */}
            <div className="absolute left-[28px] top-[30px] bottom-[30px] w-[1px] bg-white/20"></div>

            <StepCard title="Account Basics" subtitle="Personal info & credentials" isActive={currentStep === 1} isCompleted={currentStep > 1} />
            <StepCard title="Verify Identity" subtitle="Confirm your email" isActive={currentStep === 2} isCompleted={currentStep > 2} />
            <StepCard title="Business Identity" subtitle="Legal name & registration" isActive={currentStep === 3} isCompleted={currentStep > 3} />
            <StepCard title="Contact & Location" subtitle="Operational address" isActive={currentStep === 4} isCompleted={currentStep > 4} />
            <StepCard title="Final Review" subtitle="Compliance & Documents" isActive={currentStep === 5} />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto px-6 md:px-12 lg:px-20 py-10">
          <div className={`mx-auto transition-all duration-300 ${currentStep >= 3 ? "max-w-[900px]" : "max-w-[580px]"}`}> 
            
            {isSubmitted ? (
              <OnboardingSuccess />
            ) : (
              <div className="animate-fadeIn">
                {/* Step Indicator Badge */}
                <div className="mb-6">
                  <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20">
                    Step {currentStep} of 5
                  </span>
                </div>

                {/* Step 1: Account Basics */}
                {currentStep === 1 && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-[28px] font-black text-gray-900 leading-tight">Join to enjoy faster Sales</h2>
                      <p className="text-gray-500 text-[14px]">Let's start with the basics to get your account ready.</p>
                    </div>
                    <AccountBasics 
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep} 
                    />
                  </>
                )}

                {/* Step 2: Verify Identity (OTP) */}
                {currentStep === 2 && (
                  <VerifyIdentity 
                    formData={formData} 
                    onNext={handleNextStep} 
                    onBack={handleBackStep}
                  />
                )}

                {/* Step 3: Business Identity */}
                {currentStep === 3 && (
                  <BusinessIdentity 
                    formData={formData} 
                    updateFormData={handleUpdate} 
                    onNext={handleNextStep} 
                    onBack={handleBackStep} 
                  />
                )}

                {/* Step 4: Contact & Location */}
                {currentStep === 4 && (
                  <ContactLocation 
                    formData={formData} 
                    updateFormData={handleUpdate} 
                    onNext={handleNextStep} 
                    onBack={handleBackStep}
                  />
                )}

                {/* Step 5: Operations & Compliance */}
                {currentStep === 5 && (
                  <div className="mb-10">
                    <OperationCompliance 
                      formData={formData} 
                      updateFormData={handleUpdate} 
                      onFinish={handleNextStep} 
                      onBack={handleBackStep} 
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

// Helper component for Sidebar Steps
const StepCard = ({ title, subtitle, isActive, isCompleted }) => (
  <div className={`flex items-center gap-3 px-4 h-[60px] rounded-[15px] transition-all relative z-10 w-full 
    ${isActive ? "bg-white shadow-xl scale-105" : "bg-white/10 backdrop-blur-md border border-white/10"}`}>
    
    <div className={`w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center 
      ${(isActive || isCompleted) ? "border-[#235E5D] bg-[#F2B53D]" : "border-white/40 bg-white/20"}`}> 
      {isCompleted ? (
        <HiCheck className="text-white" size={14} />
      ) : (
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-white/40'}`} />
      )}
    </div>
    
    <div className="overflow-hidden">
      <p className={`font-semibold text-[13px] truncate ${isActive ? "text-gray-900" : "text-white"}`}>{title}</p>
      <p className={`text-[11px] truncate ${isActive ? "text-gray-500" : "text-white/60"}`}>{subtitle}</p>
    </div>
  </div>
);

export default VendorOnboarding;