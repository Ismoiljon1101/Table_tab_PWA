import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialize WebSocket connection to backend.
 * Should be called after successful authentication.
 */
export function connectSocket(): Socket {
    if (socket?.connected) return socket;

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3500';

    socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('🔌 WebSocket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔌 WebSocket disconnected:', reason);
    });

    return socket;
}

/**
 * Join a specific restaurant's room for real-time events.
 */
export function joinRestaurant(restaurantId: string): void {
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
}
