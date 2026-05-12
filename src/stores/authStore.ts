import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Restaurant } from '../types';
import api from '../services/api';
import { connectSocket, joinRestaurant, disconnectSocket } from '../services/socket';

interface AuthState {
    /** Current authenticated user, null if not logged in */
    user: User | null;
    /** The restaurant the user belongs to */
    restaurant: Restaurant | null;
    /** Whether the initial background auth check has completed */
    isAppReady: boolean;
    /** Whether an active auth request (login/register) is in progress */
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
    logout: () => Promise<void>;
    /** Headless silent refresh on app mount */
    checkAuth: () => Promise<void>;
    /** Refresh current session (rolling cookie) */
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
            isAppReady: false, // Controls the splash screen
            isLoading: false,  // Controls the login button spinners
            error: null,
            currentFloorName: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await api.post('/auth/login', { email, password });
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

            logout: async () => {
                try { await api.post('/auth/logout'); } catch { /* ignore */ }
                disconnectSocket();
                set({ user: null, restaurant: null, error: null });
            },

            checkAuth: async () => {
                try {
                    console.log('🔍 [Auth] Verifying session...');
                    
                    // Parallelize requests to eliminate sequential latency
                    const [userRes, restRes] = await Promise.all([
                        api.get('/auth/me'),
                        api.get('/restaurants/me')
                    ]);
                    
                    const user = userRes.data;
                    const restaurant = restRes.data;

                    if (!user) throw new Error('No user data');
                    
                    set({ 
                        user, 
                        restaurant, 
                        isAppReady: true 
                    });

                    // Auto-connect socket without blocking the UI thread
                    setTimeout(() => {
                        try {
                            const sock = connectSocket();
                            sock.on('connect', () => joinRestaurant(restaurant._id));
                            if (sock.connected) joinRestaurant(restaurant._id);
                        } catch (sockErr) {
                            console.warn('⚠️ Socket connection failed during init', sockErr);
                        }
                    }, 0);
                    
                    console.log('✅ [Auth] Session verified');
                } catch (err) {
                    console.warn('❌ [Auth] Session verification failed');
                    disconnectSocket();
                    localStorage.removeItem('tabletap_auth_storage');
                    set({ user: null, restaurant: null, isAppReady: true });
                }
            },

            refreshSession: async () => {
                try {
                    // Simple "touch" to extend the cookie
                    await api.post('/auth/refresh');
                } catch (err) {
                    console.warn('Session refresh failed');
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
