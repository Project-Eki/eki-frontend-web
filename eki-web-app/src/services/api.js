import axios from "axios";
// axios instance
const api = axios.create({
  baseURL: "https://api-7w8f.onrender.com/api/v1",
  // baseURL: "http://134.122.22.45/api/v1",
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR: Attach access token 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE INTERCEPTOR: Auto-refresh token on 401 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh_token");

      // If no refresh token, redirect immediately
      if (!refresh) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Refresh access token
        const { data } = await axios.post(
          `${api.defaults.baseURL}/accounts/token/refresh/`,
          { refresh }
        );

        // Save new access token
        localStorage.setItem("access_token", data.access);

        // Update original request with new token and retry
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        // Refresh failed: clear storage and redirect
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // Pass all other errors to the caller
    return Promise.reject(error);
  }
);

export default api;

//AUTH & REGISTRATION  
//  Sign In — CustomTokenObtainPairSerializer
export const SigninUser = async ({ email, password }) => {
  const response = await api.post("/accounts/signin/", { email, password });
  return response.data; // returns { access: "...", refresh: "..." }
};

// Refresh access and refresh JWT tokens
export const refreshToken = async ({ refresh }) => {
  const response = await api.post("/accounts/token/refresh/", { refresh });
  return response.data;
};

// Register new vendor
export const registerVendor = async (payload) => {
  const response = await api.post("/accounts/register-vendor", payload);
  return response.data;
};

// verify email
export const verifyEmail = async ({ email, otp_code }) => {
  try {
    const response = await api.post("/accounts/verify-email/", {
      email,
      otp_code,
      otp_type: "email_verification",
    });
    return response.data;
  } catch (error) {
    // Server sent a response
    if (error.response) {
      const msg =
        error.response.data.otp_code?.[0] || // OTP-specific errors
        error.response.data.message ||       // General server message
        "Something went wrong.";
      throw new Error(msg);                 // Throw an Error object
    }
    // No response (network issue, server down)
    throw new Error("Unable to verify OTP. Check your internet connection.");
  }
};

// resendotp
export const resendOtp = async ({ email }) => {
  try {
    const response = await api.post("/accounts/resend-code/", {
      email,
      otp_type: "email_verification",
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const msg =
        error.response.data.message || "Unable to resend OTP. Please try again.";
      throw new Error(msg);
    }
    throw new Error("Cannot resend OTP. Check your internet connection.");
  }
};


// // Request password reset OTP
export const passwordResetRequest = async ({ email }) => {
  const response = await api.post("/accounts/password/reset/", { email });
  return response.data;
};

// Confirm password reset
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
      throw {
        message: error.response.data.message || "Failed to reset password.",
      };
    throw { message: "Cannot reset password. Check your internet connection." };
  }
};

// Change password 
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

/**
 * Updates the vendor profile. 
 * Handles both text fields and file uploads (ID, License, etc.)
 */
export const updateVendorProfile = async (formData) => {
  const data = new FormData();
  
  // Append all keys to FormData. 
  // For files, pass the File object; for strings, pass the string.
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
  localStorage.clear(); // always clear locally
  window.location.href = "/login"; // always redirect

  if (refresh_token) {
    try {
      await api.post("/accounts/logout/", { refresh_token });
    } catch {
      // ignore errors, server logout is optional
    }
  }
};

//Validate current session
export const validateSession = async () => {
  const response = await api.get("/accounts/session/");
  return response.data;
};

// // Google OAuth sign-in
// // export const googleAuth = async ({
// //   access_token,
// //   requested_role = 'vendor',
// // }) => {
// //   const response = await api.post("/accounts/google/", {
// //     access_token,
// //     requested_role,
// //   });
// //   return response.data;
// // };





