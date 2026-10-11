import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Response interceptor for 401 refresh & 503 killswitch suspension
api.interceptors.response.use(
  (res) => {
    if (res.data?.suspended) {
      try {
        const { useSettingsStore } = require('./settingsStore');
        useSettingsStore.getState().setSuspended(true, res.data?.message);
      } catch {}
    }
    return res;
  },
  async (error) => {
    // 503 Killswitch Suspension — shut down frontend immediately
    if (error.response?.status === 503 || error.response?.data?.suspended) {
      const msg = error.response?.data?.message || 'This application has been suspended. Please contact NotfoundAi team';
      try {
        const { useSettingsStore } = require('./settingsStore');
        useSettingsStore.getState().setSuspended(true, msg);
      } catch {}
    }

    const original = error.config;
    // Skip retry for the refresh endpoint itself to prevent infinite loops
    const isRefreshCall = original?.url?.includes('/auth/refresh');
    if (
      error.response?.status === 401 &&
      !original?._retry &&
      !isRefreshCall
    ) {
      original._retry = true;
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        return api(original);
      } catch {
        // Refresh failed — propagate original 401 error as-is so callers can handle it
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API helpers ──────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const productApi = {
  list: (params?: Record<string, string | number | boolean>) => api.get('/products', { params }),
  get: (slug: string) => api.get(`/products/${slug}`),
  create: (data: FormData) => api.post('/products', data),
  update: (id: string, data: FormData) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  addReview: (id: string, data: { rating: number; comment: string }) => api.post(`/products/${id}/reviews`, data),
};

export const categoryApi = {
  list:   ()                        => api.get('/categories'),
  get:    (id: string)              => api.get(`/categories/${id}`),
  create: (data: object)            => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: string)              => api.delete(`/categories/${id}`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  add: (data: { productId: string; variantId?: string; quantity: number }) => api.post('/cart/add', data),
  update: (cartItemId: string, quantity: number) => api.put('/cart/update', { cartItemId, quantity }),
  remove: (cartItemId: string) => api.delete('/cart/remove', { data: { cartItemId } }),
  clear: () => api.delete('/cart/clear'),
};

export const orderApi = {
  create:    (data: object) => api.post('/orders', data),
  list:      () => api.get('/orders'),
  get:       (id: string) => api.get(`/orders/${id}`),
  getPublic: (id: string) => api.get(`/orders/${id}/public`),
};

export const wishlistApi = {
  get:    () => api.get('/wishlist'),
  add:    (productId: string) => api.post('/wishlist/add', { productId }),
  remove: (productId: string) => api.delete('/wishlist/remove', { data: { productId } }),
};

export const blogApi = {
  list: (params?: object) => api.get('/blog', { params }),
  get:  (slug: string) => api.get(`/blog/${slug}`),
};

export const userApi = {
  getProfile:     () => api.get('/user/profile'),
  updateProfile:  (data: object) => api.put('/user/profile', data),
  updatePassword: (data: object) => api.put('/user/password', data),
  addAddress:     (data: object) => api.post('/user/addresses', data),
  updateAddress:  (id: string, data: object) => api.put(`/user/addresses/${id}`, data),
  deleteAddress:  (id: string) => api.delete(`/user/addresses/${id}`),
};

export const adminApi = {
  stats:             () => api.get('/admin/stats'),
  revenue:           () => api.get('/admin/revenue'),
  customers:         (params?: object) => api.get('/admin/customers', { params }),
  customer:          (id: string) => api.get(`/admin/customers/${id}`),
  orders:            (params?: object) => api.get('/orders/admin/all', { params }),
  updateOrderStatus: (id: string, data: object) => api.put(`/orders/${id}/status`, data),
};

export const paymentApi = {
  checkout:    (data: object) => api.post('/payment/checkout', data),
  createOrder: (data: { amount: number; orderId: string }) => api.post('/payment/create-order', data),
  verify:      (data: object) => api.post('/payment/verify', data),
};

export const collectionApi = {
  list:          () => api.get('/collections'),
  adminList:     () => api.get('/collections/admin'),
  get:           (slug: string) => api.get(`/collections/${slug}`),
  create:        (data: object) => api.post('/collections', data),
  update:        (id: string, data: object) => api.put(`/collections/${id}`, data),
  delete:        (id: string) => api.delete(`/collections/${id}`),
  addProduct:    (id: string, productId: string) => api.post(`/collections/${id}/products`, { productId }),
  removeProduct: (id: string, productId: string) => api.delete(`/collections/${id}/products/${productId}`),
};

export const settingsApi = {
  /** Public — used by storefront on load */
  get:      () => api.get('/settings'),
  /** Admin — read current settings in admin panel */
  adminGet: () => api.get('/settings/admin'),
  /** Admin — save all settings */
  save:     (data: object) => api.put('/settings/admin', data),
  /** Admin — upload a logo/hero/OG image, returns { url } */
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/settings/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};



