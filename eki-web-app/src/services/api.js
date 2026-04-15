import axios from "axios";

// Axios instance configured for Localhost development
const api = axios.create({
  baseURL: "http://134.122.22.45/api/v1",
  // baseURL: "http://127.0.0.1:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const publicEndpoints = [
    { url: '/accounts/register-vendor/', method: 'post' }, // ONLY POST is public
    { url: '/accounts/login/', method: 'post' },
    { url: '/accounts/verify-email/', method: 'post' },
    { url: '/accounts/resend-code/', method: 'post' },
    { url: '/accounts/password/reset/', method: 'post' },
    { url: '/accounts/password/reset/confirm/', method: 'post' },
    { url: '/accounts/token/refresh/', method: 'post' }
  ];

  const isPublicEndpoint = publicEndpoints.some(
    (endpoint) =>
      config.url?.includes(endpoint.url) &&
      config.method === endpoint.method
  );

  if (!isPublicEndpoint) {
    const token = localStorage.getItem("access_token");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
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


/*  AUTH & REGISTRATION  */

// Sign In
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

/*  VENDOR ONBOARDING & PROFILE  */

// Helper function to prepare FormData for vendor onboarding
const prepareVendorFormData = (formData, isFinalSubmission = false) => {
  const data = new FormData();

  // Process main form fields (skip documents object)
  Object.keys(formData).forEach((key) => {
    if (key !== "documents" && formData[key] !== null && formData[key] !== undefined) {
      let value = formData[key];

      // Skip incorporation_cert_expiry if it exists at root level
      if (key === "incorporation_cert_expiry") {
        return;
      }

      // Force business_category to lowercase
      if (key === "business_category") {
        value = String(value).toLowerCase();
      }

      // Ensure phone doesn't have spaces and has a +
      if (key === "business_phone" && value) {
        value = value.replace(/\s/g, "");
        if (!value.startsWith("+")) value = `+${value}`;
      }

      // Handle branch_locations - Convert array to JSON string
      if (key === "branch_locations" && Array.isArray(value) && value.length > 0) {
        data.append(key, JSON.stringify(value));
      } 
      // Only append if the value is not empty
      else if (value !== "" && value !== null && value !== undefined) {
        data.append(key, value);
      }
    }
  });

  // Process documents
  if (formData.documents) {
    const documentFields = [
      'government_issued_id',
      'government_issued_id_expiry',
      'professional_body_certification',
      'professional_body_certification_expiry',
      'business_license',
      'business_license_expiry',
      'tax_certificate',
      'tax_certificate_expiry',
      'incorporation_cert',
      'incorporation_cert_expiry'
    ];
    
    documentFields.forEach((field) => {
      const value = formData.documents[field];
      if (value instanceof File) {
        // Handle file uploads
        data.append(field, value);
      } else if (value && typeof value === 'string' && value !== "") {
        // Skip incorporation_cert_expiry for final submission if not needed
        if (field === 'incorporation_cert_expiry' && !isFinalSubmission) {
          return;
        }
        // Handle expiry dates and other string fields
        data.append(field, value);
      }
    });
  }

  return data;
};

// Save vendor profile incrementally (PATCH) - Steps 3, 4, 5
export const completeVendorOnboarding = async (formData) => {
  const data = prepareVendorFormData(formData, false);
  
  const response = await api.patch("/accounts/register-vendor/", data, {
    headers: { "Content-Type": undefined }, // Let axios set multipart boundary
  });

  return response.data;
};

// Final submission of vendor application (PUT) - Step 6, triggers UNDER_REVIEW email
export const submitVendorApplication = async (formData) => {
  const data = prepareVendorFormData(formData, true);
  
  // DEBUG: Log everything being sent
  console.log("=== SUBMITTING VENDOR APPLICATION ===");
  console.log("FormData contents:");
  for (let pair of data.entries()) {
    // Don't log file contents, just the filename
    if (pair[1] instanceof File) {
      console.log(`${pair[0]}: [FILE] ${pair[1].name} (${pair[1].size} bytes)`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
  }
  
  try {
    const response = await api.put("/accounts/register-vendor/", data, {
      headers: { "Content-Type": undefined },
    });
    console.log("SUCCESS:", response.data);
    return response.data;
  } catch (error) {
    // Log detailed error information
    console.error("=== ERROR RESPONSE ===");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error:", error.message);
    }
    throw error;
  }
};

export const logoutUser = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  localStorage.clear();
  window.location.href = "/login";

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
// Fetch the vendor's current profile data
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
    } else if (key === "branch_locations" && Array.isArray(value) && value.length > 0) {
      data.append(key, JSON.stringify(value));
    } else {
      data.append(key, value); // File objects (logo) are appended as-is
    }
  });

  const response = await api.patch("/accounts/register-vendor/", data, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

// BUSINESS SETTINGS — dedicated endpoint
// GET /api/v1/accounts/vendor/business-settings/
export const getVendorBusinessSettings = async () => {
  const response = await api.get("/accounts/vendor/business-settings/");
  return response.data.data;
};

// PATCH /api/v1/accounts/vendor/business-settings/
// Handles both text fields and file uploads (logo, documents)
export const updateVendorBusinessSettings = async (changedFields) => {
  const data = new FormData();

  Object.entries(changedFields).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;

    if (key === "business_category") {
      data.append(key, String(value).toLowerCase());
    } else if (key === "business_phone") {
      let phone = String(value).replace(/\s/g, "");
      if (!phone.startsWith("+")) phone = `+${phone}`;
      data.append(key, phone);
    } else if (key === "branch_locations" && Array.isArray(value) && value.length > 0) {
      data.append(key, JSON.stringify(value));
    } else {
      data.append(key, value); // Files (logo, docs) appended as-is
    }
  });

  const response = await api.patch("/accounts/vendor/business-settings/", data, {
    headers: { "Content-Type": undefined },
  });
  return response.data.data;
};

