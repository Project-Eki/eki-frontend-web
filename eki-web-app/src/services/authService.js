import axios from 'axios';

const api = axios.create({
  baseURL: 'http://134.122.22.45/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ─── PUBLIC ROUTES (no token attached) ───────────────────────────────────────
const PUBLIC_ROUTES = [
  '/accounts/login/',
  '/accounts/reset-password/',
  '/accounts/verify-email/',
  '/accounts/resend-code/',
  '/accounts/confirm-password-reset/',
  '/accounts/register-buyer/',
  '/accounts/register-vendor/',
  '/accounts/token-refresh/',
];

// ─── TOKEN REFRESH STATE ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const isPublic = PUBLIC_ROUTES.some((route) => config.url?.includes(route));
    if (!isPublic) {
      const token = localStorage.getItem('access_token');
      if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // ── Detailed 400 logging ──────────────────────────────────────────────────
    if (status === 400) {
      console.error('━━ 400 Bad Request ━━━━━━━━━━━━━━━━━━━');
      console.error('URL    :', error.config?.url);
      try { console.error('Sent   :', JSON.parse(error.config?.data)); }
      catch (_) { console.error('Sent   :', error.config?.data); }
      console.error('Django :', error.response?.data);
      const errs = error.response?.data?.errors ?? error.response?.data;
      if (errs && typeof errs === 'object') {
        Object.entries(errs).forEach(([f, m]) =>
          console.error(`  ✗ ${f}:`, Array.isArray(m) ? m.join(', ') : m)
        );
      }
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    // ── Auto token refresh on 401 ─────────────────────────────────────────────
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        localStorage.clear();
        if (!window.location.pathname.includes('sign-in')) {
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          'http://134.122.22.45/api/v1/accounts/token-refresh/',
          { refresh: refreshToken }
        );
        const newAccess = res.data?.access || res.data?.data?.access;
        localStorage.setItem('access_token', newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.clear();
        if (!window.location.pathname.includes('sign-in')) {
          window.location.href = '/sign-in';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────
export const SigninUser = async (credentials) => {
  const response = await api.post('/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  });
  const data = response.data?.data ?? response.data;
  saveTokens({ access: data?.access, refresh: data?.refresh });

  // ── Cache profile fields at login so pages can fall back to them ──────────
  if (data?.first_name) localStorage.setItem('vendor_first_name', data.first_name);
  if (data?.last_name) localStorage.setItem('vendor_last_name', data.last_name);
  if (data?.email) localStorage.setItem('vendor_email', data.email);
  if (data?.role) localStorage.setItem('vendor_role', data.role);
  if (data?.phone_number) localStorage.setItem('vendor_phone_number', data.phone_number);

  return response.data;
};

export const SignoutUser = () => {
  localStorage.clear();
  window.location.href = '/sign-in';
};

export const verifyOtp = (data) =>
  api.post('/accounts/verify-email/', data).then((r) => r.data);

export const resendOtp = (email) =>
  api.post('/accounts/resend-code/', { email }).then((r) => r.data);

// ─── BUYER PROFILE ────────────────────────────────────────────────────────────
export const getBuyerProfile = () =>
  api.get('/accounts/buyer/profile/').then((r) => r.data?.data ?? r.data);

export const updateBuyerProfile = (data) =>
  api.patch('/accounts/buyer/profile/', data).then((r) => r.data?.data ?? r.data);

// ─── VENDOR PROFILE ───────────────────────────────────────────────────────────
let _profileCache = null;
let _profileFetching = null;

export const clearProfileCache = () => {
  _profileCache = null;
};

export const getVendorProfile = async () => {
  if (_profileCache) {
    console.log('[getVendorProfile] Using cached profile');
    return _profileCache;
  }
  if (_profileFetching) {
    console.log('[getVendorProfile] Waiting for existing request');
    return _profileFetching;
  }

  _profileFetching = (async () => {
    try {
      console.log('[getVendorProfile] Fetching from API...');
      const r = await api.get('/accounts/vendor/profile/');
      const data = r.data?.data ?? r.data;

      console.log('[getVendorProfile] API Response:', data);

      // Cache fresh values in localStorage
      if (data?.first_name) localStorage.setItem('vendor_first_name', data.first_name);
      if (data?.last_name) localStorage.setItem('vendor_last_name', data.last_name);
      if (data?.email) localStorage.setItem('vendor_email', data.email);
      if (data?.profile_picture) localStorage.setItem('vendor_profile_picture', data.profile_picture);
      if (data?.phone_number) localStorage.setItem('vendor_phone_number', data.phone_number);
      // ── Cache country so dashboard can read it even on fallback ────────────
      if (data?.business_country) localStorage.setItem('vendor_country', data.business_country);
      else if (data?.country) localStorage.setItem('vendor_country', data.country);

      _profileCache = data;
      return data;
    } catch (err) {
      const status = err.response?.status;
      const responseData = err.response?.data;

      console.error('[getVendorProfile] Error details:', {
        status,
        data: responseData,
        message: err.message,
      });

      // 500 / 404 = endpoint not ready — serve localStorage cache silently
      if (status === 500 || status === 404) {
        console.warn('[getVendorProfile] Backend returned', status, '— using localStorage fallback');

        const fallback = {
          first_name: localStorage.getItem('vendor_first_name') || '',
          last_name: localStorage.getItem('vendor_last_name') || '',
          email: localStorage.getItem('vendor_email') || '',
          profile_picture: localStorage.getItem('vendor_profile_picture') || null,
          phone_number: localStorage.getItem('vendor_phone_number') || '',
          // Restore cached country so currency still works on fallback
          business_country: localStorage.getItem('vendor_country') || 'Uganda',
        };

        console.log('[getVendorProfile] Fallback data:', fallback);
        _profileCache = fallback;
        return fallback;
      }

      throw err;
    } finally {
      _profileFetching = null;
    }
  })();

  return _profileFetching;
};

export const updateVendorProfile = async (changedFields) => {
  const formData = new FormData();

  Object.keys(changedFields).forEach((key) => {
    const value = changedFields[key];
    if (value === null || value === undefined || value === '') return;

    // Map business_phone to phone_number for backend
    if (key === 'business_phone') {
      let phone = String(value).replace(/\s/g, '');
      if (!phone.startsWith('+')) phone = `+${phone}`;
      formData.append('phone_number', phone);
    }
    // Handle profile picture correctly
    else if (key === 'profile_picture' && value instanceof File) {
      formData.append('profile_picture', value);
    }
    // Handle other fields
    else {
      formData.append(key, value);
    }
  });

  console.log('[updateVendorProfile] Sending:', {
    fields: Array.from(formData.entries()).map(([k, v]) =>
      `${k}: ${v instanceof File ? `File(${v.name})` : v}`
    ),
  });

  try {
    const res = await api.patch('/accounts/vendor/profile/', formData, {
      headers: { 'Content-Type': undefined },
    });

    clearProfileCache();

    const responseData = res.data?.data ?? res.data;
    if (responseData) {
      if (responseData.first_name) localStorage.setItem('vendor_first_name', responseData.first_name);
      if (responseData.last_name) localStorage.setItem('vendor_last_name', responseData.last_name);
      if (responseData.email) localStorage.setItem('vendor_email', responseData.email);
      if (responseData.profile_picture) localStorage.setItem('vendor_profile_picture', responseData.profile_picture);
      if (responseData.phone_number) localStorage.setItem('vendor_phone_number', responseData.phone_number);
      // Keep cached country in sync after profile update
      if (responseData.business_country) localStorage.setItem('vendor_country', responseData.business_country);
      else if (responseData.country) localStorage.setItem('vendor_country', responseData.country);
    }

    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('[updateVendorProfile] Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

// ─── VENDOR NOTIFICATIONS ─────────────────────────────────────────────────────
const NOTIFICATIONS_ENDPOINT_READY = false;

export const getVendorNotifications = async ({ limit = 15 } = {}) => {
  if (!NOTIFICATIONS_ENDPOINT_READY) return { notifications: [] };

  try {
    const r = await api.get(`/accounts/vendor/notifications/?limit=${limit}`);
    const payload = r.data?.data ?? r.data;
    if (Array.isArray(payload)) return { notifications: payload };
    if (Array.isArray(payload?.notifications)) return payload;
    if (Array.isArray(payload?.results)) return { notifications: payload.results };
    return { notifications: [] };
  } catch (err) {
    const status = err.response?.status;
    if (status === 404 || status === 500) return { notifications: [] };
    throw err;
  }
};

export const markVendorNotificationRead = async (notifId) => {
  if (!NOTIFICATIONS_ENDPOINT_READY) return null;
  try {
    const r = await api.patch(`/accounts/vendor/notifications/${notifId}/`, { is_read: true });
    return r.data?.data ?? r.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500) return null;
    throw err;
  }
};

export const markAllVendorNotificationsRead = async () => {
  if (!NOTIFICATIONS_ENDPOINT_READY) return null;
  try {
    const r = await api.post('/accounts/vendor/notifications/mark-read/', { mark_all: true });
    return r.data?.data ?? r.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500) return null;
    throw err;
  }
};

// VENDOR DASHBOARD
export const getVendorDashboard = async () => {
  let raw = {};

  try {
    const dashRes = await api.get('/accounts/vendor/command-center/');
    raw = dashRes.data?.data ?? dashRes.data ?? {};
  } catch (dashErr) {
    console.error(
      '[getVendorDashboard] Dashboard endpoint failed:',
      dashErr.response?.status,
      dashErr.response?.data ?? dashErr.message
    );
  }

  let country = 'Uganda';
  let storeName = '';
  let vendorType = 'Products';
  let businessCategory = 'retail';

  try {
    const p = await getVendorProfile();
    // ── FIX: API returns business_country, not country ──────────────────────
    country = p.business_country || p.country || localStorage.getItem('vendor_country') || 'Uganda';
    storeName = p.business_name || '';
    vendorType = p.business_type || 'Products';
    businessCategory = p.business_category || 'retail';
  } catch (_) {}

  // Use raw.metrics directly
  const metricsData = raw.metrics || {};

  // Use raw.salesHistory directly
  const salesHistoryData = raw.salesHistory || [];

  // Use raw.recentOrders directly
  const recentOrdersData = raw.recentOrders || [];

  // Use raw.inventoryAlerts directly
  const inventoryAlertsData = raw.inventoryAlerts || [];

  // Use raw.reviews directly
  const reviewsData = raw.reviews || [];

  return {
    storeName,
    vendorType,
    country,
    businessCategory,

    metrics: {
      grossSales: Number(metricsData.grossSales ?? 0),
      openOrders: Number(metricsData.openOrders ?? 0),
      pendingPayouts: Number(metricsData.pendingPayouts ?? 0),
      activeListings: Number(metricsData.activeListings ?? 0),
    },

    salesHistory: salesHistoryData.map((item) => ({
      date: item.date,
      sales: Number(item.sales ?? 0),
    })),

    recentOrders: recentOrdersData.map((o) => ({
      id: o.id,
      customer: o.customer,
      total: Number(o.total ?? 0),
      status: o.status,
    })),

    inventoryAlerts: inventoryAlertsData.map((a) => ({
      title: a.title,
      quantity: a.current_stock ?? 0,
    })),

    reviews: reviewsData.map((r) => ({
      reviewer: r.reviewer,
      rating: r.rating,
      comment: r.comment,
    })),
  };
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const getCategories = (businessCategory = null) => {
  const params = businessCategory ? `?business_category=${businessCategory}` : '';
  return api
    .get(`/listings/categories/${params}`)
    .then((r) => {
      const payload = r.data?.data ?? r.data;
      return Array.isArray(payload) ? payload : [];
    });
};

const normalizeListing = (item) => ({
  ...item,
  is_published: item.is_published === true || item.status === 'published',
});

export const getProducts = async () => {
  const res = await api.get('/listings/');
  const payload = res.data?.data ?? res.data;
  if (Array.isArray(payload)) return payload.map(normalizeListing);
  if (Array.isArray(payload?.results)) return payload.results.map(normalizeListing);
  return [];
};

export const createProductListing = async (productData) => {
  const qualityMap = {
    High: 'high', Medium: 'medium', Low: 'low',
    high: 'high', medium: 'medium', low: 'low',
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  };

  let variants = [];

  if (Array.isArray(productData.variants) && productData.variants.length > 0) {
    productData.variants.forEach((v) => {
      if (!v.value?.trim()) return;
      if (v.type === 'Size') variants.push({ color: '', size: v.value.trim(), stock: 0 });
      if (v.type === 'Color') variants.push({ color: v.value.trim(), size: '', stock: 0 });
    });
  }

  const sizes = Array.isArray(productData.sizes) ? productData.sizes.filter(Boolean) : [];
  const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];

  if (variants.length === 0 && (sizes.length > 0 || colors.length > 0)) {
    if (sizes.length > 0 && colors.length > 0) {
      sizes.forEach((size) => colors.forEach((color) => variants.push({ color, size, stock: 0 })));
    } else if (sizes.length > 0) {
      sizes.forEach((size) => variants.push({ color: '', size, stock: 0 }));
    } else {
      colors.forEach((color) => variants.push({ color, size: '', stock: 0 }));
    }
  }

  if (variants.length === 0) variants.push({ color: 'Default', size: '', stock: 0 });

  const payload = {
    business_category: productData.business_category,
    title: productData.title?.trim(),
    description: productData.description?.trim() || '',
    status: productData.is_published ? 'published' : 'draft',
    availability: 'available',
    price: String(parseFloat(productData.price)),
    price_unit: 'item',
    location: productData.location?.trim() || '',
    detail: {
      sku: productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      quality: qualityMap[productData.qty] ?? 'medium',
      variants,
    },
  };

  if (productData.category_id) payload.category_id = productData.category_id;

  console.log('[listings] POST /listings/ →', JSON.stringify(payload, null, 2));
  const res = await api.post('/listings/', payload);
  return normalizeListing(res.data?.data ?? res.data);
};

export const updateProductListing = async (listingId, productData) => {
  const qualityMap = {
    High: 'high', Medium: 'medium', Low: 'low',
    high: 'high', medium: 'medium', low: 'low',
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  };

  const payload = {
    title: productData.title?.trim(),
    description: productData.description?.trim() || '',
    status: productData.is_published ? 'published' : 'draft',
    price: String(parseFloat(productData.price)),
    price_unit: 'item',
    location: productData.location?.trim() || '',
    detail: {
      sku: productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      quality: qualityMap[productData.qty] ?? 'medium',
    },
  };

  if (productData.category_id) payload.category_id = productData.category_id;

  console.log('[listings] PATCH /listings/', listingId, '→', JSON.stringify(payload, null, 2));
  const res = await api.patch(`/listings/${listingId}/`, payload);
  return normalizeListing(res.data?.data ?? res.data);
};

export const deleteProductListing = (listingId) =>
  api.delete(`/listings/${listingId}/`).then((r) => r.data);

export const updateListingStatus = (listingId, newStatus) =>
  api.patch(`/listings/${listingId}/status/`, { status: newStatus })
    .then((r) => r.data?.data ?? r.data);

export const uploadListingImage = (listingId, imageFile) => {
  const form = new FormData();
  form.append('image', imageFile);
  return api
    .post(`/listings/${listingId}/images/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data?.data ?? r.data);
};

export const uploadListingImages = async (listingId, imageFiles) => {
  const results = [];
  for (const file of imageFiles) {
    results.push(await uploadListingImage(listingId, file));
  }
  return results;
};

export const deleteListingImage = (listingId, imageId) =>
  api.delete(`/listings/${listingId}/images/${imageId}/`).then((r) => r.data);

export const updateProductVariant = (listingId, variantId, data) =>
  api.patch(`/listings/${listingId}/variants/${variantId}/`, data)
    .then((r) => r.data?.data ?? r.data);

export const deleteProductVariant = (listingId, variantId) =>
  api.delete(`/listings/${listingId}/variants/${variantId}/`).then((r) => r.data);

// ─── PASSWORDS ────────────────────────────────────────────────────────────────
export const passwordResetRequest = (email) =>
  api.post('/accounts/reset-password/', { email });

export const passwordResetConfirm = (data) =>
  api.post('/accounts/confirm-password-reset/', data);

export const changePassword = (data) =>
  api.post('/accounts/change-password/', data);

export default api;