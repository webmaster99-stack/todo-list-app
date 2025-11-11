import { QueryClient } from '@tanstack/react-query';

// Create and configure React Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Cache time: how long inactive data stays in cache
      cacheTime: 1000 * 60 * 10, // 10 minutes
      
      // Retry failed requests
      retry: 1,
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Show error notifications
      useErrorBoundary: false,
    },
    mutations: {
      // Retry failed mutations
      retry: 0,
    },
  },
});