import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
/** Stored so we can re-join on reconnect */
let activeRestaurantId: string | null = null;

/**
 * Initialize WebSocket connection to backend.
 * Should be called after successful authentication.
 * Includes auto-reconnect with restaurant room re-join.
 */
export function connectSocket(): Socket {
    if (socket?.connected) return socket;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3500';

    socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected:', socket?.id);
        // Re-join restaurant room after reconnect (covers sleep/background recovery)
        if (activeRestaurantId) {
            socket?.emit('joinRestaurant', activeRestaurantId);
            console.log('🔌 Re-joined restaurant room:', activeRestaurantId);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.warn('🔌 WebSocket connection error:', err.message);
    });

    return socket;
}

/**
 * Join a specific restaurant's room for real-time events.
 * Stores the restaurantId so it can be re-joined on reconnect.
 */
export function joinRestaurant(restaurantId: string): void {
    activeRestaurantId = restaurantId;
    if (!socket?.connected) return;
    socket.emit('joinRestaurant', restaurantId);
}

/**
 * Get the current socket instance.
 */
export function getSocket(): Socket | null {
    return socket;
}

/**
 * Disconnect and cleanup.
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    activeRestaurantId = null;
}
