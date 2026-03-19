import axios from 'axios';

const api = axios.create({
  // Updated to your Digital Ocean IP
  baseURL: "http://134.122.22.45",
  // baseURL: "http://127.0.0.1:8000", 
  headers: { "Content-Type": "application/json" },
});

// INTERCEPTOR: 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  // List of routes that do NOT need a token
  const publicRoutes = [
    '/api/v1/accounts/reset-password/',
    '/api/v1/accounts/verify-email/',
    '/api/v1/accounts/confirm-password-reset/',
    '/api/v1/accounts/login/', 
    '/api/v1/accounts/resend-code/'
  ];

  //  Safe check (prevents crash)
  const isPublic = publicRoutes.some(route => config.url?.includes(route));

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


/** --- VENDOR DASHBOARD --- **/
export const getVendorDashboard = async () => {
  const response = await api.get('/api/v1/accounts/command-center/');
  return response.data;
};


/** --- FORGOT PASSWORD FLOW --- **/

// Request Code
export const passwordResetRequest = async (email) => {
  const response = await api.post('/api/v1/accounts/reset-password/', {
    email: email.trim().toLowerCase()
  });
  return response.data;
};

// Verify Code 
export const verifyOtp = async ({ email, otp_code }) => {
  try {
    const response = await api.post('/api/v1/accounts/verify-email/', {
      email: email?.trim().toLowerCase(),
      otp_code: String(otp_code), 
      otp_type: "password_reset"   
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Invalid or expired code");
  }
};

// Confirm New Password
export const passwordResetConfirm = async ({ email, otp_code, new_password, confirm_password }) => {
  const response = await api.post('/api/v1/accounts/confirm-password-reset/', {
    email: email.trim().toLowerCase(),
    otp_code: String(otp_code),
    new_password: new_password,
    confirm_password: confirm_password 
  });
  return response.data;
};

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