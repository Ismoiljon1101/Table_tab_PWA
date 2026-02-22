import { create } from 'zustand';
import type { Order } from '../types';
import api from '../services/api';
import { getSocket } from '../services/socket';

interface OrdersState {
    /** Today's orders for the restaurant */
    orders: Order[];
    /** Loading state */
    isLoading: boolean;
    /** Error state */
    error: string | null;

    /** Fetch today's orders from backend */
    fetchTodayOrders: () => Promise<void>;
    /** Listen for real-time order events via WebSocket */
    subscribeToUpdates: () => () => void;
    /** Update a single order in the local state */
    upsertOrder: (order: Order) => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
    orders: [],
    isLoading: false,
    error: null,

    fetchTodayOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await api.get<Order[]>('/orders/today');
            set({ orders: data, isLoading: false });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message || 'Failed to fetch orders';
            set({ error: message, isLoading: false });
        }
    },

    subscribeToUpdates: () => {
        const socket = getSocket();
        if (!socket) return () => { };

        const handleCreated = (order: Order) => get().upsertOrder(order);
        const handleUpdated = (order: Order) => get().upsertOrder(order);

        socket.on('order-created', handleCreated);
        socket.on('order-updated', handleUpdated);

        return () => {
            socket.off('order-created', handleCreated);
            socket.off('order-updated', handleUpdated);
        };
    },

    upsertOrder: (order) => {
        set((state) => {
            const idx = state.orders.findIndex((o) => o._id === order._id);
            if (idx >= 0) {
                const updated = [...state.orders];
                updated[idx] = order;
                return { orders: updated };
            }
            return { orders: [order, ...state.orders] };
        });
    },
}));
