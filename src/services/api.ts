import axios from 'axios';

/**
 * Axios instance pre-configured with the backend URL from env.
 * Automatically attaches JWT accessToken from memory.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/v1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

/** In-memory cache + localStorage persistence */
let accessToken: string | null = localStorage.getItem('tabletap_access_token');
let refreshToken: string | null = localStorage.getItem('tabletap_refresh_token');

/** Set tokens after login/register */
export function setTokens(access: string, refresh: string): void {
    accessToken = access;
    refreshToken = refresh;
    localStorage.setItem('tabletap_access_token', access);
    localStorage.setItem('tabletap_refresh_token', refresh);
}

/** Clear tokens on logout */
export function clearTokens(): void {
    accessToken = null;
    refreshToken = null;
    localStorage.removeItem('tabletap_access_token');
    localStorage.removeItem('tabletap_refresh_token');
}

/** Get current access token */
export function getAccessToken(): string | null {
    return accessToken;
}

/** Request interceptor: attach Bearer token and log */
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
});

/** Response interceptor: log and handle 401 → attempt refresh */
api.interceptors.response.use(
    (response) => {
        console.log(`✅ [API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        console.error(`❌ [API Error] ${error.response?.status || 'Network Error'} ${error.config?.url}`, error.response?.data);
        const originalRequest = error.config;

        if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const res = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    {},
                    { headers: { Authorization: `Bearer ${refreshToken}` } },
                );

                const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
                setTokens(newAccess, newRefresh);

                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            } catch {
                console.warn('⚠️ Refresh token failed or expired. Force-logging out.');
                clearTokens();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    },
);

export default api;
