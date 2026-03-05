import axios from 'axios';


const api = axios.create({
  baseURL: "http://localhost:8000/api", 
  headers: {
    "Content-Type": "application/json",
  },
});






export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login/", credentials);
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




export const submitBusinessIdentity = async (data) => {
  try {
    const response = await api.post("/vendor/documents/", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Business info submission failed");
  }
};


export const submitVendorProfile = async (data) => {
  try {
    const response = await api.post("/vendor/profile/", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Profile submission failed");
  }
};

export default api;