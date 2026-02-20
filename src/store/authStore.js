import { create } from "zustand";
import apiClient from "@/services/apiClient";
import { storageService } from "@/services/storageService";
import { tokenDebugger } from "@/utils/tokenDebugger";

export const useAuthStore = create((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: true,
    initialized: false,
    _refreshTimer: null,

    initialize:  async () => {
        console.log('🔐 [AuthStore] Initializing auth state...');

        try {
            const accessToken = storageService.getItem('accessToken');
            const refreshToken = storageService.getItem('refreshToken');

            // Storage consistency check
            tokenDebugger.checkStorageConsistency(storageService.isPersistentSession());

            console.log('🔍 [AuthStore] Found tokens:', {
                hasAccessToken: !!accessToken,
                hasRefreshToken: !!refreshToken,
                isPersistent: storageService.isPersistentSession()
            });

            tokenDebugger.logStorageType(storageService.isPersistentSession());
            tokenDebugger.inspectToken(accessToken, 'accessToken');
            tokenDebugger.logRefreshTokenState(refreshToken);

            if (! accessToken || !refreshToken) {
                console.log('❌ [AuthStore] No tokens found');
                set({ loading: false, initialized: true, isAuthenticated: false, user: null });
                return;
            }

            // Sprawdź czy token jest wygasły
            const isExpired = get().isTokenExpired(accessToken);

            if (isExpired) {
                console.log('⚠️ [AuthStore] Token expired, will be refreshed by interceptor on first request');
                // NIE próbuj tu refreshować - interceptor to zrobi przy pierwszym request
            }

            // Załaduj dane użytkownika
            const userData = await get().loadUserData();

            if (userData) {
                console.log('✅ [AuthStore] User authenticated:', userData.email);
                set({
                    user: userData,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                    loading: false,
                    initialized: true
                });
            } else {
                console. log('❌ [AuthStore] Failed to load user data');
                get().logout();
                set({ loading: false, initialized: true });
            }

        } catch (error) {
            console.error('❌ [AuthStore] Initialization failed:', error);
            get().logout();
            set({ loading: false, initialized: true });
        }
    },

    loadUserData: async () => {
        try {
            const cachedUser = storageService.getItem('user');
            if (cachedUser) {
                const userData = JSON.parse(cachedUser);
                console.log('📦 [AuthStore] Loaded user from cache:', userData. email);
                return userData;
            }

            const userId = get().getUserIdFromToken();
            if (!userId) {
                console.error('❌ [AuthStore] Cannot extract userId from token');
                return null;
            }

            console.log('🌐 [AuthStore] Fetching user data from API for userId:', userId);

            // To wywołanie automatycznie użyje interceptora który odświeży token jeśli trzeba
            const response = await apiClient.get(`/api/v1/user/id/${userId}`);

            storageService.setItem('user', JSON.stringify(response.data));
            storageService.setItem('userId', String(userId));

            console.log('✅ [AuthStore] User data fetched and cached');
            return response.data;

        } catch (error) {
            console.error('❌ [AuthStore] Failed to load user data:', error);
            return null;
        }
    },

    getUserIdFromToken: () => {
        try {
            const token = storageService.getItem('accessToken');
            if (!token) return null;

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.sub || payload.userId || payload.nameid || payload.id;

            console.log('🔍 [AuthStore] Extracted userId from token:', userId);
            return userId;
        } catch (error) {
            console.error('❌ [AuthStore] Failed to parse token:', error);
            return null;
        }
    },

    isTokenExpired: (token) => {
        try {
            const payload = JSON. parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000;
            const currentTime = Date.now();
            const timeLeft = expirationTime - currentTime;
            const isExpired = timeLeft < 30000; // 30 sekund marginesu

            console.log('🕐 [AuthStore] Token expiration:', {
                expiresAt: new Date(expirationTime).toLocaleTimeString(),
                timeLeftSeconds: Math.round(timeLeft / 1000),
                isExpired
            });

            return isExpired;
        } catch (error) {
            console.error('❌ [AuthStore] Failed to check token expiration:', error);
            return true;
        }
    },

    setAuth: async (user, accessToken, refreshToken, rememberMe = false) => {
        console.log('💾 [AuthStore] Setting auth:', {
            email: user?. email,
            rememberMe,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken
        });

        // Ustaw typ storage
        storageService.setStorageType(rememberMe);

        // Zapisz tokeny
        storageService.setItem('accessToken', accessToken);
        storageService.setItem('refreshToken', refreshToken);

        if (user) {
            storageService. setItem('user', JSON.stringify(user));
            storageService.setItem('userId', String(user.id));
        }

        set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: Boolean(accessToken && user),
        });

        // Schedule proactive token refresh
        get().scheduleTokenRefresh(accessToken);

        console.log('✅ [AuthStore] Auth set successfully');
    },

    scheduleTokenRefresh: (accessToken) => {
        // Clear any existing timer
        const existing = get()._refreshTimer;
        if (existing) {
            clearTimeout(existing);
        }

        if (!accessToken) return;

        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const expMs = payload.exp * 1000;
            const nowMs = Date.now();
            // Fire 60 seconds before expiry
            const delayMs = expMs - nowMs - 60000;

            if (delayMs <= 0) {
                console.log('⚠️ [AuthStore] Token already near expiry, skipping proactive refresh timer');
                return;
            }

            console.log(`⏰ [AuthStore] Proactive refresh scheduled in ${Math.round(delayMs / 1000)}s`);
            tokenDebugger.log(`Proactive refresh scheduled in ${Math.round(delayMs / 1000)}s`);

            const timer = setTimeout(async () => {
                console.log('🔄 [AuthStore] Proactive token refresh firing...');
                tokenDebugger.log('Proactive refresh timer fired');
                const currentRefreshToken = storageService.getItem('refreshToken');
                tokenDebugger.logRefreshTokenState(currentRefreshToken);

                if (!currentRefreshToken) {
                    console.warn('⚠️ [AuthStore] No refresh token for proactive refresh');
                    return;
                }

                try {
                    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://vfedora1.tail7fa028.ts.net:6901';
                    const response = await fetch(`${API_BASE_URL}/api/v1/auth/regenerate-tokens`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: currentRefreshToken }),
                    });

                    if (!response.ok) {
                        console.error('❌ [AuthStore] Proactive refresh failed:', response.status);
                        return;
                    }

                    const data = await response.json();
                    tokenDebugger.logRefreshCycle('proactive-response', data);

                    const newAccessToken = data.accessToken?.token || data.accessToken;
                    const newRefreshToken = data.refreshToken?.token || data.refreshToken;

                    if (newAccessToken) {
                        storageService.setItem('accessToken', newAccessToken);
                        if (newRefreshToken) storageService.setItem('refreshToken', newRefreshToken);
                        set({ accessToken: newAccessToken, refreshToken: newRefreshToken || currentRefreshToken });
                        // Schedule next refresh
                        get().scheduleTokenRefresh(newAccessToken);
                        console.log('✅ [AuthStore] Proactive refresh successful');
                        tokenDebugger.inspectToken(newAccessToken, 'new-accessToken');
                    }
                } catch (err) {
                    console.error('❌ [AuthStore] Proactive refresh error:', err);
                }
            }, delayMs);

            set({ _refreshTimer: timer });
        } catch (e) {
            console.error('❌ [AuthStore] Failed to schedule token refresh:', e);
        }
    },

    logout: () => {
        console. log('👋 [AuthStore] Logging out...');

        // Clear proactive refresh timer
        const timer = get()._refreshTimer;
        if (timer) {
            clearTimeout(timer);
        }

        storageService.clear();

        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            _refreshTimer: null,
        });

        console.log('✅ [AuthStore] Logout complete');
    },
}));