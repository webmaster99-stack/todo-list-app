import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    // Return successful response
    return response;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific status codes
      if (status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login (will be handled by router later)
        window.location.href = '/login';
      } else if (status === 403) {
        // Forbidden
        console.error('Access forbidden');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found');
      } else if (status === 500) {
        // Server error
        console.error('Server error');
      }
      
      // Return error with message
      return Promise.reject({
        status,
        message: data?.detail || data?.message || 'An error occurred',
        data,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        status: 0,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Error setting up request
      return Promise.reject({
        status: 0,
        message: error.message || 'An error occurred',
      });
    }
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authAPI = {
  // Register new user
  register: (username, password) => {
    return api.post('/api/auth/register', { username, password });
  },
  
  // Login
  login: (username, password) => {
    return api.post('/api/auth/login', { username, password });
  },
  
  // Logout
  logout: () => {
    return api.post('/api/auth/logout');
  },
  
  // Refresh token
  refreshToken: () => {
    return api.post('/api/auth/refresh');
  },
  
  // Request password reset
  requestPasswordReset: (username) => {
    return api.post('/api/auth/request-password-reset', { username });
  },
  
  // Reset password
  resetPassword: (token, newPassword) => {
    return api.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },
};

// ============================================
// USER ENDPOINTS
// ============================================

export const userAPI = {
  // Get current user profile
  getProfile: () => {
    return api.get('/api/users/me');
  },
  
  // Update profile
  updateProfile: (data) => {
    return api.put('/api/users/me', data);
  },
  
  // Delete account
  deleteAccount: (password) => {
    return api.delete('/api/users/me', { data: { password } });
  },
};

// ============================================
// TODO ENDPOINTS
// ============================================

export const todoAPI = {
  // Get all todos (with pagination and sorting)
  getTodos: (params = {}) => {
    const {
      page = 1,
      page_size = 20,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;
    
    return api.get('/api/todos/', {
      params: { page, page_size, sort_by, sort_order },
    });
  },
  
  // Get single todo by ID
  getTodo: (id) => {
    return api.get(`/api/todos/${id}`);
  },
  
  // Create new todo
  createTodo: (data) => {
    return api.post('/api/todos/', data);
  },
  
  // Update todo
  updateTodo: (id, data) => {
    return api.put(`/api/todos/${id}`, data);
  },
  
  // Complete todo (auto-deletes)
  completeTodo: (id) => {
    return api.post(`/api/todos/${id}/complete`);
  },
  
  // Delete todo
  deleteTodo: (id) => {
    return api.delete(`/api/todos/${id}`);
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Default export
export default api;