import { useOnboarding } from "../context/vendorOnboardingContext";
import { ACTIONS } from "../context/vendorOnboardingContext";
import Navbar from "../components/Navbar";
import AccountBasics from "../components/AccountBasics";
import VerifyEmail from "../components/VerifyEmail";
import BusinessIdentity from "../components/BusinessIdentity";
import ContactLocation from "../components/ContactLocation";
import OperationCompliance from "../components/OperationCompliance";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import OnboardingSuccess from "../components/OnboardingSuccess";
import Footer from "../components/Footer";
import { HiCheck } from "react-icons/hi";

const VendorOnboarding = () => {
  const { state, dispatch } = useOnboarding();
  const { currentStep, formData } = state;

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
    <div className="vendor-onboarding-root h-screen w-full flex flex-col bg-[#ecece7] font-sans overflow-hidden">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Shows steps 1-6, Step 7 (Success) is NOT shown */}
        <aside
          className="w-[240px] lg:w-[260px] p-2 lg:p-3 ml-10 lg:ml-8 my-2 rounded-[14px] flex flex-col shrink-0 shadow-xl border border-white/10"
          style={{
            background: "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
            boxShadow: "0px 4px 9px rgba(23, 26, 31, 0.11), 0px 0px 2px rgba(23, 26, 31, 0.12)",
          }}
        >
          <div className="relative w-full space-y-3 lg:space-y-4 mt-4 lg:mt-6">
            {/* Vertical connecting line */}
            <div className="absolute left-[18px] lg:left-[20px] top-[18px] lg:top-[20px] bottom-[18px] lg:bottom-[20px] w-[1px] bg-white/20"></div>

            <StepCard
              title="Account Basics"
              subtitle="Personal information & credentials"
              isActive={currentStep === 1}
              isCompleted={currentStep > 1}
            />

            <StepCard
              title="Verify Email"
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
              title="Compliance & Documents"
              subtitle="Upload business credentials"
              isActive={currentStep === 5}
              isCompleted={currentStep > 5}
            />

            {/* Step 6 - Review & Submit (shows in sidebar) */}
            <StepCard
              title="Review & Submit"
              subtitle="Verify all details"
              isActive={currentStep === 6}
              isCompleted={currentStep > 6}
            />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col items-center pl-4 pr-10 py-2 overflow-y-auto">
          {/* Mobile progress bar for small screens */}
          <div className="mobile-progress-bar">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className={`mobile-progress-step ${
                  n < currentStep ? "done" : n === currentStep ? "active" : ""
                }`}
              />
            ))}
          </div>

          <div
            className={`w-full transition-all duration-300 ${
              currentStep >= 3 ? "max-w-[900px]" : "max-w-[600px]"
            }`}
          >
            {/* Step 7 - Success (NOT shown in sidebar) */}
            {currentStep === 7 ? (
              <OnboardingSuccess />
            ) : (
              <>
                {/* STEP 1: Account Basics */}
                {currentStep === 1 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 1 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <div className="mb-5">
                        <h2 className="text-[22px] font-black text-gray-900 leading-tight">
                          Join to enjoy faster Sales
                        </h2>
                        <p className="text-gray-500 text-[13px] mt-1">
                          Let's start with the basics to get your account ready.
                        </p>
                      </div>

                      <AccountBasics
                        formData={formData}
                        updateFormData={handleUpdate}
                        onNext={handleNextStep}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Verify Email */}
                {currentStep === 2 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 2 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <VerifyEmail
                        formData={formData}
                        onNext={handleNextStep}
                        onBack={handleBackStep}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 3: Business Identity */}
                {currentStep === 3 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 3 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <BusinessIdentity
                        formData={formData}
                        updateFormData={handleUpdate}
                        onNext={handleNextStep}
                        onBack={handleBackStep}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Contact & Location */}
                {currentStep === 4 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 4 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <ContactLocation
                        formData={formData}
                        updateFormData={handleUpdate}
                        onNext={handleNextStep}
                        onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 3 })}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Operations & Compliance (Documents) */}
                {currentStep === 5 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 5 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <OperationCompliance
                        formData={formData}
                        updateFormData={handleUpdate}
                        onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 4 })}
                      />
                    </div>
                  </div>
                )}

                {/* STEP 6: Review & Submit */}
                {currentStep === 6 && (
                  <div className="animate-slideUp">
                    <div className="mb-4 mt-2">
                      <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                        Step 6 of 6
                      </span>
                    </div>

                    <div
                      className="w-full rounded-[16px] border border-white/30 p-6 backdrop-blur-md"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "0px 8px 32px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.05)",
                        backdropFilter: "blur(16px)",
                      }}
                    >
                      <ReviewAndSubmit
                        formData={formData}
                        onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 5 })}
                        onSubmitSuccess={() => dispatch({ type: ACTIONS.SET_STEP, payload: 7 })}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Development Tools - Only visible in development mode */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-2xl flex gap-2 z-50">
          <p className="text-white text-xs self-center mr-2">Dev Tools:</p>
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
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

/* STEP CARD COMPONENT - Individual step item in sidebar */
const StepCard = ({ title, subtitle, isActive, isCompleted }) => (
  <div
    className={`flex items-center gap-1.5 px-1.5 lg:px-2.5 py-1 lg:py-1.5 rounded-[8px] lg:rounded-[10px] transition-all relative z-10 w-full ${
      isActive
        ? "bg-white shadow-lg"
        : "bg-white/40 backdrop-blur-md border border-white/40 shadow-md"
    }`}
  >
    {/* Step circle with checkmark when completed */}
    <div
      className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 rounded-full border-[1.5px] flex items-center justify-center ${
        isActive || isCompleted
          ? "border-[#235E5D] bg-white"
          : "border-white/40 bg-white/20 backdrop-blur-md"
      }`}
    >
      {isCompleted && <HiCheck className="text-[#235E5D]" size={9} />}
    </div>

    {/* Step title and subtitle */}
    <div className="flex-1 min-w-0">
      <p
        className={`font-semibold text-[11px] lg:text-[12px] truncate ${
          isActive || isCompleted ? "text-gray-800" : "text-gray-700"
        }`}
      >
        {title}
      </p>
      <p
        className={`text-[9px] lg:text-[10px] truncate ${
          isActive || isCompleted ? "text-gray-600" : "text-gray-600/80"
        }`}
      >
        {subtitle}
      </p>
    </div>
  </div>
);

export default VendorOnboarding;