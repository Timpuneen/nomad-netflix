import { create } from "zustand";
import { login as apiLogin, register as apiRegister, deleteMe } from "../api/titles";

interface AuthState {
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),

  login: async (username, password) => {
    const { access_token } = await apiLogin(username, password);
    localStorage.setItem("token", access_token);
    set({ token: access_token });
  },

  register: async (username, email, password) => {
    await apiRegister(username, email, password);
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },

  deleteAccount: async () => {
    await deleteMe();
    localStorage.removeItem("token");
    set({ token: null });
  },
}));
