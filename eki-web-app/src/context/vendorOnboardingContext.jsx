import { createContext, useReducer, useContext } from "react";
// create context
export const VendorOnboardingContext = createContext();
// action types to avoid typos
export const ACTIONS = {
  UPDATE_FORM: "UPDATE_FORM",
  NEXT_STEP: "NEXT_STEP",
  PREV_STEP: "PREV_STEP",
  SET_STEP: "SET_STEP",
  SUBMIT_FORM: "SUBMIT_FORM"
};
// initializing state
const initialState = {
  currentStep: 1,
  isSubmitted: false,
  formData: {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirmPassword: "",
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
    },
  },
};
// Reducer
const onboardingReducer = (state, action) => {
  switch (action.type) {

    case ACTIONS.UPDATE_FORM:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.payload
        }
      };

    case ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: state.currentStep + 1
      };

    case ACTIONS.PREV_STEP:
      return {
        ...state,
        currentStep: state.currentStep - 1
      };

    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload,
        // If jumping to 6, set isSubmitted to true; otherwise false so we can go back
        isSubmitted: action.payload === 6
      };

    case ACTIONS.SUBMIT_FORM:
      return {
        ...state,
        isSubmitted: true
      };

    default:
      return state;
  }
};
// Provider
export const VendorOnboardingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  return (
    <VendorOnboardingContext.Provider value={{ state, dispatch }}>
      {children}
    </VendorOnboardingContext.Provider>
  );
};

// Custom Hook
export const useOnboarding = () => {
  const context = useContext(VendorOnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used within VendorOnboardingProvider");
  }

  return context;
};