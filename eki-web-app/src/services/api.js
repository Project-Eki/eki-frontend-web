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
 * Sign In — CustomTokenObtainPairSerializer
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
 * Register new vendor — RegisterSerializer
 * POST /accounts/register/vendor/
 * FIX: Lowercase 'vendor' and trailing slash added to match backend requirements.
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
 * Request password reset OTP
 */
export const passwordResetRequest = async ({ email }) => {
  const response = await api.post('/accounts/password-reset/', { email });
  return response.data;
};

/**
 * Confirm password reset
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
 * Change password (authenticated)
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
 * Google OAuth sign-in
 */
export const googleAuth = async ({ access_token, requested_role = 'vendor' }) => {
  const response = await api.post('/accounts/google-auth/', {
    access_token,
    requested_role,
  });
  return response.data;
};

/**
 * Logout
 */
export const logoutUser = async () => {
  const refresh_token = localStorage.getItem('refresh_token');
  const response = await api.post('/accounts/logout/', { refresh_token });
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  return response.data;
};

/**
 * Validate current session
 */
export const validateSession = async () => {
  const response = await api.get('/accounts/session/');
  return response.data;
};

// ─── Profile & Vendor Details ────────────────────────────────────────────────

export const updateProfile = async (profileData) => {
  const response = await api.patch('/accounts/profile/', profileData);
  return response.data;
};

export const submitBusinessIdentity = async (data) => {
  const response = await api.post('/vendors/profile/', data);
  return response.data;
};

export const submitContactLocation = async (data) => {
  const response = await api.patch('/vendors/profile/', data);
  return response.data;
};

export const submitOperatingHours = async (data) => {
  const response = await api.patch('/vendors/profile/', data);
  return response.data;
};

export const uploadVendorDocument = async ({ document_type, document_file }) => {
  const payload = new FormData();
  payload.append('document_type', document_type);
  payload.append('document_file', document_file);
  const response = await api.post('/vendors/documents/', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const submitOperationCompliance = async ({
  opening_time,
  closing_time,
  documents,
}) => {
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

export const getVendorProfile = async () => {
  const response = await api.get('/vendors/profile/');
  return response.data;
};