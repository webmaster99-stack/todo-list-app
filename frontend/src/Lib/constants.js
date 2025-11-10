// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Sorting
export const SORT_FIELDS = {
  CREATED_AT: 'created_at',
  DUE_DATE: 'due_date',
  PRIORITY: 'priority',
};

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Priority levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Priority display
export const PRIORITY_LABELS = {
  [PRIORITY_LEVELS.LOW]: 'Low',
  [PRIORITY_LEVELS.MEDIUM]: 'Medium',
  [PRIORITY_LEVELS.HIGH]: 'High',
};

export const PRIORITY_COLORS = {
  [PRIORITY_LEVELS.LOW]: 'text-blue-600',
  [PRIORITY_LEVELS.MEDIUM]: 'text-yellow-600',
  [PRIORITY_LEVELS.HIGH]: 'text-red-600',
};