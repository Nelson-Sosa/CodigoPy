import axios from 'axios';

const API_URL = 'https://codigopy-api.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role?: string }) =>
    api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  updateUser: (id: string, data: object) => api.put(`/auth/users/${id}`, data),
};

export const productService = {
  getAll: (params?: { search?: string; category?: string; status?: string; lowStock?: boolean }) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: object) => api.post('/products', data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  adjustStock: (id: string, data: { quantity: number; type: 'in' | 'out' | 'adjust'; reason: string }) =>
    api.patch(`/products/${id}/stock`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data: object) => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const movementService = {
  getAll: (params?: { type?: string; product?: string; startDate?: string; endDate?: string; limit?: number }) =>
    api.get('/movements', { params }),
};

export const reportService = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSalesSummary: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/reports/sales-summary', { params }),
};

export const clientService = {
  getAll: (params?: { search?: string }) => api.get('/clients', { params }),
  getById: (id: string) => api.get(`/clients/${id}`),
  create: (data: object) => api.post('/clients', data),
  update: (id: string, data: object) => api.put(`/clients/${id}`, data),
  delete: (id: string) => api.delete(`/clients/${id}`),
};

export const saleService = {
  getAll: () => api.get('/sales'),
  getById: (id: string) => api.get(`/sales/${id}`),
  create: (data: object) => api.post('/sales', data),
  update: (id: string, data: object) => api.put(`/sales/${id}`, data),
  cancel: (id: string) => api.patch(`/sales/${id}/cancel`),
};

export const supplierService = {
  getAll: (params?: { search?: string; category?: string; isActive?: boolean }) =>
    api.get('/suppliers', { params }),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: object) => api.post('/suppliers', data),
  update: (id: string, data: object) => api.put(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
  addProduct: (id: string, productId: string) =>
    api.post(`/suppliers/${id}/products`, { productId }),
};

export const purchaseService = {
  getAll: (params?: { status?: string; supplier?: string; startDate?: string; endDate?: string }) =>
    api.get('/purchases', { params }),
  getById: (id: string) => api.get(`/purchases/${id}`),
  getSummary: () => api.get('/purchases/summary'),
  create: (data: object) => api.post('/purchases', data),
  receive: (id: string) => api.patch(`/purchases/${id}/receive`),
  cancel: (id: string) => api.patch(`/purchases/${id}/cancel`),
  updatePayment: (id: string, amountPaid: number) => api.patch(`/purchases/${id}/payment`, { amountPaid }),
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (data: object) => api.put('/settings', data),
};

export const cashRegisterService = {
  getToday: () => api.get('/cash-register/today'),
  getHistory: (params?: { page?: number; limit?: number }) => api.get('/cash-register/history', { params }),
  getSummary: () => api.get('/cash-register/summary'),
  open: (openingAmount: number) => api.post('/cash-register/open', { openingAmount }),
  close: (data: { closingAmount: number; notes?: string }) => api.post('/cash-register/close', data),
  reopen: (openingAmount: number) => api.post('/cash-register/reopen', { openingAmount }),
};

export default api;
