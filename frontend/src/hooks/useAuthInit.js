import { useEffect } from 'react';
import useAuthStore from '../stores/authStore';
import { useProfile } from './useAuth';

/**
 * Hook to initialize auth state and check token expiry
 * Should be called once at app startup
 */
export function useAuthInit() {
  const initAuth = useAuthStore((state) => state.initAuth);
  const checkTokenExpiry = useAuthStore((state) => state.checkTokenExpiry);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  
  // Fetch user profile if authenticated
  const { data: profile, isError } = useProfile();

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Check token expiry periodically (every minute)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Initial check
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(() => {
      const expired = checkTokenExpiry();
      if (expired) {
        console.log('Session expired');
        // Could show a notification here
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiry]);

  // Update user data from profile query
  useEffect(() => {
    if (profile && isAuthenticated) {
      const updateUser = useAuthStore.getState().updateUser;
      updateUser(profile);
    }
  }, [profile, isAuthenticated]);

  // Handle profile fetch error (token invalid)
  useEffect(() => {
    if (isError && isAuthenticated) {
      console.log('Profile fetch failed, clearing auth');
      const clearAuth = useAuthStore.getState().clearAuth;
      clearAuth();
    }
  }, [isError, isAuthenticated]);

  return { isAuthenticated };
}