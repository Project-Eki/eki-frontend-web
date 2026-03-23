import axios from 'axios';

const api = axios.create({
  baseURL: "http://134.122.22.45", 
  headers: { "Content-Type": "application/json" },
});

// --- INTERCEPTOR ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  const publicRoutes = [
    '/api/v1/accounts/login/', 
    '/api/v1/accounts/reset-password/', 
    '/api/v1/accounts/verify-email/', 
    '/api/v1/accounts/resend-code/', 
    '/api/v1/accounts/confirm-password-reset/'
  ];

  const isPublic = publicRoutes.some(route => config.url === route);

  if (!isPublic && token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

/** --- AUTHENTICATION --- **/
export const SigninUser = async (credentials) => {
  const response = await api.post('/api/v1/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password
  });
  const token = response.data?.access || response.data?.token;
  if (token) localStorage.setItem("access_token", token);
  return response.data;
};

export const verifyOtp = (data) => api.post('/api/v1/accounts/verify-email/', data).then(res => res.data);
export const resendOtp = (email) => api.post('/api/v1/accounts/resend-code/', { email }).then(res => res.data);

/** --- USER PROFILE (REQUIRED BY ACCOUNT SETTINGS) --- **/
export const getBuyerProfile = () => 
  api.get('/api/v1/accounts/Buyerprofile/').then(res => res.data);

export const updateBuyerProfile = (profileData) => 
  api.patch('/api/v1/accounts/Buyerprofile/', profileData).then(res => res.data);

/** --- VENDOR DASHBOARD --- **/
export const getVendorDashboard = () => 
  api.get('/api/v1/accounts/command-center/').then(res => res.data);

/** --- PRODUCT LISTINGS (CRUD) --- **/
export const getProducts = () => api.get('/api/v1/listings/').then(res => res.data);

export const createProductListing = async (productData) => {
  const payload = {
    title: productData.title,
    category: productData.category,
    price: parseFloat(productData.price),
    sku: productData.sku,
    inventory_quality: productData.qty?.toUpperCase() || "MEDIUM",
    vendor_location: productData.location || "Default",
    description: productData.description,
    is_published: productData.is_published ?? true
  };
  return api.post('/api/v1/listings/', payload).then(res => res.data);
};

export const updateProductListing = async (listingId, productData) => {
  const payload = {
    title: productData.title,
    category: productData.category,
    price: parseFloat(productData.price),
    sku: productData.sku,
    inventory_quality: productData.qty?.toUpperCase() || "MEDIUM",
    vendor_location: productData.location,
    description: productData.description,
    is_published: productData.is_published
  };
  return api.patch(`/api/v1/listings/${listingId}/`, payload).then(res => res.data);
};

export const deleteProductListing = (listingId) => api.delete(`/api/v1/listings/${listingId}/`);

export const uploadListingImage = (listingId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post(`/api/v1/listings/${listingId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

/** --- PASSWORDS --- **/
export const passwordResetRequest = (email) => api.post('/api/v1/accounts/reset-password/', { email });
export const passwordResetConfirm = (data) => api.post('/api/v1/accounts/confirm-password-reset/', data);
export const changePassword = (data) => api.post('/api/v1/accounts/change-password/', data);

export default api;