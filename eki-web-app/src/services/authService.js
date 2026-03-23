import axios from 'axios';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR: Injecting the Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  
  const publicRoutes = ['/login/', '/reset-password/', '/verify-email/', '/resend-code/', '/confirm-password-reset/'];
  const isPublic = publicRoutes.some(route => config.url && config.url.includes(route));

  if (!isPublic) {
    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("TOKEN NOT FOUND IN STORAGE for route:", config.url);
    }
  }
  return config;
}, (error) => Promise.reject(error));

/** --- 1. AUTHENTICATION (Sign In) --- **/
export const SigninUser = async (credentials) => {
  const response = await api.post('/api/v1/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password
  });

  console.log("Full Login Response:", response.data);

  // Deep search for the token in the response
  const data = response.data;
  const token = data?.access || data?.token || data?.data?.access || data?.data?.token;

  if (token) {
    localStorage.setItem("access_token", token);
    console.log("TOKEN SUCCESSFULLY SAVED!");
  } else {
    console.error("LOGIN SUCCESSFUL BUT NO TOKEN FOUND IN RESPONSE. Check console for 'Full Login Response'.");
  }

  return data;
};

/** --- 2. VENDOR DASHBOARD --- **/
export const getVendorDashboard = async () => {
  const res = await api.get('/api/v1/accounts/command-center/');
  return res.data;
};

/** --- 3. PROFILE --- **/
export const getBuyerProfile = async () => {
  const res = await api.get('/api/v1/accounts/Buyerprofile/');
  return res.data;
};

export const updateBuyerProfile = async (userData) => {
  const formData = new FormData();
  formData.append('first_name', userData.firstName || "");
  formData.append('last_name', userData.lastName || "");
  if (userData.profileImageFile) formData.append('profile_picture', userData.profileImageFile);

  const res = await api.patch('/api/v1/accounts/Buyerprofile/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

/** --- 4. PASSWORD FLOWS & OTP --- **/
export const passwordResetRequest = async (email) => {
  const res = await api.post('/api/v1/accounts/reset-password/', { email: email.trim().toLowerCase() });
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await api.post('/api/v1/accounts/verify-email/', data);
  return res.data;
};

export const resendOtp = async (email) => {
  const res = await api.post('/api/v1/accounts/resend-code/', { email, otp_type: "password_reset" });
  return res.data;
};

export const passwordResetConfirm = async (data) => {
  const res = await api.post('/api/v1/accounts/confirm-password-reset/', data);
  return res.data;
};

/** --- 5. PRODUCT LISTINGS --- **/
export const createProductListing = async (productData) => {
  const payload = {
    title: productData.title,
    category: productData.category,
    price: parseFloat(productData.price),
    sku: productData.sku,
    inventory_quality: productData.qty?.toUpperCase() || "MEDIUM",
    vendor_location: productData.vendorLocation,
    description: productData.description,
    is_published: Boolean(productData.isPublished)
  };
  const res = await api.post('/api/v1/listings/', payload);
  return res.data;
};

export const uploadListingImage = async (listingId, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const res = await api.post(`/api/v1/listings/${listingId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export default api;