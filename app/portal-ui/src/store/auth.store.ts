// src/store/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getFamilyDashboardData } from '@/services/family.service'; // 👈 Import your fetcher

type UserRole = 'PARENT' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isEmailVerified: boolean; // 🏛️ Added this
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>; // 🏛️ Added this
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('mle-auth-storage');
      },

      // 🏛️ The "Magic Unlock" Action
      refreshUser: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        try {
          // Fetch the latest data from the backend FamilyService
          const freshData = await getFamilyDashboardData();

          // Only update if the status has actually changed
          if (freshData.isEmailVerified !== currentUser.isEmailVerified) {
            set({
              user: {
                ...currentUser,
                ...freshData, // 🏛️ Merges all fresh fields, including isEmailVerified
              },
            });
          }
        } catch (error) {
          console.error("Sync failed:", error);
        }
      },
    }),
    { name: 'mle-auth-storage' }
  )
);