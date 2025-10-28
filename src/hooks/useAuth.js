import { useAuthStore } from "@/store/authStore";

/**
 * useAuth hook exposes the most common auth UX methods/state.
 * Benefit: Import raz, masz status logowania, user infos i akcje.
 */
export function useAuth() {
    const { user, accessToken, isAuthenticated, setAuth, logout } =
        useAuthStore();
    return { user, accessToken, isAuthenticated, setAuth, logout };
}
