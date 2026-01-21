import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import { useNavigate } from "react-router-dom";

export function useAuth() {
    const navigate = useNavigate();

    const {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        loading,
        initialized,
        setAuth,
        logout:  logoutStore,
        loadUserData
    } = useAuthStore();

    const login = async (email, password, rememberMe = false) => {
        try {
            console.log('🔐 [useAuth] Logging in...  Remember:', rememberMe);

            const result = await authService. login(email, password);

            // Przekaż rememberMe do setAuth
            await setAuth(result.user, result.accessToken, result.refreshToken, rememberMe);

            console.log('✅ [useAuth] Login successful');

            return result;
        } catch (error) {
            console.error('❌ [useAuth] Login failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        console.log('👋 [useAuth] Logging out...');
        logoutStore();
        navigate('/login');
    };

    const refreshUser = async () => {
        console.log('🔄 [useAuth] Refreshing user data...');
        await loadUserData();
    };

    return {
        user,
        accessToken,
        refreshToken,
        isAuthenticated,
        loading,
        initialized,
        login,
        logout,
        refreshUser
    };
}