import { useOnboarding } from "../context/vendorOnboardingContext";
import { ACTIONS } from "../context/vendorOnboardingContext";
import Navbar2 from "../components/Navbar2";
import AccountBasics from "../components/AccountBasics";
import VerifyIdentity from "../components/VerifyIdentity";
import BusinessIdentity from "../components/BusinessIdentity";
import ContactLocation from "../components/ContactLocation";
import OperationCompliance from "../components/OperationCompliance";
import OnboardingSuccess from "../components/OnboardingSuccess";
import Footer from "../components/Footer";
import { HiCheck } from "react-icons/hi";

const VendorOnboarding = () => {
  const { state, dispatch } = useOnboarding();
  const { currentStep, isSubmitted, formData } = state;

  // Update form data
  const handleUpdate = (newData) => {
    dispatch({
      type: ACTIONS.UPDATE_FORM,
      payload: newData,
    });
  };

  // Go to next step
  const handleNextStep = (targetStep) => {
    if (typeof targetStep === "number") {
      dispatch({ type: ACTIONS.SET_STEP, payload: targetStep });
    } else {
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  // Go back
  const handleBackStep = () => {
    const isGoogleUser = localStorage.getItem("is_google_user") === "true";

    if (currentStep === 3 && isGoogleUser) {
      dispatch({ type: ACTIONS.SET_STEP, payload: 1 });
    } else {
      dispatch({ type: ACTIONS.PREV_STEP });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8F9FA] font-sans overflow-hidden">
      
      {/* Navbar */}
      <Navbar2 />

      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className="w-[300px] bg-[#235E5D] p-4 ml-10 my-4 rounded-[32px] flex flex-col shrink-0 shadow-xl border border-white/10">
          
          <div className="relative w-full space-y-3 mt-10">

            {/* vertical-line */}
            <div className="absolute left-[28px] top-[30px] bottom-[30px] w-[1px] bg-white/20"></div>

            <StepCard
              title="Account Basics"
              subtitle="Personal information & credentials"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />

            <StepCard
              title="Verify Identity"
              subtitle="Confirm your email address"
              isActive={currentStep === 2}
              isCompleted={currentStep > 2}
            />

            <StepCard
              title="Business Identity"
              subtitle="Legal name & registration type"
              isActive={currentStep === 3}
              isCompleted={currentStep > 3}
            />

            <StepCard
              title="Contact & Location"
              subtitle="Where you operate from"
              isActive={currentStep === 4}
              isCompleted={currentStep > 4}
            />

            <StepCard
              title="Secure Account"
              subtitle="Protect your merchant profile"
              isActive={currentStep === 5}
            />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center px-10">

          <div
            className={`w-full transition-all duration-300 ${
              currentStep >= 3 ? "max-w-[900px]" : "max-w-[600px]"
            }`}
          >

            {isSubmitted ? (
              <OnboardingSuccess />
            ) : (
              <>
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <>
                    <div className="mb-4">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 1 of 5
                      </span>

                      <h2 className="text-[28px] font-black text-gray-900 mt-2 leading-tight">
                        Join to enjoy faster Sales
                      </h2>

                      <p className="text-gray-500 text-[14px]">
                        Let's start with the basics to get your account ready.
                      </p>
                    </div>

                    <AccountBasics
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                    />
                  </>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <div className="flex flex-col items-start w-full">

                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">
                      Step 2 of 5
                    </span>

                    <div className="w-full flex justify-center">
                      <VerifyIdentity
                        formData={formData}
                        onNext={handleNextStep}
                        onBack={handleBackStep}
                      />
                    </div>

                  </div>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <div className="flex flex-col items-start w-full">

                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">
                      Step 3 of 5
                    </span>

                    <BusinessIdentity
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                      onBack={handleBackStep}
                    />

                  </div>
                )}

                {/* STEP 4 */}
                {currentStep === 4 && (
                  <div className="flex flex-col items-start w-full">

                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">
                      Step 4 of 5
                    </span>

                    <ContactLocation
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                      onBack={() =>
                        dispatch({ type: ACTIONS.SET_STEP, payload: 3 })
                      }
                    />

                  </div>
                )}

                {/* STEP 5 */}
                {currentStep === 5 && (
                  <div className="flex flex-col items-start w-full mb-10">

                    <span className="bg-[#FFF8ED] text-[#F2B53D] px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-[#F2B53D]/20 mb-8">
                      Step 5 of 5
                    </span>

                    <OperationCompliance
                      formData={formData}
                      updateFormData={handleUpdate}
                      onFinish={handleNextStep}
                      onBack={() =>
                        dispatch({ type: ACTIONS.SET_STEP, payload: 4 })
                      }
                    />

                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
     {/*  PASTING THE DEV TOOLS TO HELP ME WITH NAVIGATION  */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-2xl flex gap-2 z-50">
          <p className="text-white text-xs self-center mr-2">Dev Tools:</p>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button 
              key={num}
              onClick={() => dispatch({ type: ACTIONS.SET_STEP, payload: num })}
              className="w-8 h-8 bg-white/20 text-white rounded-lg hover:bg-[#F2B53D] transition-colors"
            >
              {num}
            </button>
          ))}
        </div>
      )} 
    </div>
  );
};


/* STEP CARD COMPONENT */

const StepCard = ({ title, subtitle, isActive, isCompleted }) => (
  <div
    className={`flex items-center gap-3 px-4 h-[60px] rounded-[15px] transition-all relative z-10 w-full 
    ${
      isActive
        ? "bg-white shadow-xl"
        : "bg-white/40 backdrop-blur-md border border-white/40 shadow-lg"
    }`}
  >
    <div
      className={`w-6 h-6 shrink-0 rounded-full border-[1.5px] flex items-center justify-center 
      ${
        isActive || isCompleted
          ? "border-[#235E5D] bg-white"
          : "border-white/40 bg-white/20 backdrop-blur-md"
      }`}
    >
      {isCompleted && <HiCheck className="text-[#235E5D]" size={14} />}
    </div>

    <div>
      <p
        className={`font-semibold text-[13px] ${
          isActive || isCompleted ? "text-gray-800" : "text-gray-700"
        }`}
      >
        {title}
      </p>

      <p
        className={`text-[11px] ${
          isActive || isCompleted ? "text-gray-600" : "text-gray-600/80"
        }`}
      >
        {subtitle}
      </p>
    </div>
  </div>
);

export default VendorOnboarding;