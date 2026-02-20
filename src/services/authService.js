import apiClient from "./apiClient";
import { storageService } from "./storageService";

class AuthService {
    constructor() {
        console.log('🔧 [AuthService] Initializing...');
    }

    async login(email, password) {
        console.log('🔐 [AuthService] Attempting login:', { email });

        try {
            const response = await apiClient.post('/api/v1/login', {
                email,
                password
            });

            console.log('✅ [AuthService] Login successful');

            const accessToken = response.data.accessToken?. token || response.data.accessToken;
            const refreshToken = response.data.refreshToken?.token || response. data.refreshToken;

            this.setTokens(accessToken, refreshToken);

            // Pobierz userId z tokena
            const userId = this.extractUserIdFromToken(accessToken);

            if (userId) {
                storageService.setItem('userId', String(userId));

                // Pobierz pełne dane użytkownika
                const userResponse = await apiClient.get(`/api/v1/user/id/${userId}`);
                storageService.setItem('user', JSON.stringify(userResponse.data));

                return { accessToken, refreshToken, userId, user: userResponse.data };
            }

            return { accessToken, refreshToken, userId: null, user: null };
        } catch (error) {
            console.error('❌ [AuthService] Login failed:', {
                status: error.response?.status,
                message: error.response?.data?.Message || error.message
            });
            throw error;
        }
    }

    async register(userData) {
        console.log('📝 [AuthService] Attempting registration with data:', {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            slackUserId: userData.slackUserId
        });

        try {
            const response = await apiClient.post('/api/v1/register', {
                firstName:  userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password,
                slackUserId: userData.slackUserId
            });

            console.log('✅ [AuthService] Registration successful');

            // Po udanej rejestracji, automatycznie zaloguj użytkownika
            return await this.login(userData.email, userData.password);
        } catch (error) {
            console. error('❌ [AuthService] Registration failed:', {
                status: error.response?.status,
                message: error.response?.data?.Message || error.message
            });
            throw error;
        }
    }

    async refreshTokens() {
        console.log('🔄 [AuthService] Refreshing tokens...');

        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await apiClient. post('/api/v1/auth/regenerate-tokens', {
                refreshToken
            });

            const newAccessToken = response.data.accessToken?.token || response.data.accessToken;
            const newRefreshToken = response.data.refreshToken?.token || response.data.refreshToken;

            this.setTokens(newAccessToken, newRefreshToken);

            console.log('✅ [AuthService] Tokens refreshed');

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        } catch (error) {
            console.error('❌ [AuthService] Token refresh failed');
            throw error;
        }
    }

    extractUserIdFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.sub || payload.userId || payload.nameid || payload.id;
        } catch (error) {
            console.error('❌ [AuthService] Failed to extract userId from token');
            return null;
        }
    }

    setTokens(accessToken, refreshToken) {
        console.log('💾 [AuthService] Saving tokens');

        storageService.setItem('accessToken', accessToken);
        storageService.setItem('refreshToken', refreshToken);

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }

    getAccessToken() {
        return storageService.getItem('accessToken');
    }

    getRefreshToken() {
        return storageService.getItem('refreshToken');
    }

    getCurrentUser() {
        const userStr = storageService.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch {
                return null;
            }
        }
        return null;
    }

    logout() {
        console.log('🚪 [AuthService] Logging out');
        storageService.removeItem('accessToken');
        storageService.removeItem('refreshToken');
        storageService.removeItem('user');
        storageService.removeItem('userId');
        delete apiClient.defaults.headers.common['Authorization'];
    }
}

export const authService = new AuthService();