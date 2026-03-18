import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// Helper to handle all login variations
export const SigninUser = async (credentials) => {
  try {
    const response = await api.post('/api/v1/accounts/login/', {
      email: credentials.email?.trim().toLowerCase(),
      password: credentials.password
    });
    return response.data.success ? response.data.data : response.data;
  } catch (error) { handleAxiosError(error); }
};
export const SignInUser = SigninUser;
export const signInUser = SigninUser;

// Password Reset Request
export const passwordResetRequest = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/password/change/', {
      email: email.trim().toLowerCase()
    });
    return response.data;
  } catch (error) { handleAxiosError(error); }
};

// Verify OTP - The 400 Fix
export const verifyOtp = async ({ email, otp_code }) => {
  try {
    const response = await api.post('/api/v1/accounts/verify-email/', {
      email: email?.trim().toLowerCase(),
      otp_code: String(otp_code),
      otp_type: "password_reset" 
    });
    return response.data;
  } catch (error) { handleAxiosError(error); }
};
export const verifyEmail = verifyOtp;

// Resend OTP
export const resendOtp = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/resend-code/', {
      email: email.trim().toLowerCase(),
      otp_type: "password_reset"
    });
    return response.data;
  } catch (error) { handleAxiosError(error); }
};

// Confirm Reset
export const passwordResetConfirm = async ({ email, otp_code, new_password }) => {
  try {
    const response = await api.post('/api/v1/accounts/confirm-password-reset/', {
      email: email.trim().toLowerCase(),
      otp_code: String(otp_code),
      new_password: new_password
    });
    return response.data;
  } catch (error) { handleAxiosError(error); }
};

const handleAxiosError = (error) => {
  let message = error.response?.data?.message || error.response?.data?.detail || "An error occurred.";
  throw new Error(message);
};

export default api;