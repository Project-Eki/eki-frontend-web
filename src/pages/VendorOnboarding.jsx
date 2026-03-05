import { 
  registerUser, // This handles the Account Basics registration
  submitBusinessIdentity, 
  submitContactLocation, 
  submitOperationCompliance 
} from "../services/api"; // Fixed: Using relative path from src/pages to src/services
import { useState } from "react";
import Navbar from "../components/Navbar"; // Fixed: Using relative path to components
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
  const [loading, setLoading] = useState(false); // Added loading state for better UX

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    agreeToTerms: false,
    business_name: "",
    business_type: "", 
    owner_full_name: "",
    tax_id: "",
    registration_number: "",
    business_description: "",
    business_email: "",
    business_phone: "",
    address: "",
    city: "",
    country: "",
    opening_time: "09:00",
    closing_time: "17:00",
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

  const handleNextStep = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        await registerUser({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          agreeToTerms: formData.agreeToTerms,
        });
      }

      if (currentStep === 3) {
        await submitBusinessIdentity({
          business_name: formData.business_name,
          business_type: formData.business_type,
          owner_full_name: formData.owner_full_name,
          tax_id: formData.tax_id,
          registration_number: formData.registration_number,
          business_description: formData.business_description,
        });
      }

      if (currentStep === 4) {
        await submitContactLocation({
          business_email: formData.business_email,
          business_phone: formData.business_phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
        });
      }

      if (currentStep === 5) {
        await submitOperationCompliance({
          opening_time: formData.opening_time,
          closing_time: formData.closing_time,
          documents: formData.documents,
        });
        setIsSubmitted(true);
        return;
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error(error.message);
      alert(error.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8F9FA] font-sans">
      <Navbar/>
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[320px] bg-[#235E5D] p-6 ml-10 my-6 rounded-[32px] flex flex-col shrink-0 shadow-xl border border-white/10">
          <div className="relative w-full space-y-3 mt-10"> 
            <div className="absolute left-[28px] top-[30px] bottom-[30px] w-[1px] bg-white/20"></div>

            <StepCard title="Account Basics" subtitle="Personal info & credentials" isActive={currentStep === 1} isCompleted={currentStep > 1} />
            <StepCard title="Verify Identity" subtitle="Confirm your email" isActive={currentStep === 2} isCompleted={currentStep > 2} />
            <StepCard title="Business Identity" subtitle="Legal name & registration" isActive={currentStep === 3} isCompleted={currentStep > 3} />
            <StepCard title="Contact & Location" subtitle="Operational address" isActive={currentStep === 4} isCompleted={currentStep > 4} />
            <StepCard title="Secure Account" subtitle="Finalize merchant profile" isActive={currentStep === 5} />
          </div>
        </aside>

        <main className="flex-1 flex flex-col items-center px-12 overflow-y-auto">
          <div className={`w-full transition-all duration-300 mt-10 ${currentStep >= 3 ? "max-w-[900px]" : "max-w-[600px]"}`}> 
            
            {isSubmitted ? (
              <OnboardingSuccess />
            ) : (
              <>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <>
                    <div className="mb-4 text-center md:text-left">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20">Step 1 of 5</span>
                      <h2 className="text-[28px] font-black text-gray-900 mt-2 leading-tight">Join to enjoy faster Sales</h2>
                      <p className="text-gray-500 text-[14px]">Let's start with the basics to get your account ready.</p>
                    </div>
                    <AccountBasics 
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                      loading={loading} />
                  </>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="flex flex-col items-start w-full">
                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 2 of 5</span>
                    <div className="w-full flex justify-center">
                      <VerifyIdentity 
                        formData={formData} 
                        onNext={() => setCurrentStep(3)} 
                        onBack={()=> setCurrentStep(1)}/>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="flex flex-col items-start w-full">
                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 3 of 5</span>
                    <BusinessIdentity 
                      formData={formData} 
                      updateFormData={handleUpdate} 
                      onNext={handleNextStep} 
                      onBack={() => setCurrentStep(2)}
                      loading={loading} />
                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="flex flex-col items-start w-full">
                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 4 of 5</span>
                    <ContactLocation 
                      formData={formData} 
                      updateFormData={handleUpdate} 
                      onNext={handleNextStep} 
                      onBack={() => setCurrentStep(3)}
                      loading={loading}/>
                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="flex flex-col items-start w-full mb-10">
                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">Step 5 of 5</span>
                    <OperationCompliance 
                      formData={formData} 
                      updateFormData={handleUpdate} 
                      onFinish={handleNextStep} 
                      onBack={() => setCurrentStep(4)}
                      loading={loading} />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

const StepCard = ({ title, subtitle, isActive, isCompleted }) => (
  <div className={`flex items-center gap-3 px-4 h-[60px] rounded-[15px] transition-all relative z-10 w-full mb-3
    ${isActive ? "bg-white shadow-xl scale-105" : "bg-white/40 backdrop-blur-md border border-white/40 shadow-lg"}`}>
    <div className={`w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center 
      ${(isActive || isCompleted) ? "border-[#235E5D] bg-white" : "border-white/40 bg-white/20 backdrop-blur-md"}`}> 
      {isCompleted && <HiCheck className="text-[#235E5D]" size={14} />}
    </div>
    <div className="overflow-hidden">
      <p className={`font-semibold text-[13px] truncate ${(isActive || isCompleted) ? "text-gray-800" : "text-gray-700/80"}`}>{title}</p>
      <p className={`text-[10px] truncate ${(isActive || isCompleted)? "text-gray-600" : "text-gray-600/60"}`}>{subtitle}</p>
    </div>
  </div>
);

export default VendorOnboarding;