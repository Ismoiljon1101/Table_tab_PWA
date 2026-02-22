import axios from 'axios';

/**
 * Axios instance pre-configured with the backend URL from env.
 * Automatically attaches JWT accessToken from memory.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

/** In-memory token storage (NOT localStorage for security) */
let accessToken: string | null = null;
let refreshToken: string | null = null;

/** Set tokens after login/register */
export function setTokens(access: string, refresh: string): void {
    accessToken = access;
    refreshToken = refresh;
}

/** Clear tokens on logout */
export function clearTokens(): void {
    accessToken = null;
    refreshToken = null;
}

/** Get current access token */
export function getAccessToken(): string | null {
    return accessToken;
}

/** Request interceptor: attach Bearer token */
api.interceptors.request.use((config) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

/** Response interceptor: handle 401 → attempt refresh */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
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
                clearTokens();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    },
);

export default api;
