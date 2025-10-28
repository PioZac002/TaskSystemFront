import { create } from "zustand";

export const useAuthStore = create((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    setAuth: (user, accessToken) =>
        set(() => ({
            user,
            accessToken,
            isAuthenticated: Boolean(accessToken && user),
        })),
    logout: () =>
        set(() => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
        })),
}));
