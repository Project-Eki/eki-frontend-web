import { useState } from "react";
import Navbar from "../components/Navbar";
import AccountBasics from "../components/AccountBasics";
import VerifyIdentity from "../components/VerifyIdentity";
import BusinessIdentity from "../components/BusinessIdentity";
import ContactLocation from "../components/ContactLocation";
import OperationCompliance from "../components/OperationCompliance";
import OnboardingSuccess from '../components/OnboardingSuccess'; 
import Footer from "../components/Footer";
import { HiCheck } from "react-icons/hi"; 

const VendorOnboarding = () => {
  // change state back to 1 from 2
  const [currentStep, setCurrentStep] = useState(1);

  // NEW: State for tracking if the final "Submit" was clicked
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8F9FA]  font-sans">
      {/* navbar */}
      <Navbar/>
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
<aside className="w-[320px] bg-[#235E5D] p-6 ml-10 my-6 rounded-[32px] flex flex-col shrink-0 shadow-xl border border-white/10">
          <div className="relative w-full space-y-3 mt-10"> 
            {/* The vertical progress line */}
            <div className="absolute left-[28px] top-[30px] bottom-[30px] w-[1px] bg-white/20"></div>

            <StepCard title="Account Basics" subtitle="Personal information & credentials" isActive={currentStep === 1} isCompleted={currentStep > 1} />
            <StepCard title="Verify Identity" subtitle="Confirm your email address" isActive={currentStep === 2} isCompleted={currentStep > 2} />
            <StepCard title="Business Identity" subtitle="Legal name & registration type" isActive={currentStep === 3} isCompleted={currentStep > 3} />
            <StepCard title="Contact & Location" subtitle="Where you operate from" isActive={currentStep === 4} isCompleted={currentStep > 4} />
            <StepCard title="Secure Account" subtitle="Protect your merchant profile" isActive={currentStep === 5} />
          </div>
        </aside>
<main className="flex-1 flex flex-col items-center px-20 px-12">
  {/* NOTICE THE UPDATED TERNARY LOGIC: currentStep >= 3 */}
  <div className={`w-full transition-all duration-300 ${currentStep >= 3 ? "max-w-[900px]" : "max-w-[600px]"}`}> 
    
    {isSubmitted ? (
      // Show Success Screen if submitted
      <OnboardingSuccess />
    ) : (
      // Show the steps if NOT submitted
      <>
        {/* STEP 1 */}
        {currentStep === 1 && (
          <>
            <div className="mb-4">
              <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20">Step 1 of 5</span>
              <h2 className="text-[28px] font-black text-gray-900 mt-2 leading-tight">Join to enjoy faster Sales</h2>
              <p className="text-gray-500 text-[14px]">Let's start with the basics to get your account ready.</p>
            </div>
            <AccountBasics onNext={() => setCurrentStep(2)} />
          </>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="flex flex-col items-start w-full">
            <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 2 of 5</span>
            <div className="w-full flex justify-center">
              <VerifyIdentity onNext={() => setCurrentStep(3)} onBack={()=> setCurrentStep(1)}/>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="flex flex-col items-start w-full">
            <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 3 of 5</span>
            <BusinessIdentity onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)}  />
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="flex flex-col items-start w-full">
            <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 4 of 5</span>
            <ContactLocation onNext={() => setCurrentStep(5)} onBack={() => setCurrentStep(3)}/>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="flex flex-col items-start w-full mb-10"> {/* mb-10 added for bottom scrolling padding */}
            <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 5 of 5</span>
            <OperationCompliance onFinish={() => setIsSubmitted(true)} onBack={() => setCurrentStep(4)} />
          </div>
        )}
      </>
    )}

  </div>
</main>

      </div>

      {/*Footer */}
      <Footer />
    </div>
  );
};

// Helper component 
const StepCard = ({ title, subtitle, isActive, isCompleted }) => (
  //  stepcard
  <div className={`flex items-center gap-3 px-4 h-[60px] rounded-[15px] transition-all relative z-10 w-full 
    ${isActive ? "bg-white shadow-xl" : "bg-white/40 backdrop-blur-md border border-white/40 shadow-lg"}`}>
      {/* circle */}
    <div className={`w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center 
      ${(isActive || isCompleted) ? "border-[#235E5D] bg-white"
      : "border-white/40 bg-white/20 backdrop-blur-md"}`}> 
      {/* Checkmark */}
      {isCompleted && <HiCheck className="text-[#235E5D]" size={14} />}
    </div>
    <div>
      <p className={`font-semibold text-[14px] ${(isActive || isCompleted) ? "text-gray-800" : "text-gray-700"}`}>{title}</p>
      <p className={`text-[12px] ${(isActive || isCompleted)? "text-gray-600" : "text-gray-600/80"}`}>{subtitle}</p>
    </div>
  </div>
);

export default VendorOnboarding;


