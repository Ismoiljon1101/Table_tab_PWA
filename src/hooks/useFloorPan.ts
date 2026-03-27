import { useState, useCallback, useRef } from 'react';

interface PanState {
    panX: number;
    panY: number;
}

const PAN_KEY_PREFIX = 'floor_pan_';

/**
 * useFloorPan
 * Manages pan offset of the floor canvas with momentum/inertia.
 * Persists last position to localStorage per restaurant.
 *
 * Momentum: On pointer-up, the canvas continues to glide based
 * on the last known velocity, decelerating with friction.
 * This produces the smooth Google Maps-like feel.
 */
export function useFloorPan(restaurantId: string | undefined) {
    const getStorageKey = () => `${PAN_KEY_PREFIX}${restaurantId || 'default'}`;

    const getInitialPan = (): PanState => {
        try {
            const stored = localStorage.getItem(getStorageKey());
            if (stored) return JSON.parse(stored) as PanState;
        } catch {
            // Ignore parse errors
        }
        return { panX: 0, panY: 0 };
    };

    const [pan, setPan] = useState<PanState>(getInitialPan);

    /** Tracking touch start and velocity */
    const startRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
    const velocityRef = useRef({ vx: 0, vy: 0 });
    const lastMoveRef = useRef({ x: 0, y: 0, t: 0 });
    const animFrameRef = useRef<number | null>(null);

    /** Call when a pan gesture begins */
    const onPanStart = useCallback((clientX: number, clientY: number) => {
        // Stop any ongoing momentum animation
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        startRef.current = { x: clientX, y: clientY, panX: pan.panX, panY: pan.panY };
        lastMoveRef.current = { x: clientX, y: clientY, t: performance.now() };
        velocityRef.current = { vx: 0, vy: 0 };
    }, [pan]);

    /** Call on every move event during a pan */
    const onPanMove = useCallback((clientX: number, clientY: number) => {
        if (!startRef.current) return;
        const dx = clientX - startRef.current.x;
        const dy = clientY - startRef.current.y;
        setPan({
            panX: startRef.current.panX + dx,
            panY: startRef.current.panY + dy,
        });

        // Track velocity (smoothed over last frame)
        const now = performance.now();
        const dt = now - lastMoveRef.current.t;
        if (dt > 0) {
            const dvx = (clientX - lastMoveRef.current.x) / dt;
            const dvy = (clientY - lastMoveRef.current.y) / dt;
            // Exponential smoothing for less jitter
            velocityRef.current = {
                vx: dvx * 0.8 + velocityRef.current.vx * 0.2,
                vy: dvy * 0.8 + velocityRef.current.vy * 0.2,
            };
        }
        lastMoveRef.current = { x: clientX, y: clientY, t: now };
    }, []);

    /** Persist current pan state to storage */
    const persist = useCallback((state: PanState) => {
        try {
            localStorage.setItem(getStorageKey(), JSON.stringify(state));
        } catch {
            // Ignore storage errors
        }
    }, [restaurantId]);

    /** Call when the pan gesture ends — kicks off momentum */
    const onPanEnd = useCallback(() => {
        if (!startRef.current) return;
        startRef.current = null;

        const { vx, vy } = velocityRef.current;
        const speed = Math.sqrt(vx * vx + vy * vy);

        // Only apply momentum if finger was moving fast enough
        if (speed < 0.15) {
            setPan(current => { persist(current); return current; });
            return;
        }

        // Momentum animation loop
        const FRICTION = 0.94;      // Deceleration factor per frame
        const MIN_SPEED = 0.02;     // Stop threshold
        let cvx = vx * 16;          // Convert per-ms velocity to per-frame (≈16ms)
        let cvy = vy * 16;

        const step = () => {
            cvx *= FRICTION;
            cvy *= FRICTION;

            if (Math.abs(cvx) < MIN_SPEED && Math.abs(cvy) < MIN_SPEED) {
                animFrameRef.current = null;
                setPan(current => { persist(current); return current; });
                return;
            }

            setPan(prev => ({
                panX: prev.panX + cvx,
                panY: prev.panY + cvy,
            }));

            animFrameRef.current = requestAnimationFrame(step);
        };

        animFrameRef.current = requestAnimationFrame(step);
    }, [persist]);

    /** Reset pan to origin (0,0) with smooth animation */
    const resetPan = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        const reset: PanState = { panX: 0, panY: 0 };
        setPan(reset);
        persist(reset);
    }, [persist]);

    return { pan, onPanStart, onPanMove, onPanEnd, resetPan };
}
