import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, userAPI, setAuthToken, clearAuth } from '../Lib/api';
import useAuthStore from '../stores/authStore';

// Query keys
export const authKeys = {
  user: ['user'],
  profile: ['user', 'profile'],
};

// ============================================
// QUERY: Get current user profile
// ============================================
export function useProfile() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data;
    },
    // Only fetch if authenticated
    enabled: isAuthenticated,
    // Don't retry on 401 (unauthorized)
    retry: false,
  });
}

// ============================================
// MUTATION: Login
// ============================================
export function useLogin() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await authAPI.login(username, password);
      return response.data;
    },
    onSuccess: (data) => {
      // Store token in API client
      setAuthToken(data.access_token);
      
      // Store in Zustand
      setAuth(data.access_token, data.user || null);
      
      // Invalidate queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });
}

// ============================================
// MUTATION: Register
// ============================================
export function useRegister() {
  return useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await authAPI.register(username, password);
      return response.data;
    },
  });
}

// ============================================
// MUTATION: Logout
// ============================================
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        // Logout locally even if API call fails
        console.error('Logout API error:', error);
      }
    },
    onSuccess: () => {
      // Clear auth data from API client
      clearAuth();
      
      // Clear Zustand store
      clearAuthState();
      
      // Clear all queries
      queryClient.clear();
    },
  });
}

// ============================================
// MUTATION: Update profile
// ============================================
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (data) => {
      const response = await userAPI.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user in store
      updateUser(data);
      
      // Refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}

// ============================================
// MUTATION: Delete account
// ============================================
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const clearAuthState = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async (password) => {
      await userAPI.deleteAccount(password);
    },
    onSuccess: () => {
      // Clear auth and all data
      clearAuth();
      clearAuthState();
      queryClient.clear();
    },
  });
}