import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
    /** Currently selected floor/section name for the header */
    currentFloorName: string | null;

    /** Login with email + password */
    login: (email: string, password: string) => Promise<void>;
    /** Register as admin/owner with restaurant name */
    register: (email: string, password: string, nickname: string, restaurantName: string) => Promise<void>;
    /** Register as waiter joining existing restaurant */
    registerWaiter: (email: string, password: string, nickname: string, restaurantId: string) => Promise<void>;
    /** Logout and clear state */
    logout: () => void;
    /** Refresh current session to extend validity (sliding window) */
    refreshSession: () => Promise<void>;
    /** Clear error message */
    clearError: () => void;
    /** Set current floor name */
    setCurrentFloorName: (name: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            restaurant: null,
            isLoading: false,
            error: null,
            currentFloorName: null,

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
                        role: 'owner',
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

            refreshSession: async () => {
                try {
                    const { data } = await api.post('/auth/refresh');
                    setTokens(data.accessToken, data.refreshToken);
                    set({ user: data.user, restaurant: data.restaurant });

                    const sock = connectSocket();
                    if (!sock.connected) {
                        sock.on('connect', () => joinRestaurant(data.restaurant._id));
                    } else {
                        joinRestaurant(data.restaurant._id);
                    }
                } catch (err) {
                    console.warn('Session refresh failed, user may need to re-login eventually');
                }
            },

            clearError: () => set({ error: null }),

            setCurrentFloorName: (name) => set({ currentFloorName: name }),
        }),
        {
            name: 'tabletap_auth_storage',
            partialize: (state) => ({ user: state.user, restaurant: state.restaurant }),
        }
    )
);
