import { useOnboarding } from "../context/vendorOnboardingContext";
import { ACTIONS } from "../context/vendorOnboardingContext";
import AccountBasics from "../components/AccountBasics";
import VerifyEmail from "../components/VerifyEmail";
import BusinessIdentity from "../components/BusinessIdentity";
import ContactLocation from "../components/ContactLocation";
import OperationCompliance from "../components/OperationCompliance";
import ReviewAndSubmit from "../components/ReviewAndSubmit";
import OnboardingSuccess from "../components/OnboardingSuccess";
import Footer from "../components/Footer";
import { HiCheck } from "react-icons/hi";
import { HiArrowLeft } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import ekiLogo from "../assets/eki-logo2.png";

const VendorOnboarding = () => {
  const { state, dispatch } = useOnboarding();
  const { currentStep, formData } = state;
  const navigate = useNavigate();

  const handleUpdate = (newData) => {
    dispatch({ type: ACTIONS.UPDATE_FORM, payload: newData });
  };

  const handleNextStep = (targetStep) => {
    if (typeof targetStep === "number") {
      dispatch({ type: ACTIONS.SET_STEP, payload: targetStep });
    } else {
      dispatch({ type: ACTIONS.NEXT_STEP });
    }
  };

  const handleBackStep = () => {
    const isGoogleUser = localStorage.getItem("is_google_user") === "true";
    if (currentStep === 3 && isGoogleUser) {
      dispatch({ type: ACTIONS.SET_STEP, payload: 1 });
    } else {
      dispatch({ type: ACTIONS.PREV_STEP });
    }
  };

  const steps = [
    { title: "Account Basics", subtitle: "Personal information & credentials" },
    { title: "Verify Email", subtitle: "Confirm your email address" },
    { title: "Business Identity", subtitle: "Legal name & registration type" },
    { title: "Contact & Location", subtitle: "Where you operate from" },
    { title: "Compliance & Documents", subtitle: "Upload business credentials" },
    { title: "Review & Submit", subtitle: "Verify all details" },
  ];

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-[#ecece7] font-sans">

      {/* MOBILE TOP PROGRESS BAR */}
      <div className="md:hidden w-full bg-[#125852] px-4 py-3 shadow-lg flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <img src={ekiLogo} alt="Eki Logo" className="h-8 w-auto object-contain" />
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-[11px] font-semibold transition-colors"
          >
            <HiArrowLeft size={12} />
            Home
          </button>
        </div>
        <div className="flex gap-1.5 items-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i + 1 < currentStep
                  ? "bg-[#EFB034] flex-[2]"
                  : i + 1 === currentStep
                  ? "bg-white flex-[3]"
                  : "bg-white/25 flex-1"
              }`}
            />
          ))}
        </div>
        <p className="text-white/70 text-[10px] font-medium">
          Step {currentStep} of 6 —{" "}
          <span className="text-white font-semibold">{steps[currentStep - 1]?.title}</span>
        </p>
      </div>

      {/* BODY ROW: sidebar + main */}
      <div className="flex flex-1 min-h-0 p-3 gap-3">

        {/* SIDEBAR - Increased width */}
        <aside
          className="
            hidden
            md:flex md:flex-col
            md:w-[260px] lg:w-[300px]
            shrink-0 rounded-[16px]
            overflow-hidden
          "
          style={{
            background: "linear-gradient(160deg, #125852 0%, #0e4440 40%, #0b3330 100%)",
            boxShadow: "0px 4px 9px rgba(23,26,31,0.11), 0px 0px 2px rgba(23,26,31,0.12)",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center items-center pt-6 pb-5 px-4 shrink-0">
            <img
              src={ekiLogo}
              alt="Eki Logo"
              className="h-14 lg:h-16 w-auto object-contain"
            />
          </div>

          {/* Steps container */}
          <div className="relative flex flex-col flex-1 overflow-y-auto px-4 pb-6">
            {/* Connector line - properly aligned from first to last circle center */}
            <div
              className="absolute w-px bg-white/30 z-0"
              style={{ 
                left: "28px", // Center of circle (px-4 = 16px + half of w-6 circle = 12px = 28px)
                top: "60px",  // Adjusted for smaller card height
                bottom: "60px" // Adjusted for smaller card height
              }}
            />
            
            {/* Added gap-4 between steps */}
            <div className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <StepCard
                  key={step.title}
                  title={step.title}
                  subtitle={step.subtitle}
                  isActive={currentStep === i + 1}
                  isCompleted={currentStep > i + 1}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto px-2 md:px-4 lg:px-8 py-2">
          <div
            className={`w-full transition-all duration-300 ${
              currentStep >= 3 ? "max-w-[900px]" : "max-w-[600px]"
            }`}
          >
            {currentStep === 7 ? (
              <OnboardingSuccess />
            ) : (
              <>
                {/* Step badge */}
                <div className="mb-4 mt-2">
                  <span className="bg-[#FFF8ED] text-[#F2B53D] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border border-[#F2B53D]/20">
                    Step {currentStep} of 6
                  </span>
                </div>

                {/* Card */}
                <div
                  className="w-full rounded-[16px] border border-white/30 p-5 md:p-6 backdrop-blur-md animate-slideUp"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    boxShadow: "0px 8px 32px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.05)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  {currentStep === 1 && (
                    <div className="mb-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-[22px] font-black text-gray-900 leading-tight">
                            Enjoy easy Sales
                          </h2>
                          <p className="text-gray-500 text-[13px] mt-1">
                            Let's start with the basics to get your account ready.
                          </p>
                        </div>
                        <button
                          onClick={() => navigate("/")}
                          className="shrink-0 flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 hover:bg-gray-50 text-[11px] font-semibold transition-all duration-200"
                        >
                          <HiArrowLeft size={11} />
                          Home
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 1 && (
                    <AccountBasics
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                    />
                  )}
                  {currentStep === 2 && (
                    <VerifyEmail
                      formData={formData}
                      onNext={handleNextStep}
                      onBack={handleBackStep}
                    />
                  )}
                  {currentStep === 3 && (
                    <BusinessIdentity
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                      onBack={handleBackStep}
                    />
                  )}
                  {currentStep === 4 && (
                    <ContactLocation
                      formData={formData}
                      updateFormData={handleUpdate}
                      onNext={handleNextStep}
                      onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 3 })}
                    />
                  )}
                  {currentStep === 5 && (
                    <OperationCompliance
                      formData={formData}
                      updateFormData={handleUpdate}
                      onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 4 })}
                    />
                  )}
                  {currentStep === 6 && (
                    <ReviewAndSubmit
                      formData={formData}
                      onBack={() => dispatch({ type: ACTIONS.SET_STEP, payload: 5 })}
                      onSubmitSuccess={() => dispatch({ type: ACTIONS.SET_STEP, payload: 7 })}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black/80 p-4 rounded-2xl flex gap-2 z-50">
          <p className="text-white text-xs self-center mr-2">Dev:</p>
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => dispatch({ type: ACTIONS.SET_STEP, payload: num })}
              className="w-8 h-8 bg-white/20 text-white rounded-lg hover:bg-[#F2B53D] transition-colors text-xs"
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* STEP CARD - Reduced height with better spacing */
const StepCard = ({ title, subtitle, isActive, isCompleted, isFirst, isLast }) => (
  <div
    className={`
      flex items-center gap-3 px-3 py-2 rounded-[10px] transition-all relative z-10 w-full
      ${isActive
        ? "bg-white shadow-lg"
        : "bg-white/40 backdrop-blur-md border border-white/40 shadow-md"
      }
    `}
  >
    {/* Smaller circle for reduced height */}
    <div
      className={`
        w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center
        ${isActive || isCompleted
          ? "border-[#235E5D] bg-white"
          : "border-white/40 bg-white/20 backdrop-blur-md"
        }
      `}
    >
      {isCompleted && <HiCheck className="text-[#235E5D]" size={10} />}
    </div>

    {/* Compact text area */}
    <div className="flex-1 min-w-0">
      <p className={`font-semibold text-[11px] lg:text-[12px] truncate leading-tight ${isActive || isCompleted ? "text-gray-800" : "text-gray-700"}`}>
        {title}
      </p>
      <p className={`text-[9px] lg:text-[10px] truncate leading-tight ${isActive || isCompleted ? "text-gray-600" : "text-gray-600/80"}`}>
        {subtitle}
      </p>
    </div>
  </div>
);

export default VendorOnboarding;