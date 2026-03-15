import axios from "axios";

const api = axios.create({
  baseURL: "https://api-7w8f.onrender.com/api/v1",
  headers: { "Content-Type": "application/json" },
});

/* --- INTERCEPTORS --- */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${api.defaults.baseURL}/accounts/token/refresh/`, { refresh });
          localStorage.setItem("access_token", data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

/* --- AUTH & REGISTRATION --- */

export const registerVendor = async (payload) => {
  const response = await api.post("/accounts/register-vendor", payload);
  return response.data;
};

export const verifyEmail = async ({ email, otp_code }) => {
  const response = await api.post("/accounts/verify-email/", {
    email,
    otp_code,
    otp_type: "email_verification",
  });
  return response.data;
};

export const resendOtp = async ({ email }) => {
  const response = await api.post("/accounts/resend-code/", {
    email,
    otp_type: "email_verification",
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

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/login";
};


// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://api-7w8f.onrender.com/api/v1",
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// //  Request Interceptor: Attach JWT access token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response Interceptor: Auto-refresh access token on 401
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       const refresh = localStorage.getItem("refresh_token");
//       if (refresh) {
//         try {
//           const { data } = await axios.post(
//             "https://api-7w8f.onrender.com/api/v1/accounts/token/refresh/",
//             { refresh },
//           );
//           localStorage.setItem("access_token", data.access);
//           originalRequest.headers.Authorization = `Bearer ${data.access}`;
//           return api(originalRequest);
//         } catch {
//           localStorage.removeItem("access_token");
//           localStorage.removeItem("refresh_token");
//         }
//       }
//     }
//     return Promise.reject(error);
//   },
// );

// export default api;

// // Auth
// // Sign In — CustomTokenObtainPairSerializer
// export const SigninUser = async ({ email, password }) => {
//   const response = await api.post("/accounts/signin/", { email, password });
//   return response.data; // returns { access: "...", refresh: "..." }
// };

// // Refresh access and refresh JWT tokens
// export const refreshToken = async ({ refresh }) => {
//   const response = await api.post("/accounts/token/refresh/", { refresh });
//   return response.data;
// };

// // Register new vendor
// export const registerVendor = async ({
//   first_name,
//   last_name,
//   email,
//   password,
//   confirm_password,
//   accepted_terms = true,
// }) => {
//   // request body
//   const payload = { first_name, last_name, email, password, accepted_terms };
//   if (confirm_password !== undefined)
//     payload.confirm_password = confirm_password;

//   const response = await api.post("/accounts/register-vendor", payload);
//   return response.data;
// };

// // Verify email with otp
// export const verifyEmail = async ({
//   email,
//   otp_code,
//   otp_type = "email_verification",
// }) => {
//   try {
//     const response = await api.post("/accounts/verify-email/", {
//       email,
//       otp_code,
//       otp_type,
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response) {
//       throw {
//         message:
//           error.response.data.otp_code?.[0] ||
//           error.response.data.message ||
//           "Something went wrong.",
//       };
//     }
//     throw { message: "Unable to verify OTP. Please check your connection." };
//   }
// };

// // Resend OTP
// export const resendOtp = async ({ email, otp_type = "email_verification" }) => {
//   try {
//     const response = await api.post("/accounts/resend-code/", {
//       email,
//       otp_type,
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw { message: error.response.data.message || "Unable to resend OTP." };
//     throw {
//       message: "Cannot resend OTP. Please check your internet connection.",
//     };
//   }
// };

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

// // Change password 
// export const changePassword = async ({
//   current_password,
//   new_password,
//   confirm_password,
// }) => {
//   const response = await api.post("/accounts/password/change/", {
//     current_password,
//     new_password,
//     confirm_password,
//   });
//   return response.data;
// };

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

// // Logout
// export const logoutUser = async () => {
//   const refresh_token = localStorage.getItem("refresh_token");
//   try {
//     const response = await api.post("/accounts/logout/", { refresh_token });
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     return response.data;
//   } catch (error) {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     if (error.response)
//       throw { message: error.response.data.message || "Failed to logout." };
//     throw { message: "Cannot logout. Please check your internet connection." };
//   }
// };

// // Validate current session
// export const validateSession = async () => {
//   const response = await api.get("/accounts/session/");
//   return response.data;
// };

// // Profile & Vendor Details 

// // Update vendor profile
// export const updateProfile = async (profileData) => {
//   try {
//     const response = await api.patch(
//       "/accounts/vendor/vendorprofile/",
//       profileData,
//     );
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw {
//         message: error.response.data.message || "Failed to update profile.",
//       };
//     throw {
//       message: "Cannot update profile. Please check your internet connection.",
//     };
//   }
// };

// // Submit business identity
// export const submitBusinessIdentity = async (data) => {
//   try {
//     const response = await api.post("/accounts/vendor/business-identity", data);
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw {
//         message:
//           error.response.data.message || "Failed to submit business identity.",
//       };
//     throw {
//       message: "Cannot submit business identity. Please check your connection.",
//     };
//   }
// };

// // Submit vendor contact and location
// export const submitContactLocation = async (data) => {
//   try {
//     const response = await api.patch("/accounts/vendor/location/", data);
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw {
//         message:
//           error.response.data.message || "Failed to submit contact/location.",
//       };
//     throw {
//       message:
//         "Cannot submit contact/location. Please check your internet connection.",
//     };
//   }
// };

// export const uploadVendorDocument = async ({
//   document_type,
//   document_file,
// }) => {
//   try {
//     const payload = new FormData();
//     payload.append("document_type", document_type);
//     payload.append("document_file", document_file);

//     const response = await api.post("/accounts/vendor/documents/", payload, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw {
//         message: error.response.data.message || "Failed to upload document.",
//       };
//     throw {
//       message: "Cannot upload document. Check your internet connection.",
//     };
//   }
// };

// // Submit compliance 
// export const submitOperationCompliance = async ({
//   registration_number,
//   opening_time,
//   closing_time,
// }) => {
//   try {
//     const response = await api.post("/accounts/vendor/compliance/", {
//       registration_number,
//       opening_time,
//       closing_time,
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response)
//       throw {
//         message: error.response.data.message || "Failed to submit compliance.",
//       };
//     throw {
//       message: "Cannot submit compliance. Check your internet connection.",
//     };
//   }
// };

// export const getVendorProfile = async () => {
//   const response = await api.get("/accounts/vendor/vendorprofile/");
//   return response.data;
// };
