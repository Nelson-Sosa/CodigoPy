import axios from 'axios';
const API_URL = 'https://codigopy-api.onrender.com/api';
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    getUsers: () => api.get('/auth/users'),
    updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
};
export const productService = {
    getAll: (params) => api.get('/products', { params }),
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    adjustStock: (id, data) => api.patch(`/products/${id}/stock`, data),
    delete: (id) => api.delete(`/products/${id}`),
};
export const categoryService = {
    getAll: () => api.get('/categories'),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};
export const movementService = {
    getAll: (params) => api.get('/movements', { params }),
};
export const reportService = {
    getDashboard: () => api.get('/reports/dashboard'),
    getSalesSummary: (params) => api.get('/reports/sales-summary', { params }),
};
export const clientService = {
    getAll: (params) => api.get('/clients', { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (data) => api.post('/clients', data),
    update: (id, data) => api.put(`/clients/${id}`, data),
    delete: (id) => api.delete(`/clients/${id}`),
};
export const saleService = {
    getAll: () => api.get('/sales'),
    getById: (id) => api.get(`/sales/${id}`),
    create: (data) => api.post('/sales', data),
    update: (id, data) => api.put(`/sales/${id}`, data),
    cancel: (id) => api.patch(`/sales/${id}/cancel`),
};
export const supplierService = {
    getAll: (params) => api.get('/suppliers', { params }),
    getById: (id) => api.get(`/suppliers/${id}`),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    delete: (id) => api.delete(`/suppliers/${id}`),
    addProduct: (id, productId) => api.post(`/suppliers/${id}/products`, { productId }),
};
export const purchaseService = {
    getAll: (params) => api.get('/purchases', { params }),
    getById: (id) => api.get(`/purchases/${id}`),
    getSummary: () => api.get('/purchases/summary'),
    create: (data) => api.post('/purchases', data),
    receive: (id) => api.patch(`/purchases/${id}/receive`),
    cancel: (id) => api.patch(`/purchases/${id}/cancel`),
    updatePayment: (id, amountPaid) => api.patch(`/purchases/${id}/payment`, { amountPaid }),
};
export const settingsService = {
    get: () => api.get('/settings'),
    update: (data) => api.put('/settings', data),
};
export const cashRegisterService = {
    getToday: () => api.get('/cash-register/today'),
    getHistory: (params) => api.get('/cash-register/history', { params }),
    getSummary: () => api.get('/cash-register/summary'),
    open: (openingAmount) => api.post('/cash-register/open', { openingAmount }),
    close: (data) => api.post('/cash-register/close', data),
    reopen: (openingAmount) => api.post('/cash-register/reopen', { openingAmount }),
};
export const exchangeRateService = {
    get: (currency) => api.get(`/exchange-rate${currency ? `?currency=${currency}` : ''}`),
    getAll: () => api.get('/exchange-rate/all'),
    sync: () => api.post('/exchange-rate/sync'),
    update: (data) => api.post('/exchange-rate/manual', data),
};
export default api;
