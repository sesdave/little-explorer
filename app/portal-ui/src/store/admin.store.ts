// src/store/admin.store.ts
import { create } from 'zustand';

// 1. Define the shape of your store
interface AdminState {
  sessions: any[]; // You can replace 'any' with a Session interface later
  analytics: {
    revenue: number;
    enrollmentRate: number;
  };
  setSessions: (sessions: any[]) => void;
  updateAnalytics: (data: any) => void;
  addSession: (session: any) => void;
}

// 2. Pass the interface to create<AdminState>()
export const useAdminStore = create<AdminState>()((set) => ({
  sessions: [],
  analytics: { revenue: 0, enrollmentRate: 0 },
  
  setSessions: (sessions) => set({ sessions }),
  
  updateAnalytics: (data) => set((state) => ({ 
    analytics: { ...state.analytics, ...data } 
  })),
  
  addSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  })),
}));