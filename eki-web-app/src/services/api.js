import axios from "axios";

// Axios instance configured for Localhost development
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
  // baseURL: "https://api-7w8f.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

// REQUEST INTERCEPTOR: Attach access token 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  // Only attach if we have a token
 if (token && token !== "undefined" && token !== "null") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Auto-refresh token on 401 
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const currentPath = window.location.pathname.toLowerCase();

    // SHIELD: If the user is onboarding, NEVER redirect to login automatically
    const isOnboarding = currentPath.includes("vendoronboarding");

    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If onboarding, just let the error fail silently so the user stays on the page
      if (isOnboarding) {
        console.warn("Suppressing redirect for onboarding path");
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");

      if (!refresh) {
        localStorage.clear();
        window.location.href = "/signin";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/accounts/token/refresh/`,
          { refresh }
        );
        localStorage.setItem("access_token", data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/signin";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/* --- AUTH & REGISTRATION --- */

// Sign In (Your requirement: File name is "sign in")
export const SigninUser = async ({ email, password }) => {
  const response = await api.post("/accounts/login/", { email, password });
  return response.data;
};

export const refreshToken = async ({ refresh }) => {
  const response = await api.post("/accounts/token/refresh/", { refresh });
  return response.data;
};


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

// Use this in OperationCompliance.jsx (the Review phase)
// export const completeVendorOnboarding = async (formData) => {
//   const data = new FormData();
  
//   // 1. Append general fields
//   Object.keys(formData).forEach((key) => {
//     if (key !== "documents" && formData[key] !== null && formData[key] !== undefined) {
//       data.append(key, formData[key]);
//     }
//   });

//   // 2. Append document files specifically
//   if (formData.documents) {
//     Object.keys(formData.documents).forEach((key) => {
//       if (formData.documents[key]) {
//         data.append(key, formData.documents[key]);
//       }
//     });
//   }

//   // 3. Make the PATCH request to the correct endpoint
//   const response = await api.patch("/accounts/register-vendor/", data, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
  
//   return response.data;
// };

export const completeVendorOnboarding = async (formData) => {
  const data = new FormData();
  
  Object.keys(formData).forEach((key) => {
    // 1. Skip documents and nulls
    if (key !== "documents" && formData[key] !== null && formData[key] !== undefined) {
      let value = formData[key];

      // FIX: Force business_category to lowercase
      if (key === 'business_category') {
        value = String(value).toLowerCase();
      }

      // FIX: Ensure phone doesn't have spaces and has a +
      if (key === 'business_phone' && value) {
        value = value.replace(/\s/g, ''); 
        if (!value.startsWith('+')) value = `+${value}`;
      }

      // FIX: Only append if the string isn't empty (avoids validation errors on optional fields)
      if (value !== "") {
        data.append(key, value);
      }
    }
  });

  // 2. Append documents
  if (formData.documents) {
    Object.keys(formData.documents).forEach((key) => {
      if (formData.documents[key] instanceof File) {
        data.append(key, formData.documents[key]);
      }
    });
  }

  // 3. IMPORTANT: Remove manual 'Content-Type'. 
  // Axios will set it automatically with the correct 'boundary' for files.
  const response = await api.patch("/accounts/register-vendor/", data, {
    headers: { "Content-Type": undefined }, 
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