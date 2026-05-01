import { create } from 'zustand';

// Define the specific allowed types
export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  message: string | null;
  type: NotificationType;
  show: (message: string, type?: NotificationType) => void;
  hide: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: 'info',
  show: (message, type = 'info') => {
    set({ message, type });
    // Auto-hide after 4 seconds
    setTimeout(() => set({ message: null }), 4000);
  },
  hide: () => set({ message: null }),
}));