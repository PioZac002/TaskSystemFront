import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6901';

// Helper:  sprawdź czy token wygasł
function isTokenExpired(token) {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();

        // Token wygasł jeśli zostało mniej niż 30 sekund
        return expirationTime - currentTime < 30000;
    } catch (e) {
        return true;
    }
}

// Helper:  odśwież token jeśli potrzeba
async function ensureValidToken() {
    const accessToken = localStorage.getItem('accessToken');

    if (isTokenExpired(accessToken)) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (! refreshToken) {
            localStorage.clear();
            window.location.href = '/login';
            throw new Error('No refresh token available');
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/api/v1/auth/regenerate-tokens`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const { accessToken:  newAccessToken, refreshToken: newRefreshToken } = response.data;

            if (newAccessToken?. token) {
                localStorage.setItem('accessToken', newAccessToken. token);
                if (newAccessToken.expires) {
                    localStorage.setItem('accessTokenExpiresAt', newAccessToken. expires);
                }
            }

            if (newRefreshToken?.token) {
                localStorage.setItem('refreshToken', newRefreshToken.token);
                if (newRefreshToken. expires) {
                    localStorage. setItem('refreshTokenExpiresAt', newRefreshToken.expires);
                }
            }

            return newAccessToken. token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.clear();
            window. location.href = '/login';
            throw error;
        }
    }

    return accessToken;
}

const apiClient = axios.create({
    baseURL:  API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

// Request interceptor - sprawdź token PRZED wysłaniem
apiClient.interceptors.request.use(
    async (config) => {
        // Pomiń sprawdzanie dla login/register
        if (config.url?. includes('/login') || config.url?.includes('/register')) {
            return config;
        }

        try {
            const validToken = await ensureValidToken();
            if (validToken) {
                config.headers.Authorization = `Bearer ${validToken}`;
            }
        } catch (error) {
            return Promise.reject(error);
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - obsłuż 401 jako fallback
apiClient.interceptors. response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (! refreshToken) {
                localStorage. clear();
                window.location. href = '/login';
                return Promise.reject(error);
            }

            try {
                const response = await axios. post(
                    `${API_BASE_URL}/api/v1/auth/regenerate-tokens`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                if (accessToken?.token) {
                    localStorage.setItem('accessToken', accessToken.token);
                    if (accessToken.expires) {
                        localStorage.setItem('accessTokenExpiresAt', accessToken.expires);
                    }

                    originalRequest.headers. Authorization = `Bearer ${accessToken.token}`;

                    if (newRefreshToken?.token) {
                        localStorage.setItem('refreshToken', newRefreshToken.token);
                        if (newRefreshToken.expires) {
                            localStorage.setItem('refreshTokenExpiresAt', newRefreshToken.expires);
                        }
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;