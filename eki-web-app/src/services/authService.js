import axios from 'axios';

const api = axios.create({
  baseURL: 'http://joineki.com/api/v1/',
  headers: { 'Content-Type': 'application/json' },
});

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────
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
let failedQueue  = [];

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
    const status          = error.response?.status;
    const originalRequest = error.config;

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
      isRefreshing           = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        localStorage.clear();
        if (!window.location.pathname.includes('Login')) window.location.href = '/Login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          'http://joineki.com/api/v1/accounts/token-refresh/',
          { refresh: refreshToken }
        );
        const newAccess = res.data?.access || res.data?.data?.access;
        localStorage.setItem('access_token', newAccess);
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
        processQueue(null, newAccess);
        isRefreshing                               = false;
        originalRequest.headers.Authorization      = `Bearer ${newAccess}`;
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

// ─── TOKEN HELPERS ────────────────────────────────────────────────────────────
const saveTokens = ({ access, refresh }) => {
  if (access)  localStorage.setItem('access_token',  access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};

// ─── AUTHENTICATION ───────────────────────────────────────────────────────────
export const SigninUser = async (credentials) => {
  const response = await api.post('/accounts/login/', {
    email:    credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  });
  const data = response.data?.data ?? response.data;
  saveTokens({ access: data?.access, refresh: data?.refresh });

  if (data?.first_name)   localStorage.setItem('vendor_first_name',   data.first_name);
  if (data?.last_name)    localStorage.setItem('vendor_last_name',    data.last_name);
  if (data?.email)        localStorage.setItem('vendor_email',        data.email);
  if (data?.role)         localStorage.setItem('vendor_role',         data.role);
  if (data?.phone_number) localStorage.setItem('vendor_phone_number', data.phone_number);

  return response.data;
};

export const SignoutUser = () => {
  localStorage.clear();
  window.location.href = '/Login';
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
let _profileCache    = null;
let _profileFetching = null;

export const clearProfileCache = () => { _profileCache = null; };

export const getVendorProfile = async () => {
  if (_profileCache)    return _profileCache;
  if (_profileFetching) return _profileFetching;

  _profileFetching = (async () => {
    try {
      const r    = await api.get('/accounts/vendor/profile/');
      const data = r.data?.data ?? r.data;

      if (data?.first_name)       localStorage.setItem('vendor_first_name',      data.first_name);
      if (data?.last_name)        localStorage.setItem('vendor_last_name',       data.last_name);
      if (data?.email)            localStorage.setItem('vendor_email',            data.email);
      if (data?.profile_picture)  localStorage.setItem('vendor_profile_picture', data.profile_picture);
      if (data?.phone_number)     localStorage.setItem('vendor_phone_number',    data.phone_number);
      if (data?.business_country) localStorage.setItem('vendor_country',         data.business_country);
      else if (data?.country)     localStorage.setItem('vendor_country',         data.country);

      _profileCache = data;
      return data;
    } catch (err) {
      const status = err.response?.status;
      if (status === 500 || status === 404) {
        const fallback = {
          first_name:       localStorage.getItem('vendor_first_name')      || '',
          last_name:        localStorage.getItem('vendor_last_name')       || '',
          email:            localStorage.getItem('vendor_email')            || '',
          profile_picture:  localStorage.getItem('vendor_profile_picture') || null,
          phone_number:     localStorage.getItem('vendor_phone_number')    || '',
          business_country: localStorage.getItem('vendor_country')         || 'Uganda',
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

  try {
    const res = await api.patch('/accounts/vendor/profile/', formData, {
      headers: { 'Content-Type': undefined },
    });

    clearProfileCache();

    const d = res.data?.data ?? res.data;
    if (d) {
      if (d.first_name)       localStorage.setItem('vendor_first_name',      d.first_name);
      if (d.last_name)        localStorage.setItem('vendor_last_name',       d.last_name);
      if (d.email)            localStorage.setItem('vendor_email',            d.email);
      if (d.profile_picture)  localStorage.setItem('vendor_profile_picture', d.profile_picture);
      if (d.phone_number)     localStorage.setItem('vendor_phone_number',    d.phone_number);
      if (d.business_country) localStorage.setItem('vendor_country',         d.business_country);
      else if (d.country)     localStorage.setItem('vendor_country',         d.country);
    }

    return res.data?.data ?? res.data;
  } catch (error) {
    console.error('[updateVendorProfile] Error:', error.response?.status, error.response?.data);
    throw error;
  }
};

// ─── VENDOR NOTIFICATIONS (accounts — kept for backward compat) ───────────────
const NOTIFICATIONS_ENDPOINT_READY = false;

export const getVendorNotifications = async ({ limit = 15 } = {}) => {
  if (!NOTIFICATIONS_ENDPOINT_READY) return { notifications: [] };
  try {
    const r       = await api.get(`/accounts/vendor/notifications/?limit=${limit}`);
    const payload = r.data?.data ?? r.data;
    if (Array.isArray(payload))                return { notifications: payload };
    if (Array.isArray(payload?.notifications)) return payload;
    if (Array.isArray(payload?.results))       return { notifications: payload.results };
    return { notifications: [] };
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500)
      return { notifications: [] };
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

// ─── ORDER NOTIFICATIONS (orders service — live) ──────────────────────────────
export const getOrderNotifications = async ({ limit = 15 } = {}) => {
  try {
    const r       = await api.get(`/orders/vendor/notifications/?limit=${limit}`);
    const payload = r.data?.data ?? r.data;
    if (Array.isArray(payload))                return { notifications: payload };
    if (Array.isArray(payload?.notifications)) return payload;
    if (Array.isArray(payload?.results))       return { notifications: payload.results };
    return { notifications: [] };
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 500)
      return { notifications: [] };
    throw err;
  }
};

export const getOrderNotificationsUnreadCount = async () => {
  try {
    const r       = await api.get('/orders/vendor/notifications/unread-count/');
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

// ─── ORDER NORMALISER ─────────────────────────────────────────────────────────
const normalizeOrder = (o) => ({
  ...o,
  id: o.id ?? o.order_id ?? o.pk,
  customer:
    o.customer       ??
    o.customer_name  ??
    o.buyer_name     ??
    o.buyer?.name    ??
    o.buyer?.full_name ??
    o.user?.name     ??
    o.user?.full_name  ??
    o.user?.username   ??
    '—',
  total: Number(
    o.total         ??
    o.total_amount  ??
    o.total_price   ??
    o.amount        ??
    o.grand_total   ??
    0
  ),
  status: o.status ?? o.order_status ?? 'pending',
  items:  o.items  ?? o.item_count   ?? o.quantity ?? null,
  date:   o.date   ?? o.created_at   ?? o.order_date ?? '',
});

// ─── VENDOR ORDERS ────────────────────────────────────────────────────────────
export const getVendorOrders = async ({ status = '', search = '' } = {}) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const r       = await api.get(`/orders/vendor/order-list/${query}`);
    const payload = r.data?.data ?? r.data;

    console.log('[getVendorOrders] raw response:', payload);

    let list = [];
    if (Array.isArray(payload))               list = payload;
    else if (Array.isArray(payload?.results)) list = payload.results;
    else if (Array.isArray(payload?.orders))  list = payload.orders;
    else if (Array.isArray(payload?.data))    list = payload.data;

    return list.map(normalizeOrder);
  } catch (err) {
    console.error('[getVendorOrders] Error:', err.response?.status, err.response?.data);
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

// ─── VENDOR DASHBOARD ─────────────────────────────────────────────────────────
export const getVendorDashboard = async () => {
  let raw = {};

  try {
    const dashRes = await api.get('/accounts/vendor/command-center/');
    raw = dashRes.data?.data ?? dashRes.data ?? {};
    console.log('[getVendorDashboard] Raw API response:', raw);
  } catch (dashErr) {
    console.error('[getVendorDashboard] command-center failed:', dashErr);
  }

  let country          = 'Uganda';
  let storeName        = '';
  let vendorType       = 'Products';
  let businessCategory = 'retail';
  let currencySymbol   = 'UGX';

  let isProductVendor     = raw.is_product_vendor ?? true;
  let isServiceVendor     = raw.is_service_vendor ?? false;
  let vendor_type         = raw.vendor_type ?? (isProductVendor ? 'product' : 'service');
  let allowedListingTypes = raw.allowed_listing_types ?? (isProductVendor ? ['product'] : ['service']);

  try {
    const p = await getVendorProfile();
    country          = p.business_country || p.country || localStorage.getItem('vendor_country') || 'Uganda';
    storeName        = p.business_name || '';
    vendorType       = p.business_type || (isProductVendor ? 'Products' : 'Services');
    businessCategory = p.business_category || raw.business_category || 'retail';
    currencySymbol   = raw.currencySymbol || p.currencySymbol || 'UGX';
  } catch (_) {}

  let liveOrders = [];
  try {
    liveOrders = await getVendorOrders();
  } catch (_) {}

  const metricsData         = raw.metrics         || {};
  const salesHistoryData    = raw.salesHistory    || [];
  const inventoryAlertsData = raw.inventoryAlerts || [];
  const reviewsData         = raw.reviews         || [];
  const rawRecentOrders     = raw.recentOrders    || [];
  const recentOrdersData    = rawRecentOrders.length > 0 ? rawRecentOrders : liveOrders.slice(0, 10);

  const openOrdersCount = Number(metricsData.openOrders ?? 0) || liveOrders.filter((o) =>
    ['pending', 'confirmed', 'processing'].includes(String(o.status).toLowerCase())
  ).length;

  return {
    storeName,
    vendorType,
    country,
    businessCategory,
    currencySymbol,
    vendor_type,
    is_product_vendor:     isProductVendor,
    is_service_vendor:     isServiceVendor,
    allowed_listing_types: allowedListingTypes,
    first_name:      raw.first_name,
    last_name:       raw.last_name,
    email:           raw.email,
    phone_number:    raw.phone_number,
    profile_picture: raw.profile_picture,
    metrics: {
      grossSales:     Number(metricsData.grossSales     ?? 0),
      openOrders:     openOrdersCount,
      pendingPayouts: Number(metricsData.pendingPayouts ?? 0),
      activeListings: Number(metricsData.activeListings ?? 0),
    },
    salesHistory:    salesHistoryData.map((item) => ({ date: item.date, sales: Number(item.sales ?? 0) })),
    recentOrders:    recentOrdersData.map(normalizeOrder),
    inventoryAlerts: inventoryAlertsData,
    reviews:         reviewsData,
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


const normalizeListing = (item) => {
  const qualityReverseMap = {
    high:   'High',  High:   'High',  HIGH:   'High',
    medium: 'Medium', Medium: 'Medium', MEDIUM: 'Medium',
    low:    'Low',   Low:    'Low',   LOW:    'Low',
  };

  // quality lives inside detail.quality on the API response
  const rawQuality =
    item.detail?.quality ||
    item.inventory_quality ||
    item.qty ||
    'medium';

  const normalizedQuality = qualityReverseMap[rawQuality] ?? 'Medium';

  return {
    ...item,
    // id is ALWAYS the real listing ID — never changed, never overwritten
    id:                item.id,
    is_published:      item.is_published === true || item.status === 'published',
    // expose quality under both field names so dashboard & edit form both work
    inventory_quality: normalizedQuality,
    qty:               normalizedQuality,
    // pull sku and stock up from detail so edit form pre-fills correctly
    sku:               item.detail?.sku   ?? item.sku   ?? '',
    stock:             item.detail?.stock ?? item.stock ?? 0,
    // variants are already embedded in the API response under item.variants
    // or item.detail.variants — surface them consistently
    variants:          item.variants ?? item.detail?.variants ?? [],
  };
};

// ─── GET PRODUCTS ─────────────────────────────────────────────────────────────
// FIX: Returns the flat normalized list directly.
// No processProductVariants() grouping — that function was corrupting product.id
// by substituting parent_product_id for standalone products that had no parent.
// The ProductCard/ProductListItem components already handle showing variants
// from product.variants[], which is populated by normalizeListing above.
export const getProducts = async () => {
  const params = { listing_type: 'product' };
  const res    = await api.get('/listings/', { params });
  const payload = res.data?.data ?? res.data;

  let raw = [];
  if (Array.isArray(payload))          raw = payload;
  else if (Array.isArray(payload?.results)) raw = payload.results;

  const normalized = raw.map(normalizeListing);
  console.log('[getProducts] normalized products:', normalized.map((p) => ({ id: p.id, title: p.title })));
  return normalized;
};

// ─── CREATE PRODUCT LISTING ───────────────────────────────────────────────────
export const createProductListing = async (productData) => {
  const qualityMap = {
    High: 'high', Medium: 'medium', Low: 'low',
    high: 'high', medium: 'medium', low: 'low',
    HIGH: 'high', MEDIUM: 'medium', LOW: 'low',
  };

  const stockQty = parseInt(productData.stock) || 0;
  const hasRealVariants =
    (Array.isArray(productData.sizes)  && productData.sizes.filter(Boolean).length  > 0) ||
    (Array.isArray(productData.colors) && productData.colors.filter(Boolean).length > 0);

  let variants = [];

  if (hasRealVariants) {
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      productData.variants.forEach((v) => {
        if (!v.value?.trim()) return;
        if (v.type === 'Size')  variants.push({ color: '',             size: v.value.trim(), stock: parseInt(v.stock) || 0 });
        if (v.type === 'Color') variants.push({ color: v.value.trim(), size: '',             stock: parseInt(v.stock) || 0 });
      });
    }

    const sizes  = Array.isArray(productData.sizes)  ? productData.sizes.filter(Boolean)  : [];
    const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];

    if (variants.length === 0) {
      if (sizes.length > 0 && colors.length > 0) {
        sizes.forEach((size) => colors.forEach((color) => variants.push({ color, size, stock: 0 })));
      } else if (sizes.length > 0) {
        sizes.forEach((size)  => variants.push({ color: '', size, stock: 0 }));
      } else {
        colors.forEach((color) => variants.push({ color, size: '', stock: 0 }));
      }
    }
  }

  const payload = {
    listing_type:      'product',
    business_category: productData.business_category,
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
      stock:      stockQty,
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

  const stockQty = parseInt(productData.stock) || 0;
  const hasRealVariants =
    (Array.isArray(productData.sizes)  && productData.sizes.filter(Boolean).length  > 0) ||
    (Array.isArray(productData.colors) && productData.colors.filter(Boolean).length > 0);

  let variants = [];

  if (hasRealVariants) {
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      productData.variants.forEach((v) => {
        if (!v.value?.trim()) return;
        if (v.type === 'Size')  variants.push({ color: '',             size: v.value.trim(), stock: parseInt(v.stock) || 0 });
        if (v.type === 'Color') variants.push({ color: v.value.trim(), size: '',             stock: parseInt(v.stock) || 0 });
      });
    }

    const sizes  = Array.isArray(productData.sizes)  ? productData.sizes.filter(Boolean)  : [];
    const colors = Array.isArray(productData.colors) ? productData.colors.filter(Boolean) : [];

    if (variants.length === 0) {
      if (sizes.length > 0 && colors.length > 0) {
        sizes.forEach((size) => colors.forEach((color) => variants.push({ color, size, stock: stockQty })));
      } else if (sizes.length > 0) {
        sizes.forEach((size)  => variants.push({ color: '', size, stock: stockQty }));
      } else {
        colors.forEach((color) => variants.push({ color, size: '', stock: stockQty }));
      }
    }
  }

  const payload = {
    listing_type: 'product',
    title:        productData.title?.trim(),
    description:  productData.description?.trim() || '',
    status:       productData.is_published ? 'published' : 'draft',
    price:        String(parseFloat(productData.price)),
    price_unit:   'item',
    location:     productData.location?.trim() || '',
    detail: {
      sku:        productData.sku?.trim() || '',
      base_price: String(parseFloat(productData.price)),
      quality:    qualityMap[productData.qty] ?? 'medium',
      stock:      stockQty,
      variants,
    },
  };

  if (productData.category_id) payload.category_id = productData.category_id;

  console.log('[listings] PATCH /listings/', listingId, '→', JSON.stringify(payload, null, 2));
  const res = await api.patch(`/listings/${listingId}/`, payload);
  return normalizeListing(res.data?.data ?? res.data);
};

// ─── VARIANT STOCK HELPERS ────────────────────────────────────────────────────
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