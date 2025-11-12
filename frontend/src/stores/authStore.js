import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      user: null,
      loginTime: null,
      isAuthenticated: false,

      // Actions
      setAuth: (token, user) => {
        const now = Date.now();
        set({
          token,
          user,
          loginTime: now,
          isAuthenticated: true,
        });
        
        // Store in localStorage (handled by persist middleware)
        localStorage.setItem('token', token);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      },

      clearAuth: () => {
        set({
          token: null,
          user: null,
          loginTime: null,
          isAuthenticated: false,
        });
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      // Check if token is expired
      isTokenExpired: () => {
        const { loginTime } = get();
        if (!loginTime) return true;
        
        const now = Date.now();
        const elapsed = now - loginTime;
        return elapsed >= TOKEN_EXPIRY_MS;
      },

      // Auto-logout if token expired
      checkTokenExpiry: () => {
        const { isTokenExpired, clearAuth, isAuthenticated } = get();
        
        if (isAuthenticated && isTokenExpired()) {
          console.log('Token expired, logging out...');
          clearAuth();
          return true; // Token was expired
        }
        
        return false; // Token still valid
      },

      // Initialize auth from localStorage
      initAuth: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const loginTime = localStorage.getItem('loginTime');
        
        if (token && loginTime) {
          const now = Date.now();
          const elapsed = now - parseInt(loginTime, 10);
          
          // Check if token expired
          if (elapsed >= TOKEN_EXPIRY_MS) {
            console.log('Stored token expired, clearing...');
            get().clearAuth();
            return;
          }
          
          // Token still valid, restore session
          const user = userStr ? JSON.parse(userStr) : null;
          set({
            token,
            user,
            loginTime: parseInt(loginTime, 10),
            isAuthenticated: true,
          });
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        token: state.token,
        user: state.user,
        loginTime: state.loginTime,
      }),
    }
  )
);

export default useAuthStore;