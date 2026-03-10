import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api-7w8f.onrender.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor: Attach JWT access token ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Auto-refresh access token on 401 ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(
            'https://api-7w8f.onrender.com/api/v1/accounts/token/refresh/',
            { refresh }
          );
          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * Login — CustomTokenObtainPairSerializer
 * POST /accounts/token/
 */
export const loginUser = async ({ email, password }) => {
  const response = await api.post('/accounts/token/', { email, password });
  return response.data;
};

/**
 * Refresh access token — TokenRefreshSerializer
 * POST /accounts/token/refresh/
 */
export const refreshToken = async ({ refresh }) => {
  const response = await api.post('/accounts/token/refresh/', { refresh });
  return response.data;
};

/**
 * Register new user — RegisterSerializer
 * POST /accounts/register/
 * Fields: first_name, last_name, email, password, confirm_password, accepted_terms, role
 */
export const registerVendor = async ({
  first_name,
  last_name,
  email,
  password,
  confirm_password,
  accepted_terms = true,
}) => {
  const payload = {
    first_name,
    last_name,
    email,
    password,
    accepted_terms,
  };
  // Support both confirm_password and password2 field names
  if (confirm_password !== undefined) payload.confirm_password = confirm_password;

  const response = await api.post('/accounts/register/vendor/', payload);
  return response.data;
};

/**
 * Verify OTP — VerifyOTPSerializer
 * POST /accounts/verify-otp/
 * Fields: email, otp_code, otp_type (default: email_verification)
 */
export const verifyEmail = async ({
  email,
  otp_code,
  otp_type = 'email_verification',
}) => {
  const response = await api.post('/accounts/verify-email/', {
    email,
    otp_code,
    otp_type,
  });
  return response.data;
};

/**
 * Resend OTP — ResendOTPSerializer
 * POST /accounts/resend-otp/
 * Fields: email, otp_type (default: email_verification)
 */
export const resendOtp = async ({
  email,
  otp_type = 'email_verification',
}) => {
  const response = await api.post('/accounts/resend-otp/', {
    email,
    otp_type,
  });
  return response.data;
};

/**
 * Request password reset OTP — PasswordResetRequestSerializer
 * POST /accounts/password-reset/
 * Fields: email
 */
export const passwordResetRequest = async ({ email }) => {
  const response = await api.post('/accounts/password-reset/', { email });
  return response.data;
};

/**
 * Confirm password reset — PasswordResetConfirmSerializer
 * POST /accounts/password-reset/confirm/
 * Fields: email, otp_code, new_password, confirm_password
 */
export const passwordResetConfirm = async ({
  email,
  otp_code,
  new_password,
  confirm_password,
}) => {
  const response = await api.post('/accounts/password-reset/confirm/', {
    email,
    otp_code,
    new_password,
    confirm_password,
  });
  return response.data;
};

/**
 * Change password (authenticated) — ChangePasswordSerializer
 * POST /accounts/change-password/
 * Fields: current_password, new_password, confirm_password
 */
export const changePassword = async ({
  current_password,
  new_password,
  confirm_password,
}) => {
  const response = await api.post('/accounts/change-password/', {
    current_password,
    new_password,
    confirm_password,
  });
  return response.data;
};

/**
 * Google OAuth sign-in — GoogleAuthSerializer
 * POST /accounts/google-auth/
 * Fields: access_token, requested_role (default: buyer)
 */
export const googleAuth = async ({ access_token, requested_role = 'buyer' }) => {
  const response = await api.post('/accounts/google-auth/', {
    access_token,
    requested_role,
  });
  return response.data;
};

/**
 * Logout — LogoutSerializer
 * POST /accounts/logout/
 * Fields: refresh_token
 */
export const logoutUser = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  const response = await api.post('/accounts/logout/', { refresh_token });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return response.data;
};

/**
 * Validate current session — SessionValidateSerializer
 * GET /accounts/session/
 */
export const validateSession = async () => {
  const response = await api.get('/accounts/session/');
  return response.data;
};

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * Update user profile — UpdateProfileSerializer
 * PATCH /accounts/profile/
 * Fields: first_name, last_name, phone_number, profile_picture, profile (nested)
 */
export const updateProfile = async (profileData) => {
  const response = await api.patch('/accounts/profile/', profileData);
  return response.data;
};

// ─── Vendor Onboarding ───────────────────────────────────────────────────────

/**
 * Register vendor profile — VendorRegistrationSerializer
 * POST /vendors/profile/
 * Fields: business_name, owner_full_name, business_email, business_phone,
 *         business_type, business_description, address, city, country,
 *         registration_number, tax_id
 */
export const submitBusinessIdentity = async ({
  business_name,
  business_type,
  owner_full_name,
  tax_id,
  registration_number,
  business_description,
}) => {
  const response = await api.post('/vendors/profile/', {
    business_name,
    business_type,
    owner_full_name,
    tax_id,
    registration_number,
    business_description,
  });
  return response.data;
};

/**
 * Update vendor contact & location — VendorRegistrationSerializer (partial)
 * PATCH /vendors/profile/
 * Fields: business_email, business_phone, address, city, country
 */
export const submitContactLocation = async ({
  business_email,
  business_phone,
  address,
  city,
  country,
}) => {
  const response = await api.patch('/vendors/profile/', {
    business_email,
    business_phone,
    address,
    city,
    country,
  });
  return response.data;
};

/**
 * Update operating hours — VendorRegistrationSerializer (partial)
 * PATCH /vendors/profile/
 * Fields: opening_time, closing_time
 */
export const submitOperatingHours = async ({ opening_time, closing_time }) => {
  const response = await api.patch('/vendors/profile/', {
    opening_time,
    closing_time,
  });
  return response.data;
};

/**
 * Upload a single vendor compliance document — VendorDocumentUploadSerializer
 * POST /vendors/documents/
 * Fields: document_type, document_file
 */
export const uploadVendorDocument = async ({ document_type, document_file }) => {
  const payload = new FormData();
  payload.append('document_type', document_type);
  payload.append('document_file', document_file);
  const response = await api.post('/vendors/documents/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Submit operating hours + compliance documents  (convenience wrapper)
 * Uploads documents individually then patches operating hours.
 */
export const submitOperationCompliance = async ({
  opening_time,
  closing_time,
  documents,
}) => {
  // Upload each document type if provided
  const docTypeMap = {
    incorporation_cert: 'incorporation_certificate',
    national_id: 'national_id',
    business_license: 'business_license',
    tax_certificate: 'tax_certificate',
  };

  const uploadPromises = Object.entries(docTypeMap)
    .filter(([key]) => documents[key])
    .map(([key, document_type]) =>
      uploadVendorDocument({ document_type, document_file: documents[key] })
    );

  await Promise.all(uploadPromises);

  return submitOperatingHours({ opening_time, closing_time });
};

/**
 * Get vendor profile
 * GET /vendors/profile/
 */
export const getVendorProfile = async () => {
  const response = await api.get('/vendors/profile/');
  return response.data;
};
