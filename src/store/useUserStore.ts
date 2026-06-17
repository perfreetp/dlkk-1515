import { create } from 'zustand';
import type { User } from '@/types';
import { currentUser, mockUsers } from '@/data/mockDataIndex';

interface UserStore {
  currentUser: User;
  users: User[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  getUserById: (id: string) => User | undefined;
}

export const useUserStore = create<UserStore>((set, get) => ({
  currentUser,
  users: mockUsers,
  selectedCity: '上海',

  setSelectedCity: (city) => set({ selectedCity: city }),

  getUserById: (id) => {
    return get().users.find(u => u.id === id);
  },
}));
