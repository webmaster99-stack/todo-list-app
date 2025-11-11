import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI, userAPI, setAuthToken, clearAuth } from '../Lib/api';

// Query keys
export const authKeys = {
  user: ['user'],
  profile: ['user', 'profile'],
};

// ============================================
// QUERY: Get current user profile
// ============================================
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data;
    },
    // Only fetch if token exists
    enabled: !!localStorage.getItem('token'),
    // Don't retry on 401 (unauthorized)
    retry: false,
  });
}

// ============================================
// MUTATION: Login
// ============================================
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ username, password }) => {
      const response = await authAPI.login(username, password);
      return response.data;
    },
    onSuccess: (data) => {
      // Store token
      setAuthToken(data.access_token);
      
      // Store user data if available
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
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
      // Clear auth data
      clearAuth();
      
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

  return useMutation({
    mutationFn: async (data) => {
      const response = await userAPI.updateProfile(data);
      return response.data;
    },
    onSuccess: () => {
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

  return useMutation({
    mutationFn: async (password) => {
      await userAPI.deleteAccount(password);
    },
    onSuccess: () => {
      // Clear auth and all data
      clearAuth();
      queryClient.clear();
    },
  });
}