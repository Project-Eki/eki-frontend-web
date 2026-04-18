import axios from 'axios';

// ─── Vite exposes env vars via import.meta.env (not process.env) ───────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://joineki.com/api/v1';

// ─── Helper to convert relative image paths to absolute URLs ────────────────
export const getImageUrl = (path) => {
  if (!path) return '';

  // Already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('//')) return `https:${path}`;

  // Derive media root by stripping /api/v1 from the base URL
  const mediaRoot = API_BASE_URL
    .replace(/\/api\/v\d+\/?$/, '')
    .replace(/\/$/, '');

  // Normalize: ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Guard against double /media/media/ if backend already includes it
  if (cleanPath.startsWith('/media/')) {
    return `${mediaRoot}${cleanPath}`;
  }

  return `${mediaRoot}/media${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

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

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ─── Request interceptor ─────────────────────────────────────────────────────
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

// ─── Response interceptor (401 refresh) ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

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
        if (!window.location.pathname.includes('Login')) window.location.href = '/Login';
        return Promise.reject(error);
      }

      try {
        const res = await api.post('/accounts/token-refresh/', { refresh: refreshToken });
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
        if (!window.location.pathname.includes('Login')) window.location.href = '/Login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ─── Token helpers ───────────────────────────────────────────────────────────
const saveTokens = ({ access, refresh }) => {
  if (access) localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const SigninUser = async (credentials) => {
  const response = await api.post('/accounts/login/', {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  });
  const data = response.data?.data ?? response.data;
  saveTokens({ access: data?.access, refresh: data?.refresh });

  if (data?.first_name) localStorage.setItem('vendor_first_name', data.first_name);
  if (data?.last_name) localStorage.setItem('vendor_last_name', data.last_name);
  if (data?.email) localStorage.setItem('vendor_email', data.email);
  if (data?.role) localStorage.setItem('vendor_role', data.role);
  if (data?.phone_number) localStorage.setItem('vendor_phone_number', data.phone_number);

  return response.data;
};

export const SignoutUser = () => {
  localStorage.clear();
  window.location.href = '/Login';
};

export const verifyOtp = (data) => api.post('/accounts/verify-email/', data).then((r) => r.data);
export const resendOtp = (email) => api.post('/accounts/resend-code/', { email }).then((r) => r.data);
export const passwordResetRequest = (email) => api.post('/accounts/reset-password/', { email });
export const passwordResetConfirm = (data) => api.post('/accounts/confirm-password-reset/', data);
export const changePassword = (data) => api.post('/accounts/change-password/', data);

// ─── Buyer ───────────────────────────────────────────────────────────────────
export const getBuyerProfile = () =>
  api.get('/accounts/buyer/profile/').then((r) => r.data?.data ?? r.data);
export const updateBuyerProfile = (data) =>
  api.patch('/accounts/buyer/profile/', data).then((r) => r.data?.data ?? r.data);

// ─── Vendor profile ──────────────────────────────────────────────────────────
let _profileCache = null;
let _profileFetching = null;
export const clearProfileCache = () => { _profileCache = null; };

export const getVendorProfile = async () => {
  if (_profileCache) return _profileCache;
  if (_profileFetching) return _profileFetching;

  _profileFetching = (async () => {
    try {
      const r = await api.get('/accounts/vendor/profile/');
      const data = r.data?.data ?? r.data;
      if (data?.first_name) localStorage.setItem('vendor_first_name', data.first_name);
      if (data?.last_name) localStorage.setItem('vendor_last_name', data.last_name);
      if (data?.email) localStorage.setItem('vendor_email', data.email);
      if (data?.profile_picture) localStorage.setItem('vendor_profile_picture', data.profile_picture);
      if (data?.phone_number) localStorage.setItem('vendor_phone_number', data.phone_number);
      if (data?.business_country) localStorage.setItem('vendor_country', data.business_country);
      else if (data?.country) localStorage.setItem('vendor_country', data.country);
      if (data?.branch_location) localStorage.setItem('vendor_branch_location', data.branch_location);
      _profileCache = data;
      return data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 500 || status === 404) {
        const fallback = {
          first_name: localStorage.getItem('vendor_first_name') || '',
          last_name: localStorage.getItem('vendor_last_name') || '',
          email: localStorage.getItem('vendor_email') || '',
          profile_picture: localStorage.getItem('vendor_profile_picture') || null,
          phone_number: localStorage.getItem('vendor_phone_number') || '',
          business_country: localStorage.getItem('vendor_country') || 'Uganda',
          branch_location: localStorage.getItem('vendor_branch_location') || '',
        };
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
    if (key === 'business_phone') {
      let phone = String(value).replace(/\s/g, '');
      if (!phone.startsWith('+')) phone = `+${phone}`;
      formData.append('phone_number', phone);
    } else if (key === 'profile_picture' && value instanceof File) {
      formData.append('profile_picture', value);
    } else {
      formData.append(key, value);
    }
  });
  const res = await api.patch('/accounts/vendor/profile/', formData, {
    headers: { 'Content-Type': undefined },
  });
  clearProfileCache();
  const d = res.data?.data ?? res.data;
  if (d) {
    if (d.first_name) localStorage.setItem('vendor_first_name', d.first_name);
    if (d.last_name) localStorage.setItem('vendor_last_name', d.last_name);
    if (d.email) localStorage.setItem('vendor_email', d.email);
    if (d.profile_picture) localStorage.setItem('vendor_profile_picture', d.profile_picture);
    if (d.phone_number) localStorage.setItem('vendor_phone_number', d.phone_number);
    if (d.business_country) localStorage.setItem('vendor_country', d.business_country);
    else if (d.country) localStorage.setItem('vendor_country', d.country);
    if (d.branch_location) localStorage.setItem('vendor_branch_location', d.branch_location);
  }
  return res.data?.data ?? res.data;
};

// ─── Notifications (stubs) ───────────────────────────────────────────────────
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
    if (err.response?.status === 404 || err.response?.status === 500) return { notifications: [] };
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

// ─── Order notifications ─────────────────────────────────────────────────────
export const getOrderNotifications = async ({ limit = 15, country = '', branch_location = '' } = {}) => {
  try {
    const params = new URLSearchParams({ limit });
    if (country) params.append('country', country);
    if (branch_location) params.append('branch_location', branch_location);
    const r = await api.get(`/orders/vendor/notifications/?${params.toString()}`);
    const payload = r.data?.data ?? r.data;
    if (Array.isArray(payload)) return { notifications: payload };
    if (Array.isArray(payload?.notifications)) return payload;
    if (Array.isArray(payload?.results)) return { notifications: payload.results };
    return { notifications: [] };
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500) return { notifications: [] };
    throw err;
  }
};
export const getOrderNotificationsUnreadCount = async () => {
  try {
    const r = await api.get('/orders/vendor/notifications/unread-count/');
    const payload = r.data?.data ?? r.data;
    return Number(payload?.count ?? payload?.unread_count ?? 0);
  } catch (_) { return 0; }
};
export const markOrderNotificationRead = async (notifId) => {
  try {
    const r = await api.patch(`/orders/vendor/notifications/${notifId}/read/`);
    return r.data?.data ?? r.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500) return null;
    throw err;
  }
};

// ─── Order helpers (normalization) ───────────────────────────────────────────
const deriveTransactionType = (status) => {
  const s = String(status ?? '').toLowerCase();
  if (s === 'cancelled' || s === 'canceled') return 'Refund';
  if (s === 'payout' || s.includes('payout')) return 'Payout';
  return 'Sale';
};

const normalizeOrderItems = (o) => {
  if (Array.isArray(o.items) && o.items.length > 0 && typeof o.items[0] === 'object') {
    return o.items.map((item) => ({
      name: item.name ?? item.title ?? item.product_name ?? item.listing_title ?? 'Item',
      qty: item.qty ?? item.quantity ?? item.amount ?? 1,
      price: item.price ?? item.unit_price ?? item.item_price ?? 0,
      total: item.total ?? item.subtotal ?? item.line_total ??
        (Number(item.price ?? item.unit_price ?? 0) * Number(item.qty ?? item.quantity ?? 1)),
      variant: item.variant ?? item.variant_label ?? item.variant_name ??
        [item.size, item.color].filter(Boolean).join(' / ') ?? '',
      image: item.image ? getImageUrl(item.image) : item.product_image ? getImageUrl(item.product_image) : item.listing_image ? getImageUrl(item.listing_image) : null,
      sku: item.sku ?? item.product_sku ?? '',
    }));
  }
  if (Array.isArray(o.order_items) && o.order_items.length > 0) {
    return o.order_items.map((item) => ({
      name: item.name ?? item.title ?? item.product_name ?? item.listing_title ?? 'Item',
      qty: item.qty ?? item.quantity ?? 1,
      price: item.price ?? item.unit_price ?? item.item_price ?? 0,
      total: item.total ?? item.subtotal ??
        (Number(item.price ?? item.unit_price ?? 0) * Number(item.qty ?? item.quantity ?? 1)),
      variant: item.variant ?? item.variant_label ??
        [item.size, item.color].filter(Boolean).join(' / ') ?? '',
      image: item.image ? getImageUrl(item.image) : item.product_image ? getImageUrl(item.product_image) : null,
      sku: item.sku ?? '',
    }));
  }
  const altKey = ['products', 'cart_items', 'line_items', 'listings'].find(
    (k) => Array.isArray(o[k]) && o[k].length > 0
  );
  if (altKey) {
    return o[altKey].map((item) => ({
      name: item.name ?? item.title ?? item.product_name ?? 'Item',
      qty: item.qty ?? item.quantity ?? 1,
      price: item.price ?? item.unit_price ?? 0,
      total: item.total ?? item.subtotal ??
        (Number(item.price ?? item.unit_price ?? 0) * Number(item.qty ?? item.quantity ?? 1)),
      variant: item.variant ?? item.variant_label ??
        [item.size, item.color].filter(Boolean).join(' / ') ?? '',
      image: item.image ? getImageUrl(item.image) : item.product_image ? getImageUrl(item.product_image) : null,
      sku: item.sku ?? '',
    }));
  }
  return [];
};

const normalizeOrderCustomer = (o) => {
  if (o.customer && typeof o.customer === 'object') {
    return {
      name: o.customer.name ?? o.customer.full_name ?? o.customer.username ??
        [o.customer.first_name, o.customer.last_name].filter(Boolean).join(' ') ?? '—',
      email: o.customer.email ?? '',
      phone: o.customer.phone ?? o.customer.phone_number ?? '',
      address: o.customer.address ?? o.customer.delivery_address ?? o.customer.location ?? '',
    };
  }
  const name =
    (typeof o.customer === 'string' && o.customer) ||
    o.customer_name ||
    o.buyer_name ||
    o.buyer?.name ||
    o.buyer?.full_name ||
    [o.buyer?.first_name, o.buyer?.last_name].filter(Boolean).join(' ') ||
    o.user?.name ||
    o.user?.full_name ||
    [o.user?.first_name, o.user?.last_name].filter(Boolean).join(' ') ||
    o.user?.username ||
    '—';
  return {
    name,
    email: o.customer_email || o.buyer?.email || o.user?.email || o.email || '',
    phone: o.customer_phone || o.buyer?.phone || o.buyer?.phone_number || o.user?.phone || o.phone || o.phone_number || '',
    address: o.delivery_address || o.shipping_address || o.customer_address || o.buyer?.address || o.location || '',
  };
};

const normalizeOrder = (o) => {
  const customer = normalizeOrderCustomer(o);
  const items = normalizeOrderItems(o);
  const derivedType = deriveTransactionType(o.status);
  return {
    ...o,
    id: o.id ?? o.order_id ?? o.pk,
    customer,
    items,
    total: Number(o.total ?? o.total_amount ?? o.total_price ?? o.amount ?? o.grand_total ?? 0),
    subtotal: Number(o.subtotal ?? o.sub_total ?? o.subtotal_amount ?? 0) || null,
    shipping: Number(o.shipping ?? o.shipping_fee ?? o.delivery_fee ?? 0) || null,
    tax: Number(o.tax ?? o.tax_amount ?? o.vat ?? 0) || null,
    status: o.status ?? o.order_status ?? 'pending',
    date: o.date ?? o.created_at ?? o.order_date ?? '',
    location: o.location ?? o.delivery_address ?? o.shipping_address ?? '',
    notes: o.notes ?? o.order_notes ?? o.special_instructions ?? '',
    review: o.review ?? o.customer_review ?? null,
    transaction_type: derivedType,
    type: derivedType,
    transaction_id: o.id ?? o.order_id ?? o.pk,
  };
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const getVendorOrders = async ({ status = '', search = '' } = {}) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    const r = await api.get(`/orders/vendor/order-list/${query}`);
    const payload = r.data?.data ?? r.data;
    let list = [];
    if (Array.isArray(payload)) list = payload;
    else if (Array.isArray(payload?.results)) list = payload.results;
    else if (Array.isArray(payload?.orders)) list = payload.orders;
    else if (Array.isArray(payload?.data)) list = payload.data;
    return list.map(normalizeOrder);
  } catch (_) {
    return [];
  }
};

export const updateVendorOrderStatus = async (orderId, status) => {
  const r = await api.patch(`/orders/vendor/orders-status/${orderId}/`, { status });
  return r.data?.data ?? r.data;
};

export const startServiceOrder = async (orderId) => {
  const r = await api.post(`/orders/start-service/${orderId}/`);
  return r.data?.data ?? r.data;
};

export const completeServiceOrder = async (orderId) => {
  const r = await api.post(`/orders/complete-service/${orderId}/`);
  return r.data?.data ?? r.data;
};

export const markOrderReadyForPickup = async (orderId) => {
  const r = await api.post(`/orders/ready-for-pickup/${orderId}/`);
  return r.data?.data ?? r.data;
};

// ─── NEW: Order Confirmation & Pickup Code Verification (MOCK for UI testing) ─
// TODO: Replace with real API calls once backend endpoints are ready.
export const confirmVendorOrder = async (orderId) => {
  console.log(`[MOCK] confirmVendorOrder called for order ${orderId}`);
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    id: orderId,
    status: 'confirmed',
    pickup_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
  };
};

export const verifyPickupCode = async (orderId, code) => {
  console.log(`[MOCK] verifyPickupCode called for order ${orderId} with code ${code}`);
  await new Promise(resolve => setTimeout(resolve, 800));
  return {
    id: orderId,
    status: 'completed',
    verified: true,
  };
};

// ─── Wallet & Escrow ─────────────────────────────────────────────────────────
export const getVendorWallet = async () => {
  try {
    const r = await api.get('/payments/wallet/vendor/');
    return r.data?.data ?? r.data ?? {};
  } catch (_) { return {}; }
};

export const getVendorEscrow = async () => {
  try {
    const r = await api.get('/orders/vendor/escrow-summary/');
    return r.data?.data ?? r.data ?? {};
  } catch (_) { return {}; }
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getVendorDashboard = async () => {
  let raw = {};
  try {
    const dashRes = await api.get('/accounts/vendor/command-center/');
    raw = dashRes.data?.data ?? dashRes.data ?? {};
  } catch (_) {}

  let country = 'Uganda';
  let storeName = '';
  let vendorType = 'Products';
  let businessCategory = 'retail';
  let currencySymbol = 'UGX';
  let branchLocation = '';

  const isProductVendor = raw.is_product_vendor ?? true;
  const isServiceVendor = raw.is_service_vendor ?? false;
  const vendor_type = raw.vendor_type ?? (isProductVendor ? 'product' : 'service');
  const allowedListingTypes = raw.allowed_listing_types ?? (isProductVendor ? ['product'] : ['service']);

  try {
    const p = await getVendorProfile();
    country = p.business_country || p.country || localStorage.getItem('vendor_country') || 'Uganda';
    storeName = p.business_name || '';
    vendorType = p.business_type || (isProductVendor ? 'Products' : 'Services');
    businessCategory = p.business_category || raw.business_category || 'retail';
    currencySymbol = raw.currencySymbol || p.currencySymbol || 'UGX';
    branchLocation = p.branch_location || localStorage.getItem('vendor_branch_location') || '';
  } catch (_) {}

  let liveOrders = [];
  try { liveOrders = await getVendorOrders(); } catch (_) {}

  const metricsData = raw.metrics || {};
  const salesHistoryData = raw.salesHistory || [];
  const rawRecentOrders = raw.recentOrders || [];
  const recentOrdersData = rawRecentOrders.length > 0 ? rawRecentOrders : liveOrders.slice(0, 10);

  const openOrdersCount = Number(metricsData.openOrders ?? 0) || liveOrders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(String(o.status).toLowerCase())
  ).length;

  let derivedSalesHistory = salesHistoryData;
  if (derivedSalesHistory.length === 0 && liveOrders.length > 0) {
    const byDate = {};
    liveOrders.forEach((o) => {
      const dateKey = o.date ? (() => { try { return new Date(o.date).toLocaleDateString(); } catch (_) { return o.date; } })() : 'Unknown';
      byDate[dateKey] = (byDate[dateKey] || 0) + Number(o.total ?? 0);
    });
    derivedSalesHistory = Object.entries(byDate)
      .map(([date, sales]) => ({ date, sales }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return {
    storeName,
    vendorType,
    country,
    businessCategory,
    currencySymbol,
    branchLocation,
    vendor_type,
    is_product_vendor: isProductVendor,
    is_service_vendor: isServiceVendor,
    allowed_listing_types: allowedListingTypes,
    first_name: raw.first_name,
    last_name: raw.last_name,
    email: raw.email,
    phone_number: raw.phone_number,
    profile_picture: raw.profile_picture,
    metrics: {
      grossSales: Number(metricsData.grossSales ?? 0),
      openOrders: openOrdersCount,
      pendingPayouts: Number(metricsData.pendingPayouts ?? 0),
      activeListings: Number(metricsData.activeListings ?? 0),
    },
    salesHistory: derivedSalesHistory.map((item) => ({ date: item.date, sales: Number(item.sales ?? 0) })),
    recentOrders: recentOrdersData.map(normalizeOrder),
    inventoryAlerts: raw.inventoryAlerts || [],
    reviews: raw.reviews || [],
  };
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = (businessCategory = null) => {
  const params = businessCategory ? `?business_category=${businessCategory}` : '';
  return api.get(`/listings/categories/${params}`).then((r) => {
    const payload = r.data?.data ?? r.data;
    return Array.isArray(payload) ? payload : [];
  });
};

// ─── Listings (Products) ─────────────────────────────────────────────────────
const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return { image: getImageUrl(img) };
  const imageUrl = img.image ?? img.url ?? img.image_url ?? img.src ?? null;
  return { ...img, image: getImageUrl(imageUrl) };
};

const normalizeListing = (item) => {
  const salesStatus = item.sales_status || item.detail?.sales_status || {};
  const discountEnabled = salesStatus?.on_sale === true;
  const discountPct = salesStatus?.discount_percentage ?? item.discount_percentage ?? 0;
  const discountedPrice = salesStatus?.discounted_price ?? item.discounted_price ?? null;

  const normalizedVariants = (item.variants ?? item.detail?.variants ?? []).map((v) => ({
    ...v,
    stock: v.stock ?? v.quantity ?? v.stock_quantity ?? v.detail?.stock ?? 0,
  }));

  let imagesArray = [];
  if (Array.isArray(item.images)) imagesArray = item.images;
  else if (Array.isArray(item.detail?.images)) imagesArray = item.detail.images;
  else if (Array.isArray(item.listing_images)) imagesArray = item.listing_images;
  else if (Array.isArray(item.product_images)) imagesArray = item.product_images;
  else if (item.image) imagesArray = [item.image];

  const normalizedImages = imagesArray.map(normalizeImage).filter(Boolean);

  return {
    ...item,
    id: item.id,
    is_published: item.is_published === true || item.status === 'published',
    sku: item.detail?.sku ?? item.sku ?? '',
    stock: item.detail?.stock ?? item.stock ?? item.stock_quantity ?? item.quantity ?? 0,
    variants: normalizedVariants,
    branch_location: item.branch_location ?? item.detail?.branch_location ?? '',
    discount_enabled: discountEnabled,
    discount_percentage: discountPct,
    discounted_price: discountedPrice,
    images: normalizedImages,
  };
};

export const getProducts = async () => {
  const res = await api.get('/listings/', { params: { listing_type: 'product' } });
  const payload = res.data?.data ?? res.data;
  let raw = [];
  if (Array.isArray(payload)) raw = payload;
  else if (Array.isArray(payload?.results)) raw = payload.results;
  return raw.map(normalizeListing);
};

export const createProductListing = async (productData) => {
  const stockQty = parseInt(productData.stock) || 0;
  const hasRealVariants =
    (Array.isArray(productData.sizes) && productData.sizes.filter(Boolean).length > 0) ||
    (Array.isArray(productData.colors) && productData.colors.filter(Boolean).length > 0);
  let variants = [];
  if (hasRealVariants) {
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      productData.variants.forEach((v) => {
        if (!v.value?.trim()) return;
        if (v.type === 'Size') variants.push({ color: '', size: v.value.trim(), stock: parseInt(v.stock) || 0 });
        if (v.type === 'Color') variants.push({ color: v.value.trim(), size: '', stock: parseInt(v.stock) || 0 });
      });
    }
    const sizes = Array.isArray(productData.sizes) ? productData.sizes.filter(Boolean) : [];
    const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];
    if (variants.length === 0) {
      if (sizes.length > 0 && colors.length > 0) {
        sizes.forEach((size) => colors.forEach((color) => variants.push({ color, size, stock: 0 })));
      } else if (sizes.length > 0) {
        sizes.forEach((size) => variants.push({ color: '', size, stock: 0 }));
      } else {
        colors.forEach((color) => variants.push({ color, size: '', stock: 0 }));
      }
    }
  }
  const salesStatus = productData.sales_status
    ? productData.sales_status
    : productData.discountEnabled
      ? { on_sale: true, discount_percentage: productData.discountPercentage ?? 0, discounted_price: productData.discounted_price ?? null }
      : { on_sale: false };
  const payload = {
    listing_type: 'product',
    business_category: productData.business_category,
    title: productData.title?.trim(),
    description: productData.description?.trim() || '',
    status: productData.is_published ? 'published' : 'draft',
    availability: 'available',
    price: String(parseFloat(productData.price)),
    price_unit: 'item',
    branch_location: productData.branch_location || localStorage.getItem('vendor_branch_location') || '',
    sales_status: salesStatus,
    detail: {
      sku: productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      stock: stockQty,
      variants,
    },
  };
  if (productData.category_id) payload.category_id = productData.category_id;
  const res = await api.post('/listings/', payload);
  return normalizeListing(res.data?.data ?? res.data);
};

export const updateProductListing = async (listingId, productData) => {
  const stockQty = parseInt(productData.stock) || 0;
  const hasRealVariants =
    (Array.isArray(productData.sizes) && productData.sizes.filter(Boolean).length > 0) ||
    (Array.isArray(productData.colors) && productData.colors.filter(Boolean).length > 0);
  let variants = [];
  if (hasRealVariants) {
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      productData.variants.forEach((v) => {
        if (!v.value?.trim()) return;
        if (v.type === 'Size') variants.push({ color: '', size: v.value.trim(), stock: parseInt(v.stock) || 0 });
        if (v.type === 'Color') variants.push({ color: v.value.trim(), size: '', stock: parseInt(v.stock) || 0 });
      });
    }
    const sizes = Array.isArray(productData.sizes) ? productData.sizes.filter(Boolean) : [];
    const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];
    if (variants.length === 0) {
      if (sizes.length > 0 && colors.length > 0) {
        sizes.forEach((size) => colors.forEach((color) => variants.push({ color, size, stock: stockQty })));
      } else if (sizes.length > 0) {
        sizes.forEach((size) => variants.push({ color: '', size, stock: stockQty }));
      } else {
        colors.forEach((color) => variants.push({ color, size: '', stock: stockQty }));
      }
    }
  }
  const salesStatus = productData.sales_status
    ? productData.sales_status
    : productData.discountEnabled
      ? { on_sale: true, discount_percentage: productData.discountPercentage ?? 0, discounted_price: productData.discounted_price ?? null }
      : { on_sale: false };
  const payload = {
    listing_type: 'product',
    title: productData.title?.trim(),
    description: productData.description?.trim() || '',
    status: productData.is_published ? 'published' : 'draft',
    price: String(parseFloat(productData.price)),
    price_unit: 'item',
    branch_location: productData.branch_location || localStorage.getItem('vendor_branch_location') || '',
    sales_status: salesStatus,
    detail: {
      sku: productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      stock: stockQty,
      variants,
    },
  };
  if (productData.category_id) payload.category_id = productData.category_id;
  const res = await api.patch(`/listings/${listingId}/`, payload);
  return normalizeListing(res.data?.data ?? res.data);
};

export const updateVariantStock = async (listingId, variantId, stock) => {
  const res = await api.patch(`/listings/${listingId}/variants/${variantId}/`, {
    stock: parseInt(stock) || 0,
  });
  return res.data?.data ?? res.data;
};

export const updateProductStock = async (listingId, stock) => {
  const listing = await api.get(`/listings/${listingId}/`);
  const variants = listing.data?.data?.detail?.variants || [];
  const defaultVariant = variants.find((v) => v.color === 'Default' && v.size === '');
  if (defaultVariant) return updateVariantStock(listingId, defaultVariant.id, stock);
  throw new Error('No default variant found to update stock');
};

export const deleteProductListing = (listingId) =>
  api.delete(`/listings/${listingId}/`).then((r) => r.data);

export const updateListingStatus = (listingId, newStatus) =>
  api.patch(`/listings/${listingId}/status/`, { status: newStatus })
    .then((r) => r.data?.data ?? r.data);

export const uploadListingImage = async (listingId, imageFile) => {
  if (!(imageFile instanceof File)) return null;
  const form = new FormData();
  form.append('image', imageFile);
  return api.post(`/listings/${listingId}/images/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data?.data ?? r.data);
};

export const uploadListingImages = async (listingId, imageFiles) => {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) return [];
  const results = [];
  for (const file of imageFiles) {
    const actualFile = file instanceof File ? file : file?.file;
    if (actualFile instanceof File) {
      const result = await uploadListingImage(listingId, actualFile);
      if (result) results.push(result);
    }
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

export default api;