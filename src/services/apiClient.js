import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Pobierz refreshToken i userId
            const refreshToken = localStorage.getItem('refreshToken');
            const userId = localStorage.getItem('userId');
            if (refreshToken && userId) {
                try {
                    // Refresh token
                    const result = await axios.post(
                        `${API_BASE_URL}/api/v1/auth/regenerate-tokens`,
                        { userId: Number(userId), refreshToken }
                    );

                    // Zakładamy, że nowy accessToken i ewentualnie nowy refreshToken są w zwrocie
                    const { accessToken, refreshToken: newRefreshToken } = result.data;
                    if (accessToken) {
                        localStorage.setItem('accessToken', accessToken);
                        if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
                        // Powtórz pierwotny request z nowym tokenem
                        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export { apiClient };
export default apiClient;
