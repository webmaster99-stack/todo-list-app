import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { todoAPI } from '../Lib/api';

// Query keys
export const todoKeys = {
  all: ['todos'],
  lists: () => [...todoKeys.all, 'list'],
  list: (params) => [...todoKeys.lists(), params],
  details: () => [...todoKeys.all, 'detail'],
  detail: (id) => [...todoKeys.details(), id],
};

// ============================================
// QUERY: Get all todos (with pagination/sorting)
// ============================================
export function useTodos(params = {}) {
  return useQuery({
    queryKey: todoKeys.list(params),
    queryFn: async () => {
      const response = await todoAPI.getTodos(params);
      return response.data;
    },
  });
}

// ============================================
// QUERY: Get single todo
// ============================================
export function useTodo(id) {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: async () => {
      const response = await todoAPI.getTodo(id);
      return response.data;
    },
    enabled: !!id, // Only run if id is provided
  });
}

// ============================================
// MUTATION: Create todo
// ============================================
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoData) => {
      const response = await todoAPI.createTodo(todoData);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate todos list to refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

// ============================================
// MUTATION: Update todo
// ============================================
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await todoAPI.updateTodo(id, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(variables.id) });
    },
  });
}

// ============================================
// MUTATION: Complete todo (auto-deletes)
// ============================================
export function useCompleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await todoAPI.completeTodo(id);
      return id;
    },
    onSuccess: () => {
      // Invalidate todos list (todo is deleted)
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}

// ============================================
// MUTATION: Delete todo
// ============================================
export function useDeleteTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await todoAPI.deleteTodo(id);
      return id;
    },
    onSuccess: () => {
      // Invalidate todos list
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
}