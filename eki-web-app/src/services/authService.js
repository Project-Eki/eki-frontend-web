import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR: Fixes the 401 "Invalid Token" error by cleaning headers for public routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const publicRoutes = [
    '/api/v1/accounts/reset-password/',
    '/api/v1/accounts/verify-email/',
    '/api/v1/accounts/confirm-password-reset/',
    '/api/v1/accounts/login/',
    '/api/v1/accounts/resend-code/'
  ];

  const isPublic = publicRoutes.some(route => config.url.includes(route));

  if (!isPublic && token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
}, (error) => Promise.reject(error));

/** --- AUTHENTICATION --- **/
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

/** --- FORGOT PASSWORD FLOW --- **/

// STEP 1: Request Code
export const passwordResetRequest = async (email) => {
  const response = await api.post('/api/v1/accounts/reset-password/', {
    email: email.trim().toLowerCase()
  });
  return response.data;
};

// STEP 2: Verify Code (FIXED 400 ERROR PAYLOAD)
export const verifyOtp = async ({ email, otp_code }) => {
  try {
    const response = await api.post('/api/v1/accounts/verify-email/', {
      email: email?.trim().toLowerCase(),
      otp_code: String(otp_code), 
      otp_type: "password_reset"   // REQUIRED to avoid 400 error
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Invalid or expired code");
  }
};

// STEP 3: Confirm New Password
export const passwordResetConfirm = async ({ email, otp_code, new_password, confirm_password }) => {
  const response = await api.post('/api/v1/accounts/confirm-password-reset/', {
    email: email.trim().toLowerCase(),
    otp_code: String(otp_code),
    new_password: new_password,
    confirm_password: confirm_password 
  });
  return response.data;
};

// THE MISSING EXPORT: Fixes the SyntaxError in otp.jsx
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