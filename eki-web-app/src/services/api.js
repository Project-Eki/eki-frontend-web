import axios from "axios";

// Axios instance configured for Localhost development
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  // baseURL: "https://api-7w8f.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR: Attach access token 
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // RESPONSE INTERCEPTOR: Auto-refresh token on 401 
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Only handle 401 once per request
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;

//       const refresh = localStorage.getItem("refresh_token");

//       // If no refresh token, redirect immediately
//       if (!refresh) {
//         localStorage.clear();
//         window.location.href = "/Signin";
//         return Promise.reject(error);
//       }

//       try {
//         // Refresh access token
//         const { data } = await axios.post(
//           `${api.defaults.baseURL}/accounts/token/refresh/`,
//           { refresh }
//         );

//         // Save new access token
//         localStorage.setItem("access_token", data.access);

//         // Update original request with new token and retry
//         originalRequest.headers.Authorization = `Bearer ${data.access}`;
//         return api(originalRequest);
//       } catch {
//         // Refresh failed: clear storage and redirect
//         localStorage.clear();
//         window.location.href = "/signin";
//       }
//     }

//     // Pass all other errors to the caller
//     return Promise.reject(error);
//   }
// );

export default api;

/* --- AUTH & REGISTRATION --- */

// Sign In (Your requirement: File name is "sign in")
export const SigninUser = async ({ email, password }) => {
  const response = await api.post("/accounts/signin/", { email, password });
  return response.data;
};

export const refreshToken = async ({ refresh }) => {
  const response = await api.post("/accounts/token/refresh/", { refresh });
  return response.data;
};

// FIX: Added trailing slash and api/v1/ to match Django routing
export const registerVendor = async (payload) => {
  const response = await api.post("/accounts/register-vendor/", payload);
  return response.data;
};

export const verifyEmail = async ({ email, otp_code }) => {
  try {
    const response = await api.post("/accounts/verify-email/", {
      email,
      otp_code,
      otp_type: "email_verification",
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const msg =
        error.response.data.otp_code?.[0] || 
        error.response.data.message || 
        "Something went wrong.";
      throw new Error(msg);
    }
    throw new Error("Unable to verify OTP. Check your internet connection.");
  }
};

export const resendOtp = async ({ email }) => {
  try {
    const response = await api.post("/accounts/resend-code/", {
      email,
      otp_type: "email_verification",
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const msg = error.response.data.message || "Unable to resend OTP.";
      throw new Error(msg);
    }
    throw new Error("Cannot resend OTP. Check your connection.");
  }
};

export const passwordResetRequest = async ({ email }) => {
  const response = await api.post("/accounts/password/reset/", { email });
  return response.data;
};

export const passwordResetConfirm = async ({
  email,
  otp_code,
  new_password,
  confirm_password,
}) => {
  try {
    const response = await api.post("/accounts/password/reset/confirm/", {
      email,
      otp_code,
      new_password,
      confirm_password,
    });
    return response.data;
  } catch (error) {
    if (error.response)
      throw { message: error.response.data.message || "Failed to reset password." };
    throw { message: "Cannot reset password. Check your connection." };
  }
};

export const changePassword = async ({
  current_password,
  new_password,
  confirm_password,
}) => {
  const response = await api.post("/accounts/password/change/", {
    current_password,
    new_password,
    confirm_password,
  });
  return response.data;
};

/* --- VENDOR ONBOARDING & PROFILE --- */

export const updateVendorProfile = async (formData) => {
  const data = new FormData();
  Object.keys(formData).forEach((key) => {
    if (formData[key] !== null && formData[key] !== undefined) {
      data.append(key, formData[key]);
    }
  });

  const response = await api.patch("/accounts/vendor/vendorprofile/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getVendorProfile = async () => {
  const response = await api.get("/accounts/vendor/vendorprofile/");
  return response.data;
};

export const logoutUser = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  localStorage.clear();
  window.location.href = "/signin";

  if (refresh_token) {
    try {
      await api.post("/accounts/logout/", { refresh_token });
    } catch {
      // Ignore
    }
  }
};

export const validateSession = async () => {
  const response = await api.get("/accounts/session/");
  return response.data;
};