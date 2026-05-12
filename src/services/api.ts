import axios from 'axios';

/**
 * Axios instance pre-configured with the backend URL from env.
 * withCredentials: true ensures cookies (HttpOnly tokens) are sent automatically.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/v1',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: 15000,
});

console.log('📡 [API] Base URL configured as:', api.defaults.baseURL);

/** Request interceptor: log requests */
api.interceptors.request.use((config) => {
    if (!import.meta.env.PROD) {
        console.log(`🚀 [API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
});

/** Handle concurrent refresh attempts (still needed if multiple requests fail at once) */
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

/** Response interceptor: log and handle 401 → attempt refresh (via cookies) */
api.interceptors.response.use(
    (response) => {
        const isProd = import.meta.env.PROD;
        if (!isProd) {
            console.log(`✅ [API] ${response.status} ${response.config.url}`, response.data);
        } else {
            console.log(`✅ [API] ${response.status} ${response.config.url?.split('?')[0]}`);
        }
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const originalRequest = config;

        // Prevent recursion: Don't retry if the request itself is an auth endpoint
        const isAuthRequest = 
            originalRequest.url?.includes('auth/me') || 
            originalRequest.url?.includes('auth/refresh') || 
            originalRequest.url?.includes('auth/login');

        if (response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => {
                        return api(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 Session expired, attempting headless refresh...');
                // Just calling the endpoint is enough; browser attaches refreshToken cookie
                await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { withCredentials: true },
                );

                console.log('✅ Refresh successful, retrying original request.');
                processQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);
                console.warn('⚠️ Session expired completely. Manual login required.');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        if (response?.status === 401 && isAuthRequest) {
            console.warn(`🛑 Auth request failed: ${originalRequest.url}. Stopping retry loop.`);
        }

        return Promise.reject(error);
    },
);

export default api;
