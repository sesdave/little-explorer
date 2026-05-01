import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Child } from '@mle/types';

interface FamilyState {
  children: Child[];
  selectedChildId: string | null;
  registrations: any[];
  registrationCart: string[];
  
  // Actions
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  selectChild: (id: string | null) => void;
  toggleRegistration: (classId: string) => void;
  clearCart: () => void;
  
  // Useful Helper (Optional but recommended)
  getSelectedChild: () => Child | undefined;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,
      registrations: [],
      registrationCart: [],

      setChildren: (children) => set({ children }),

      // check for duplicates by ID before adding
      addChild: (child) => set((state) => {
        const exists = state.children.some(c => c.id === child.id);
        if (exists) return state; 
        return { children: [...state.children, child] };
      }),

      selectChild: (id) => set({ 
        selectedChildId: id, 
        registrationCart: [] // Good logic: clear cart when switching kids
      }),

      toggleRegistration: (classId) => set((state) => ({
        registrationCart: state.registrationCart.includes(classId)
          ? state.registrationCart.filter(id => id !== classId)
          : [...state.registrationCart, classId]
      })),

      clearCart: () => set({ registrationCart: [] }),

      // Helper to easily get the full object of the selected child
      getSelectedChild: () => {
        const { children, selectedChildId } = get();
        return children.find(c => c.id === selectedChildId);
      }
    }),
    { 
      name: 'mle-family-storage',
      // Partialize allows you to choose what stays in LocalStorage
      // e.g., you might NOT want the cart to persist if you prefer a fresh start
      partialize: (state) => ({ 
        children: state.children, 
        selectedChildId: state.selectedChildId 
      }),
    }
  )
);