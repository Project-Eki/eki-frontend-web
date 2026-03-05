import axios from 'axios';

// 1. Centralized Axios Instance
// Using a relative baseURL allows Vite's proxy to bridge the gap to your Django backend
const api = axios.create({
  baseURL: "/api/v1/accounts", 
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * AUTHENTICATION ENDPOINTS
 */

// Matches your "sign in" file naming convention
export const signInUser = async (credentials) => {
  try {
    const response = await api.post("/login/", credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Sign in failed");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register/", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Registration failed");
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await api.post("/auth/verify-email/", { token });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Email verification failed");
  }
};

/**
 * VENDOR & BUSINESS ENDPOINTS
 */

export const submitBusinessIdentity = async (data) => {
  try {
    const response = await api.post("/vendor/documents/", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Business info submission failed");
  }
};

// Handles both Contact/Location and Operations/Compliance 
// since they share the same endpoint
export const submitVendorProfile = async (data) => {
  try {
    const response = await api.post("/vendor/profile/", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Profile submission failed");
  }
};

export default api;