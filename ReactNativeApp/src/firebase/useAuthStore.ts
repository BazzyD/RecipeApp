import { create } from 'zustand';
import { User } from 'firebase/auth';

// Define the authentication state
type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
};

// Create a global Zustand store for managing user state across the app
export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
