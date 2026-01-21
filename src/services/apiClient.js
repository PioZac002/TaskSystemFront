import axios from 'axios';
import { storageService } from './storageService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://vfedora1.tail7fa028.ts. net: 6901';

const apiClient = axios. create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('🔧 [API Client] Initialized with baseURL:', API_BASE_URL);

// Request interceptor - dodaj access token
apiClient.interceptors. request.use(
    (config) => {
        // ✅ Używaj storageService zamiast localStorage
        const token = storageService.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔑 [API Request]', {
                url: config.url,
                method: config.method,
                hasToken: true
            });
        } else {
            console.log('📝 [API Request]', {
                url: config. url,
                method: config. method,
                hasToken: false
            });
        }
        return config;
    },
    (error) => {
        console.error('❌ [API Request] Error:', error. message);
        return Promise.reject(error);
    }
);

// Response interceptor - obsługa 401 i refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    console.log('🔄 [Token Queue] Processing:', {
        queueLength: failedQueue.length,
        success: ! error
    });

    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ [API Response]', {
            url: response.config.url,
            status: response.status
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.error('❌ [API Response] Error:', {
            url: originalRequest?. url,
            status: error. response?.status,
            message: error.response?.data?.Message || error.message
        });

        // Jeśli 401 i nie jest to już retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            console.log('🔐 [Token Refresh] 401 detected, attempting refresh...');

            // Jeśli to endpoint login/register - nie próbuj refreshować
            if (originalRequest.url?. includes('/login') || originalRequest.url?.includes('/register')) {
                console. log('⚠️ [Token Refresh] Skipping refresh for auth endpoint');
                return Promise.reject(error);
            }

            if (isRefreshing) {
                console.log('⏳ [Token Refresh] Already refreshing, queuing request.. .');
                return new Promise((resolve, reject) => {
                    failedQueue. push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            // ✅ Używaj storageService
            const refreshToken = storageService.getItem('refreshToken');

            if (!refreshToken) {
                console.error('❌ [Token Refresh] No refresh token, logging out...');
                isRefreshing = false;

                // Wyczyść storage i przekieruj do loginu
                storageService.clear();
                window.location.href = '/login';

                return Promise.reject(error);
            }

            console.log('🔄 [Token Refresh] Refreshing with token:', refreshToken. substring(0, 20) + '...');

            try {
                const response = await axios.post(
                    `${API_BASE_URL}/api/v1/auth/regenerate-tokens`,
                    {
                        refreshToken: refreshToken
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                console.log('✅ [Token Refresh] Success!', response.data);

                // Backend zwraca:  TokenResponseDto { AccessToken:  {Token, Expires}, RefreshToken: {Token, Expires} }
                const newAccessToken = response.data.accessToken?. token || response.data.accessToken;
                const newRefreshToken = response.data.refreshToken?.token || response.data.refreshToken;

                if (! newAccessToken) {
                    throw new Error('No access token in refresh response');
                }

                // ✅ Zapisz nowe tokeny używając storageService
                storageService.setItem('accessToken', newAccessToken);

                if (newRefreshToken) {
                    storageService.setItem('refreshToken', newRefreshToken);
                }

                // Zaktualizuj header
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                apiClient. defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                // Przetwórz kolejkę
                processQueue(null, newAccessToken);
                isRefreshing = false;

                console.log('🔄 [Token Refresh] Retrying original request:', originalRequest.url);
                return apiClient(originalRequest);

            } catch (refreshError) {
                console.error('❌ [Token Refresh] Failed:', {
                    status: refreshError.response?.status,
                    message: refreshError. response?.data?.Message || refreshError.message,
                    data: refreshError.response?.data
                });

                processQueue(refreshError, null);
                isRefreshing = false;

                // Wyczyść storage i przekieruj
                storageService.clear();
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;