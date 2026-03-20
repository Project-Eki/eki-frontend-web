import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", 
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR: Prevents 401/404 issues by handling public vs private routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  // These routes MUST NOT have the Authorization header
  const publicRoutes = [
    '/api/v1/accounts/reset-password/',
    '/api/v1/accounts/verify-email/',
    '/api/v1/accounts/confirm-password-reset/',
    '/api/v1/accounts/login/', 
    '/api/v1/accounts/resend-code/'
  ];

  const isPublic = publicRoutes.some(route => config.url?.includes(route));

  if (isPublic) {
    // Completely remove the header for public endpoints to avoid 401/403 errors
    delete config.headers.Authorization;
  } else if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


/** --- 1. AUTHENTICATION --- **/
export const SigninUser = async (credentials) => {
  const response = await api.post('/api/v1/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password
  });
  
  const data = response.data?.data || response.data;
  
  if (data?.access) {
    localStorage.setItem("access_token", data.access);
  }
  return data;
};


/** --- 2. VENDOR DASHBOARD --- **/
export const getVendorDashboard = async () => {
  const response = await api.get('/api/v1/accounts/command-center/');
  return response.data;
};


/** --- 3. FORGOT PASSWORD / OTP FLOW --- **/

// Request Code: Starts the process and sets the cache key
export const passwordResetRequest = async (email) => {
  const response = await api.post('/api/v1/accounts/reset-password/', {
    email: email.trim().toLowerCase()
  });
  return response.data;
};

// Verify Code: This is where your 400 error was happening
export const verifyOtp = async ({ email, otp_code }) => {
  try {
    const response = await api.post('/api/v1/accounts/verify-email/', {
      email: email?.trim().toLowerCase(),
      otp_code: String(otp_code).trim(), // Clean up spaces
      otp_type: "password_reset"   // This MUST match the prefix in your server logs
    });
    return response.data;
  } catch (error) {
    // Log the exact message from Django (e.g., "Invalid OTP")
    console.error("OTP Verification Detailed Error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Invalid or expired code");
  }
};

// Confirm New Password: The final step
export const passwordResetConfirm = async ({ email, otp_code, new_password, confirm_password }) => {
  try {
    const response = await api.post('/api/v1/accounts/confirm-password-reset/', {
      email: email.trim().toLowerCase(),
      otp_code: String(otp_code).trim(),
      new_password: new_password,
      confirm_password: confirm_password 
    });
    return response.data;
  } catch (error) {
    console.error("Password Reset Detailed Error:", error.response?.data);
    throw new Error(error.response?.data?.message || "Failed to reset password. Please try again.");
  }
};

// Resend Code: Matches the prefix logic
export const resendOtp = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/resend-code/', {
      email: email.trim().toLowerCase(),
      otp_type: "password_reset"
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to resend code");
  }
};

export default api;