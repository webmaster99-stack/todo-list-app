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
        
        // Store in localStorage (backup)
        localStorage.setItem('token', token);
        localStorage.setItem('loginTime', now.toString());
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
        localStorage.removeItem('loginTime');
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

      // Initialize auth from localStorage - NOT NEEDED NOW, handled by onRehydrateStorage
      initAuth: () => {
        // This is now handled automatically by persist middleware
        // But we keep it for manual initialization if needed
        const state = get();
        if (state.token && state.loginTime && !state.isTokenExpired()) {
          set({ isAuthenticated: true });
        } else if (state.token && state.isTokenExpired()) {
          get().clearAuth();
        }
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        // Persist these fields
        token: state.token,
        user: state.user,
        loginTime: state.loginTime,
        // Important: Also persist isAuthenticated
        isAuthenticated: state.isAuthenticated,
      }),
      // Handle rehydration (when loading from localStorage)
      onRehydrateStorage: () => (state) => {
        // This runs after state is loaded from localStorage
        if (state) {
          console.log('Rehydrating auth state...');
          
          // Check if we have a token
          if (state.token && state.loginTime) {
            const now = Date.now();
            const elapsed = now - state.loginTime;
            
            // Check if token expired
            if (elapsed >= TOKEN_EXPIRY_MS) {
              console.log('Stored token expired during rehydration');
              state.token = null;
              state.user = null;
              state.loginTime = null;
              state.isAuthenticated = false;
              
              // Clean up localStorage
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('loginTime');
            } else {
              // Token still valid, ensure isAuthenticated is true
              console.log('Restored valid auth session');
              state.isAuthenticated = true;
            }
          } else {
            // No token, ensure not authenticated
            state.isAuthenticated = false;
          }
        }
      },
    }
  )
);

export default useAuthStore;