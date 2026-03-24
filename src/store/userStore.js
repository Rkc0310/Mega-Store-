import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,
  role: null,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
}));
