import axios from "axios";

// Automatic
const isProduction = window.location.hostname !== 'localhost' &&
                     window.location.hostname !== '127.0.0.1';

const baseURL = isProduction
  ? '/api/v1'                        // on joineki.com.relative, HTTPS-safe
  : 'http://127.0.0.1:8000/api/v1'; // on  my machine, hits Django directly

const api = axios.create({
  baseURL: baseURL,
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

      // REASON: incorporation_cert_expiry should never be sent - it doesn't expire
      if (key === "incorporation_cert_expiry") {
        return; // Skip this field entirely
      }

      // Handle business_category - don't stringify arrays
      if (key === "business_category") {
        if (Array.isArray(value)) {
          // For FormData, we need to send as JSON string because FormData doesn't support nested arrays
          // But for the PATCH request we're using JSON, not FormData
          data.append(key, JSON.stringify(value));
        } else {
          data.append(key, String(value).toLowerCase());
        }
        return;
      }

      // Ensure phone doesn't have spaces and has a +
      if (key === "business_phone" && value) {
        value = value.replace(/\s/g, "");
        if (!value.startsWith("+")) value = `+${value}`;
      }

      // Handle branch_locations - ONLY send if it has actual data
      if (key === "branch_locations") {
        if (Array.isArray(value)) {
          const validBranches = value.filter(branch => 
            branch && (
              branch.address?.trim() || 
              branch.city?.trim() || 
              branch.phone?.trim()
            )
          );
          
          if (validBranches.length > 0) {
            data.append(key, JSON.stringify(validBranches));
          }
        }
        return;
      }

      // Only append if the value is not empty
      if (value !== "" && value !== null && value !== undefined) {
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
      // REASON: Remove 'incorporation_cert_expiry' from this list
      // 'incorporation_cert_expiry', // <- DON'T include this
    ];
    
    documentFields.forEach((field) => {
      const value = formData.documents[field];
      if (value instanceof File) {
        // Handle file uploads
        data.append(field, value);
      } else if (value && typeof value === 'string' && value !== "") {
        // Handle expiry dates and other string fields
        data.append(field, value);
      }
    });
  }

  return data;
};



export const completeVendorOnboarding = async (formData) => {
  // Get the business category value
  let businessCategoryValue = formData.business_category;
  
  // If it's an array, send as JSON string (FormData doesn't support arrays)
  if (Array.isArray(businessCategoryValue)) {
    console.log("Sending array as JSON string:", businessCategoryValue);
    businessCategoryValue = JSON.stringify(businessCategoryValue);
  } else if (typeof businessCategoryValue === 'string') {
    businessCategoryValue = businessCategoryValue.toLowerCase();
  }
  // // If it's an array, keep it as array (don't convert)
  // // If it's a string, handle appropriately
  // if (Array.isArray(businessCategoryValue)) {
  //   // Keep as array - it will be JSON.stringify'd by axios automatically
  //   console.log("Sending array:", businessCategoryValue);
  // } else if (typeof businessCategoryValue === 'string') {
  //   // Check if it's a stringified array
  //   if (businessCategoryValue.startsWith('[') && businessCategoryValue.endsWith(']')) {
  //     try {
  //       businessCategoryValue = JSON.parse(businessCategoryValue);
  //       console.log("Parsed string to array:", businessCategoryValue);
  //     } catch (e) {
  //       businessCategoryValue = businessCategoryValue.toLowerCase();
  //     }
  //   } else {
  //     businessCategoryValue = businessCategoryValue.toLowerCase();
  //   }
  // }
  
  const textPayload = {
    business_name: formData.business_name,
    business_type: formData.business_type,
    business_category: businessCategoryValue,  // Use the processed value
    owner_full_name: formData.owner_full_name,
    registration_number: formData.registration_number,
    tax_id: formData.tax_id,
    business_description: formData.business_description,
    business_phone: formData.business_phone,
    address: formData.address,
    city: formData.city,
    country: formData.country,
    landmark: formData.landmark,
    opening_time: formData.opening_time,
    closing_time: formData.closing_time,
  };

  // Remove null/undefined/empty
  Object.keys(textPayload).forEach(k => {
    if (!textPayload[k]) delete textPayload[k];
  });

  const textResponse = await api.patch("/accounts/register-vendor/", textPayload, {
    headers: { "Content-Type": "application/json" },
  });
  console.log("Text fields save response:", textResponse.data);

  // Second: send documents as FormData
  const docData = new FormData();
  const docFields = [
    'government_issued_id', 'business_license',
    'tax_certificate', 'incorporation_cert',
    'professional_body_certification'
  ];
  
  docFields.forEach(field => {
    const file = formData.documents?.[field];
    if (file instanceof File) docData.append(field, file, file.name);
  });

  const expiryFields = [
    'government_issued_id_expiry', 'business_license_expiry',
    'tax_certificate_expiry', 'professional_body_certification_expiry'
  ];
  expiryFields.forEach(field => {
    const val = formData.documents?.[field];
    if (val) docData.append(field, val);
  });

  const docResponse = await api.patch("/accounts/register-vendor/", docData, {
    headers: { "Content-Type": undefined },
  });
  console.log("Documents save response:", docResponse.data);

  return docResponse.data;
};

