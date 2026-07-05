import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('fintrack_token');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
    }
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
    }
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('fintrack_token');
  }
};

export const dashboardService = {
  getOverview: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  }
};

export const expenseService = {
  getExpenses: async (params) => {
    const response = await api.get('/expenses', { params });
    return response.data;
  },
  createExpense: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  updateExpense: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export const incomeService = {
  getIncomes: async (params) => {
    const response = await api.get('/income', { params });
    return response.data;
  },
  createIncome: async (data) => {
    const response = await api.post('/income', data);
    return response.data;
  },
  updateIncome: async (id, data) => {
    const response = await api.put(`/income/${id}`, data);
    return response.data;
  },
  deleteIncome: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  }
};

export const budgetService = {
  getBudgets: async (params) => {
    const response = await api.get('/budgets', { params });
    return response.data;
  },
  createBudget: async (data) => {
    const response = await api.post('/budgets', data);
    return response.data;
  },
  deleteBudget: async (id) => {
    const response = await api.delete(`/budgets/${id}`);
    return response.data;
  }
};

export const profileService = {
  updateProfile: async (data) => {
    const response = await api.put('/profile/update', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.put('/profile/password', data);
    return response.data;
  },
  uploadAvatar: async (formData) => {
    const response = await api.post('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export const notificationService = {
  getNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

export const aiService = {
  getInsights: async () => {
    const response = await api.post('/ai/insights');
    return response.data;
  },
  getSuggestions: async (title) => {
    const response = await api.post('/ai/suggest', { title });
    return response.data;
  },
  query: async (question) => {
    const response = await api.post('/ai/query', { question });
    return response.data;
  },
  getStatus: async () => {
    const response = await api.get('/ai/status');
    return response.data;
  }
};

export default api;