/*  LISTINGS & SERVICES  */

// Fetch only "service" type listings
export const getServices = async (status = '') => {
  const params = { listing_type: 'service' };
  if (status) params.status = status;
  const res = await api.get('/listings/', { params });
  const payload = res.data?.data ?? res.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
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

/*  ADMIN DASHBOARD ENDPOINTS  */

// Single call that powers the entire admin dashboard
export const getAdminDashboard = async () => {
  const response = await api.get("/accounts/admin/dashboard/");
  return response.data;
};

// Recent admin action logs — feeds the ActivityPanel
// Paginated: pass page number e.g. getAdminLogs(2)
export const getAdminLogs = async (page = 1) => {
  const response = await api.get("/accounts/admin/logs/", {
    params: { page },
  });
  return response.data;
};

// Flagged content for the moderation table
// Optional filters: status = pending | reviewing | resolved, type = listing | review | chat_message
export const getAdminModeration = async (filters = {}) => {
  const response = await api.get("/accounts/admin/moderation/", {
    params: filters,
  });
  return response.data;
};

// Platform-wide stats (total users, listings, etc.)
export const getAdminStats = async () => {
  const response = await api.get("/accounts/admin/stats/");
  return response.data;
};

// List all vendor verification applications
export const getAdminVerifications = async () => {
  const response = await api.get("/accounts/admin/verifications/");
  return response.data;
};

// Approve or reject a vendor verification
// status options: "approved" | "rejected"
// rejection_reason is required when status is rejected
export const updateVerificationStatus = async (vendorId, status, rejectionReason = "") => {
  const payload = { verification_status: status };
  if (rejectionReason) payload.rejection_reason = rejectionReason;

  const response = await api.patch(
    `/accounts/admin/verifications/${vendorId}/`,
    payload
  );
  return response.data;
};

// For suspending/terminating APPROVED vendors
// status options: "suspended" | "terminated"
export const updateVendorStatus = async (vendorId, status, reason = "") => {
  const payload = { verification_status: status };
  if (reason) payload.rejection_reason = reason;
  const response = await api.patch(`/accounts/admin/vendors/${vendorId}/status/`, payload);
  return response.data;
};

// Get admin notifications
export const getAdminNotifications = async (filters = {}) => {
  const response = await api.get("/accounts/admin/notifications/", {
    params: filters,
  });
  return response.data;
};

// Mark a single notification as read
export const markNotificationRead = async (notificationId) => {
  const response = await api.post(
    `/accounts/admin/notifications/${notificationId}/read/`
  );
  return response.data;
};