// Final submission of vendor application (PUT) - Step 6
export const submitVendorApplication = async (formData) => {
  const data = prepareVendorFormData(formData, true);
  
  // Use register-vendor endpoint for PUT
  const response = await api.put("/accounts/register-vendor/", data, {
    headers: { "Content-Type": undefined },
  });
  return response.data;
};

// Get vendor profile - USE THE CORRECT ENDPOINT
// export const getVendorProfile = async () => {
//   // Try register-vendor endpoint first (GET returns the profile)
//   const response = await api.get("/accounts/register-vendor/");
//   return response.data.data; 
// };

// Alternative: Use the dedicated vendor/profile endpoint
export const getVendorProfileAlt = async () => {
  const response = await api.get("/accounts/vendor/profile/");
  return response.data.data;
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



/*  PAYMENTS & TRANSACTIONS  */

// Get payment transactions with filters and pagination
export const getPaymentTransactions = async (filters = {}) => {
  const {
    status = '',
    date_from = '',
    date_to = '',
    reference = '',
    order_reference = '',
    customer_email = '',
    limit = 50,
    offset = 0
  } = filters;

  const params = {};
  if (status) params.status = status;
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  if (reference) params.reference = reference;
  if (order_reference) params.order_reference = order_reference;
  if (customer_email) params.customer_email = customer_email;
  params.limit = limit;
  params.offset = offset;

  const response = await api.get("/payments/payments/", { params });
  return response.data;
};

// Get transaction summary for dashboard
export const getTransactionSummary = async (days = 30) => {
  const response = await api.get("/payments/summary/", { params: { days } });
  return response.data;
};

// Get wallet transactions (admin only)
export const getWalletTransactions = async (filters = {}) => {
  const {
    type = '',
    vendor_id = '',
    date_from = '',
    date_to = '',
    limit = 50,
    offset = 0
  } = filters;

  const params = {};
  if (type) params.type = type;
  if (vendor_id) params.vendor_id = vendor_id;
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  params.limit = limit;
  params.offset = offset;

  const response = await api.get("/payments/wallet-transactions/", { params });
  return response.data;
};

// Get withdrawal requests (admin only)
export const getWithdrawalRequests = async (filters = {}) => {
  const {
    status = '',
    vendor_id = '',
    date_from = '',
    date_to = '',
    limit = 50,
    offset = 0
  } = filters;

  const params = {};
  if (status) params.status = status;
  if (vendor_id) params.vendor_id = vendor_id;
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  params.limit = limit;
  params.offset = offset;

  const response = await api.get("/payments/withdrawals/", { params });
  return response.data;
};

// Process withdrawal (approve/reject)
export const processWithdrawal = async (withdrawalId, action, rejectionReason = "") => {
  const response = await api.post(`/payments/withdrawals/${withdrawalId}/process/`, {
    action,
    rejection_reason: rejectionReason
  });
  return response.data;
};


// ============================================
// PRIVACY SETTINGS API FUNCTIONS
// ============================================

// 1. GET /api/v1/accounts/privacy-settings/ - Fetch all settings on page load
export const getPrivacySettings = async () => {
  const response = await api.get('/accounts/privacy-settings/');
  return response.data;
};

// 2. PATCH /api/v1/accounts/privacy-settings/ - Update individual settings (for toggles)
export const updatePrivacySettings = async (settings) => {
  const response = await api.patch('/accounts/privacy-settings/', settings);
  return response.data;
};

// 3. POST /api/v1/accounts/accept-terms/ - Accept Terms of Service
export const acceptTerms = async (termsVersion) => {
  const response = await api.post('/accounts/accept-terms/', {
    terms_version: termsVersion,
    accepted: true
  });
  return response.data;
};

// 4. POST /api/v1/accounts/accept-data-processing/ - Accept Data Processing Agreement
export const acceptDataProcessing = async (agreementVersion) => {
  const response = await api.post('/accounts/accept-data-processing/', {
    agreement_version: agreementVersion,
    accepted: true
  });
  return response.data;
};

// 5. GET /api/v1/accounts/export-data/ - Export user data (GDPR)
export const exportUserData = async () => {
  const response = await api.get('/accounts/export-data/', {
    responseType: 'blob' // For file download
  });
  return response.data;
};

// 6. DELETE /api/v1/accounts/delete-data/ - Request account deletion (GDPR)
export const deleteUserData = async () => {
  const response = await api.delete('/accounts/delete-data/');
  return response.data;
};

// 7. POST /api/v1/accounts/withdraw-consent/ - Withdraw specific consents
export const withdrawConsent = async (consentTypes) => {
  const response = await api.post('/accounts/withdraw-consent/', consentTypes);
  return response.data;
};
