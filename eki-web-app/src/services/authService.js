import axios from 'axios';

const api = axios.create({
  baseURL: 'http://134.122.22.45',
  headers: { 'Content-Type': 'application/json' },
});

// ─── PUBLIC ROUTES (no token attached) ───────────────────────────────────────
const PUBLIC_ROUTES = [
  '/api/v1/accounts/login/',
  '/api/v1/accounts/reset-password/',
  '/api/v1/accounts/verify-email/',
  '/api/v1/accounts/resend-code/',
  '/api/v1/accounts/confirm-password-reset/',
  '/api/v1/accounts/register-buyer/',
  '/api/v1/accounts/register-vendor/',
  '/api/v1/accounts/token-refresh/',
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
  if (access)  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────
export const SigninUser = async (credentials) => {
  const response = await api.post('/api/v1/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  });
  const data = response.data?.data ?? response.data;
  saveTokens({ access: data?.access, refresh: data?.refresh });
  return response.data;
};

export const SignoutUser = () => {
  localStorage.clear();
  window.location.href = '/sign-in';
};

export const verifyOtp = (data) =>
  api.post('/api/v1/accounts/verify-email/', data).then((r) => r.data);

export const resendOtp = (email) =>
  api.post('/api/v1/accounts/resend-code/', { email }).then((r) => r.data);

// ─── BUYER PROFILE ────────────────────────────────────────────────────────────
export const getBuyerProfile = () =>
  api.get('/api/v1/accounts/buyer/profile/').then((r) => r.data?.data ?? r.data);

export const updateBuyerProfile = (data) =>
  api.patch('/api/v1/accounts/buyer/profile/', data).then((r) => r.data?.data ?? r.data);

// ─── VENDOR PROFILE ───────────────────────────────────────────────────────────
export const getVendorProfile = () =>
  api.get('/api/v1/accounts/vendor/profile/').then((r) => r.data?.data ?? r.data);

export const updateVendorProfile = (data) =>
  api.patch('/api/v1/accounts/vendor/profile/', data).then((r) => r.data?.data ?? r.data);

// ─── VENDOR DASHBOARD ─────────────────────────────────────────────────────────
export const getVendorDashboard = async () => {
  const dashRes = await api.get('/api/v1/accounts/vendor/dashboard/');
  const raw = dashRes.data?.data ?? dashRes.data ?? {};
  const summary = raw.summary ?? {};

  let country          = 'Uganda';
  let storeName        = '';
  let vendorType       = 'Products';
  let businessCategory = 'retail';

  try {
    const profileRes = await api.get('/api/v1/accounts/vendor/profile/');
    const p = profileRes.data?.data ?? profileRes.data ?? {};
    country          = p.country           || 'Uganda';
    storeName        = p.business_name     || '';
    vendorType       = p.business_type     || 'Products';
    businessCategory = p.business_category || 'retail';
  } catch (_) {
    // non-fatal
  }

  return {
    storeName,
    vendorType,
    country,
    businessCategory,

    metrics: {
      grossSales:     Number(summary.gross_sales     ?? 0),
      openOrders:     Number(summary.open_orders     ?? 0),
      pendingPayouts: Number(summary.pending_payout  ?? 0),
      activeListings: Number(summary.active_listings ?? 0),
    },

    salesHistory: (raw.sales_performance?.trend ?? []).map((p) => ({
      date:  p.period,
      sales: Number(p.revenue ?? 0),
    })),

    recentOrders: (raw.recent_orders ?? []).map((o) => ({
      id:       o.order_id,
      customer: o.customer,
      total:    Number(o.total ?? 0),
      status:   o.status,
    })),

    inventoryAlerts: (raw.inventory_alerts ?? []).map((a) => ({
      title:    a.name,
      quantity: a.stock,
    })),

    reviews: (raw.recent_reviews ?? []).map((r) => ({
      reviewer: r.reviewer,
      rating:   r.rating,
      comment:  r.comment,
    })),
  };
};

// ─── CATEGORIES ───────────────────────────────────────────────────────────────
export const getCategories = (businessCategory = null) => {
  const params = businessCategory ? `?business_category=${businessCategory}` : '';
  return api
    .get(`/api/v1/listings/categories/${params}`)
    .then((r) => {
      const payload = r.data?.data ?? r.data;
      return Array.isArray(payload) ? payload : [];
    });
};

// ─── LISTINGS (CRUD) ──────────────────────────────────────────────────────────

export const getProducts = async () => {
  const res = await api.get('/api/v1/listings/');
  const payload = res.data?.data ?? res.data;
  if (Array.isArray(payload))          return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

/**
 * POST /api/v1/listings/
 *
 * Accepts two variant input shapes from different forms:
 *
 * Shape A — VendorDashboard (legacy { type, value } objects):
 *   productData.variants = [{ type: 'Color', value: 'Red' }, { type: 'Size', value: 'M' }]
 *
 * Shape B — ProductDashboard (chip arrays):
 *   productData.sizes  = ['S', 'M', 'L']
 *   productData.colors = ['Black', 'White']
 *
 * The backend requires each variant object to have at least color OR size.
 * When both sizes and colors are selected, we create a cross-product so every
 * combination is represented (e.g. S×Black, S×White, M×Black, M×White).
 * If only one dimension is provided we create one variant per value.
 */
export const createProductListing = async (productData) => {
  const qualityMap = {
    High: 'high', Medium: 'medium', Low: 'low',
    high: 'high', medium: 'medium', low: 'low',
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  };

  // ── Build variants ────────────────────────────────────────────────────────
  let variants = [];

  // Shape A: legacy { type, value } array (from VendorDashboard)
  if (Array.isArray(productData.variants) && productData.variants.length > 0) {
    productData.variants.forEach((v) => {
      if (!v.value?.trim()) return;
      if (v.type === 'Size') {
        variants.push({ color: '', size: v.value.trim(), stock: 0 });
      } else if (v.type === 'Color') {
        variants.push({ color: v.value.trim(), size: '', stock: 0 });
      }
    });
  }

  // Shape B: chip arrays (from ProductDashboard)
  const sizes  = Array.isArray(productData.sizes)  ? productData.sizes.filter(Boolean)  : [];
  const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];

  if (variants.length === 0 && (sizes.length > 0 || colors.length > 0)) {
    if (sizes.length > 0 && colors.length > 0) {
      // Cross-product: one variant per size×color combination
      sizes.forEach((size) => {
        colors.forEach((color) => {
          variants.push({ color, size, stock: 0 });
        });
      });
    } else if (sizes.length > 0) {
      sizes.forEach((size) => variants.push({ color: '', size, stock: 0 }));
    } else {
      colors.forEach((color) => variants.push({ color, size: '', stock: 0 }));
    }
  }

  // Guarantee at least one valid variant so the backend doesn't reject the payload
  if (variants.length === 0) {
    variants.push({ color: 'Default', size: '', stock: 0 });
  }

  const payload = {
    business_category: productData.business_category, // MUST come from vendor profile
    title:             productData.title?.trim(),
    description:       productData.description?.trim() || '',
    status:            productData.is_published ? 'published' : 'draft',
    availability:      'available',
    price:             String(parseFloat(productData.price)),
    price_unit:        'item',
    location:          productData.location?.trim() || '',

    detail: {
      sku:        productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      quality:    qualityMap[productData.qty] ?? 'medium',
      variants,
    },
  };

  if (productData.category_id) {
    payload.category_id = productData.category_id;
  }

  console.log('[listings] POST /api/v1/listings/ →', JSON.stringify(payload, null, 2));
  const res = await api.post('/api/v1/listings/', payload);
  return res.data?.data ?? res.data;
};

/**
 * PATCH /api/v1/listings/<uuid:listing_id>/
 * business_category is NOT sent on update.
 */
export const updateProductListing = async (listingId, productData) => {
  const qualityMap = {
    High: 'high', Medium: 'medium', Low: 'low',
    high: 'high', medium: 'medium', low: 'low',
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  };

  const payload = {
    title:       productData.title?.trim(),
    description: productData.description?.trim() || '',
    status:      productData.is_published ? 'published' : 'draft',
    price:       String(parseFloat(productData.price)),
    price_unit:  'item',
    location:    productData.location?.trim() || '',

    detail: {
      sku:        productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      quality:    qualityMap[productData.qty] ?? 'medium',
      // Variants omitted on update to preserve existing stock.
      // Use updateProductVariant() to patch individual variants.
    },
  };

  if (productData.category_id) {
    payload.category_id = productData.category_id;
  }

  console.log('[listings] PATCH /api/v1/listings/', listingId, '→', JSON.stringify(payload, null, 2));
  const res = await api.patch(`/api/v1/listings/${listingId}/`, payload);
  return res.data?.data ?? res.data;
};

/**
 * DELETE /api/v1/listings/<uuid:listing_id>/
 */
export const deleteProductListing = (listingId) =>
  api.delete(`/api/v1/listings/${listingId}/`).then((r) => r.data);

/**
 * PATCH /api/v1/listings/<uuid:listing_id>/status/
 */
export const updateListingStatus = (listingId, newStatus) =>
  api
    .patch(`/api/v1/listings/${listingId}/status/`, { status: newStatus })
    .then((r) => r.data?.data ?? r.data);

/**
 * POST /api/v1/listings/<uuid:listing_id>/images/
 */
export const uploadListingImage = (listingId, imageFile) => {
  const form = new FormData();
  form.append('image', imageFile);
  return api
    .post(`/api/v1/listings/${listingId}/images/`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data?.data ?? r.data);
};

/**
 * DELETE /api/v1/listings/<uuid:listing_id>/images/<uuid:image_id>/
 */
export const deleteListingImage = (listingId, imageId) =>
  api.delete(`/api/v1/listings/${listingId}/images/${imageId}/`).then((r) => r.data);

/**
 * PATCH /api/v1/listings/<uuid:listing_id>/variants/<uuid:variant_id>/
 */
export const updateProductVariant = (listingId, variantId, data) =>
  api
    .patch(`/api/v1/listings/${listingId}/variants/${variantId}/`, data)
    .then((r) => r.data?.data ?? r.data);

/**
 * DELETE /api/v1/listings/<uuid:listing_id>/variants/<uuid:variant_id>/
 */
export const deleteProductVariant = (listingId, variantId) =>
  api.delete(`/api/v1/listings/${listingId}/variants/${variantId}/`).then((r) => r.data);

// ─── PASSWORDS ────────────────────────────────────────────────────────────────
export const passwordResetRequest = (email) =>
  api.post('/api/v1/accounts/reset-password/', { email });

export const passwordResetConfirm = (data) =>
  api.post('/api/v1/accounts/confirm-password-reset/', data);

export const changePassword = (data) =>
  api.post('/api/v1/accounts/change-password/', data);

export default api;