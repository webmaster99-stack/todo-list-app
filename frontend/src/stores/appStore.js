import { create } from 'zustand';

const useAppStore = create((set) => ({
  // UI State
  isSidebarOpen: true,
  isLoading: false,
  notification: null,

  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type, id: Date.now() } });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      set({ notification: null });
    }, 5000);
  },
  
  hideNotification: () => set({ notification: null }),
}));

export default useAppStore;