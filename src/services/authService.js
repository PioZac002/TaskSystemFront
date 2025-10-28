import apiClient from './apiClient';

const authService = {
    // Login user
    async login(email, password) {
        try {
            const response = await apiClient.post('/api/v1/login', {
                email,
                password
            });

            const { accessToken } = response.data;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
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

    // Refresh access token
    async refreshToken(userId) {
        try {
            const response = await apiClient.post('/api/v1/auth/regenerate-access-token', {
                userId
            });

            const { accessToken } = response.data;
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    },

    // Logout user
    logout() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
    },

    // Get current user from token
    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('accessToken');
        return !!token;
    },

    // Handle API errors
    handleError(error) {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || 'An error occurred';
            return new Error(message);
        } else if (error.request) {
            // Request made but no response
            return new Error('Network error - please check your connection');
        } else {
            // Something else happened
            return new Error('An unexpected error occurred');
        }
    }
};

export { authService };
export default authService;
