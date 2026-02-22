import { create } from 'zustand';
import type { User, Restaurant } from '../types';
import api, { setTokens, clearTokens } from '../services/api';
import { connectSocket, joinRestaurant, disconnectSocket } from '../services/socket';

interface AuthState {
    /** Current authenticated user, null if not logged in */
    user: User | null;
    /** The restaurant the user belongs to */
    restaurant: Restaurant | null;
    /** Whether auth state is being loaded (e.g. refresh on mount) */
    isLoading: boolean;
    /** Auth error message */
    error: string | null;

    /** Login with email + password */
    login: (email: string, password: string) => Promise<void>;
    /** Register as admin/owner with restaurant name */
    register: (email: string, password: string, nickname: string, restaurantName: string) => Promise<void>;
    /** Register as waiter joining existing restaurant */
    registerWaiter: (email: string, password: string, nickname: string, restaurantId: string) => Promise<void>;
    /** Logout and clear state */
    logout: () => void;
    /** Clear error message */
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    restaurant: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setTokens(data.accessToken, data.refreshToken);
            set({ user: data.user, restaurant: data.restaurant, isLoading: false });

            const sock = connectSocket();
            sock.on('connect', () => joinRestaurant(data.restaurant._id));
            if (sock.connected) joinRestaurant(data.restaurant._id);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || 'Login failed';
            set({ error: message, isLoading: false });
        }
    },

    register: async (email, password, nickname, restaurantName) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/register', {
                email,
                password,
                nickname,
                restaurantName,
                role: 'admin',
            });
            setTokens(data.accessToken, data.refreshToken);
            set({ user: data.user, restaurant: data.restaurant, isLoading: false });

            const sock = connectSocket();
            sock.on('connect', () => joinRestaurant(data.restaurant._id));
            if (sock.connected) joinRestaurant(data.restaurant._id);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || 'Registration failed';
            set({ error: message, isLoading: false });
        }
    },

    registerWaiter: async (email, password, nickname, restaurantId) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.post('/auth/register', {
                email,
                password,
                nickname,
                restaurantId,
                role: 'waiter',
            });
            setTokens(data.accessToken, data.refreshToken);
            set({ user: data.user, restaurant: data.restaurant, isLoading: false });

            const sock = connectSocket();
            sock.on('connect', () => joinRestaurant(data.restaurant._id));
            if (sock.connected) joinRestaurant(data.restaurant._id);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || 'Registration failed';
            set({ error: message, isLoading: false });
        }
    },

    logout: () => {
        clearTokens();
        disconnectSocket();
        set({ user: null, restaurant: null, error: null });
    },

    clearError: () => set({ error: null }),
}));
