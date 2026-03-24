import axios from "axios";

// Axios instance configured for Localhost development
const api = axios.create({
  // baseURL: "http://134.122.22.45/api/v1",
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
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/accounts/token/refresh/`,
          { refresh },
        );

        const newAccessToken = data.access || data.token;
        localStorage.setItem("access_token", newAccessToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  },
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
      throw {
        message: error.response.data.message || "Failed to reset password.",
      };
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
export const completeVendorOnboarding = async (formData) => {
  const data = new FormData();

  Object.keys(formData).forEach((key) => {
    // 1. Skip documents and nulls
    if (
      key !== "documents" &&
      formData[key] !== null &&
      formData[key] !== undefined
    ) {
      let value = formData[key];

      //  Force business_category to lowercase
      if (key === "business_category") {
        value = String(value).toLowerCase();
      }

      // Ensure phone doesn't have spaces and has a +
      if (key === "business_phone" && value) {
        value = value.replace(/\s/g, "");
        if (!value.startsWith("+")) value = `+${value}`;
      }

      //  Only append if the string isn't empty (avoids validation errors on optional fields)
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

// export const getVendorProfile = async () => {
//   const response = await api.get("/accounts/vendor/vendorprofile/");
//   return response.data;
// };

export const logoutUser = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  localStorage.clear();
  window.location.href = "/loginin";

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


// BUSINESS SETTINGS PAGE
// fetch the vendor's current profile data
export const getVendorProfile = async () => {
  const response = await api.get("/accounts/register-vendor/");
  return response.data.data;
};

// Update specific fields — logo included as a file
export const updateVendorProfile = async (changedFields) => {
  const data = new FormData();

  Object.keys(changedFields).forEach((key) => {
    const value = changedFields[key];
    if (value === null || value === undefined || value === "") return;

    if (key === "business_category") {
      data.append(key, String(value).toLowerCase());
    } else if (key === "business_phone") {
      let phone = value.replace(/\s/g, "");
      if (!phone.startsWith("+")) phone = `+${phone}`;
      data.append(key, phone);
    } else {
      data.append(key, value); // File objects (logo) are appended as-is
    }
  });

  const response = await api.patch("/accounts/register-vendor/", data, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

/* --- LISTINGS & SERVICES --- */

// Fetch only "service" type listings
export const getServices = async (status = '') => {
  const params = { listing_type: 'service' };
  if (status) params.status = status;
  const response = await api.get("/listings/", { params });
  return response.data;
};

export const createListing = async (payload) => {
  const response = await api.post("/listings/", payload);
  return response.data;
};

export const updateListingStatus = async (id, status) => {
  const response = await api.patch(`/listings/${id}/status/`, { status });
  return response.data;
};

export const deleteListing = async (id) => {
  await api.delete(`/listings/${id}/`);
};

export const uploadListingImage = async (listingId, imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("is_primary", "true");
  const response = await api.post(`/listings/${listingId}/images/`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};


// ADMIN DASHBOARD ENDPOINTS
// ADDED: Single call that powers the entire admin dashboard.
// Returns: overview stats, user_management, content_moderation,
//          transaction_monitoring, verification_workflows, unread_notifications
export const getAdminDashboard = async () => {
  const response = await api.get("/accounts/admin/dashboard/");
  return response.data;
};

// ADDED: Recent admin action logs — feeds the ActivityPanel
// Paginated: pass page number e.g. getAdminLogs(2)
export const getAdminLogs = async (page = 1) => {
  const response = await api.get("/accounts/admin/logs/", {
    params: { page },
  });
  return response.data;
};

// ADDED: Flagged content for the moderation table
// Optional filters: status = pending | reviewing | resolved
//                   type   = listing | review | chat_message
export const getAdminModeration = async (filters = {}) => {
  const response = await api.get("/accounts/admin/moderation/", {
    params: filters,
  });
  return response.data;
};

// ADDED: Platform-wide stats (total users, listings, etc.)
export const getAdminStats = async () => {
  const response = await api.get("/accounts/admin/stats/");
  return response.data;
};

// ADDED: List all vendor verification applications
export const getAdminVerifications = async () => {
  const response = await api.get("/accounts/admin/verifications/");
  return response.data;
};

// ADDED: Approve, reject, or suspend a vendor verification
// status options: "approved" | "rejected" | "suspended"
// rejection_reason is required when status is rejected or suspended
export const updateVerificationStatus = async (vendorId, status, rejectionReason = "") => {
  const payload = { verification_status: status };
  if (rejectionReason) payload.rejection_reason = rejectionReason;
  const response = await api.patch(
    `/accounts/admin/verifications/${vendorId}/`,
    payload
  );
  return response.data;
};

// ADDED: Get admin notifications
export const getAdminNotifications = async (filters = {}) => {
  const response = await api.get("/accounts/admin/notifications/", {
    params: filters,
  });
  return response.data;
};

// ADDED: Mark a single notification as read
export const markNotificationRead = async (notificationId) => {
  const response = await api.post(
    `/accounts/admin/notifications/${notificationId}/read/`
  );
  return response.data;
};