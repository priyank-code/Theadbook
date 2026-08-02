import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      // Login action
      login: (token, user) => set({ token, user, isAuthenticated: true }),

      // Logout action
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'theadbook-auth-storage', // localStorage key
    }
  )
);

export default useAuthStore;