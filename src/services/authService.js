import apiClient from './apiClient';

const authService = {
    // Login user
    async login(email, password) {
        try {
            const response = await apiClient.post('/api/v1/login', {
                email,
                password
            });

            // Backend zwraca accessToken i refreshToken jako obiekty z polami { token, expires }
            const { accessToken, refreshToken } = response.data;

            if (accessToken?. token) {
                localStorage.setItem('accessToken', accessToken.token);

                if (accessToken.expires) {
                    localStorage.setItem('accessTokenExpiresAt', accessToken.expires);
                }
            }

            if (refreshToken?. token) {
                localStorage.setItem('refreshToken', refreshToken. token);

                if (refreshToken.expires) {
                    localStorage.setItem('refreshTokenExpiresAt', refreshToken. expires);
                }
            }

            // Pobierz userId z JWT tokenu (dekoduj payload)
            if (accessToken?.token) {
                try {
                    const payload = JSON.parse(atob(accessToken.token.split('.')[1]));
                    if (payload.nameid) {
                        localStorage.setItem('userId', payload.nameid);
                    }
                } catch (e) {
                    console.warn('Failed to decode JWT token:', e);
                }
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Register user
    async register(userData) {
        try {
            const response = await apiClient.post('/api/v1/register', userData);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Refresh tokens using refresh token
    async refreshTokens() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await apiClient.post('/api/v1/auth/regenerate-tokens', {
                refreshToken
            });

            // Backend zwraca nowy accessToken i refreshToken jako obiekty
            const { accessToken:  newAccessToken, refreshToken: newRefreshToken } = response.data;

            if (newAccessToken?.token) {
                localStorage.setItem('accessToken', newAccessToken.token);

                if (newAccessToken.expires) {
                    localStorage.setItem('accessTokenExpiresAt', newAccessToken. expires);
                }
            }

            if (newRefreshToken?.token) {
                localStorage.setItem('refreshToken', newRefreshToken.token);

                if (newRefreshToken.expires) {
                    localStorage.setItem('refreshTokenExpiresAt', newRefreshToken.expires);
                }
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('accessTokenExpiresAt');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('refreshTokenExpiresAt');
        localStorage.removeItem('userId');
        localStorage.removeItem('currentUser');
    },

    // Get current user from localStorage
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON. parse(user) : null;
    },

    // Save current user to localStorage
    saveCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return !!token;
    },

    // Check if refresh token is still valid
    isRefreshTokenValid() {
        const expiresAt = localStorage.getItem('refreshTokenExpiresAt');
        if (!expiresAt) return false;

        const expirationDate = new Date(expiresAt);
        return expirationDate > new Date();
    },

    // Handle API errors
    handleError(error) {
        if (error.response) {
            const message = error.response.data?. message || error.response.data?.Message || 'An error occurred';
            return new Error(message);
        } else if (error.request) {
            return new Error('Network error - please check your connection');
        } else {
            return new Error(error.message || 'An unexpected error occurred');
        }
    }
};

export { authService };
export default authService;