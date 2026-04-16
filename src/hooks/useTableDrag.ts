import { useState, useRef, useCallback } from 'react';
import type { Table } from '../types';

/** The pixel size of one grid unit (must match CELL_SIZE_PX in FloorPlanCanvas) */
const CELL_SIZE_PX = 44;

/** Duration in ms before a touch-and-hold triggers drag mode */
const LONG_PRESS_MS = 500;

interface DragState {
    /** The table currently being dragged */
    table: Table;
    /**
     * Initial finger position when drag was activated (500ms hold).
     * Used ONLY for the ghost's initial JSX style — guarantees no jump on first render.
     * After that, ghostRef direct DOM writes take over for GPU-smooth tracking.
     */
    initialX: number;
    initialY: number;
}

interface UseTableDragOptions {
    /** Canvas element ref — used to calculate grid coordinates from screen position */
    canvasRef: React.RefObject<HTMLDivElement | null>;
    /** Live ref to the current pan offset { x, y } */
    panRef: React.RefObject<{ x: number; y: number }>;
    /**
     * Ref to the drag ghost DOM element.
     * During drag move, we write transform: translate3d directly here —
     * bypassing React reconciliation for 60fps GPU-composited tracking.
     */
    ghostRef: React.RefObject<HTMLButtonElement | null>;
    /** Called when a drag completes, with the new grid position */
    onDropped: (tableId: string, gridX: number, gridY: number) => Promise<void>;
    /** Called when a 1-second static hold is detected (Rotation) */
    onRotate?: (table: Table) => void;
}

/**
 * useTableDrag
 * Manages long-press → drag → drop for admin table repositioning.
 *
 * Flow:
 *  1. Finger down  → start 500ms timer
 *  2. 500ms holds  → setDragging (React state, fires ONE render to mount ghost)
 *                    ghost mounts at initialX/Y (no jump, correct position from JSX)
 *  3. Finger moves → applyGhostPosition writes translate3d to DOM directly (GPU, 0 re-renders)
 *  4. Finger up    → screenToGrid → onDropped → setDragging(null)
 *
 *  Rotation: if finger stays still from step 2 to +500ms, onRotate fires.
 */
export function useTableDrag({ canvasRef, panRef, ghostRef, onDropped, onRotate }: UseTableDragOptions) {
    const [dragging, setDragging] = useState<DragState | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressPosRef = useRef<{ x: number; y: number } | null>(null);
    const pointerIdRef = useRef<number | null>(null);

    /**
     * Write ghost position directly to DOM via translate3d.
     * Forces GPU compositing layer — identical feel to native iOS drag.
     * ghostRef is guaranteed to be mounted before this is ever called (first move event).
     */
    const applyGhostPosition = useCallback((clientX: number, clientY: number) => {
        if (ghostRef.current) {
            ghostRef.current.style.transform =
                `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
        }
    }, [ghostRef]);

    /** Start long-press countdown for a table */
    const onTableTouchStart = useCallback((
        table: Table,
        clientX: number,
        clientY: number,
        pointerId: number,
    ) => {
        pressPosRef.current = { x: clientX, y: clientY };
        pointerIdRef.current = pointerId;

        // Stage 1: Drag Activation (500ms)
        longPressTimer.current = setTimeout(() => {
            /*
             * Bake the exact finger position into DragState.
             * The ghost TableCard mounts with initialX/Y in its JSX style →
             * appears directly under the finger, zero jump.
             */
            setDragging({ table, initialX: clientX, initialY: clientY });

            if (canvasRef.current && pointerIdRef.current !== null) {
                try { canvasRef.current.setPointerCapture(pointerIdRef.current); } catch { /* ignored */ }
            }

            // Stage 2: Rotation Trigger (+500ms more = 1000ms total)
            rotateTimer.current = setTimeout(() => {
                if (onRotate) {
                    onRotate(table);
                    setDragging(null);
                }
            }, 500);
        }, LONG_PRESS_MS);
    }, [canvasRef, onRotate]);

    /**
     * Cancel the long-press timer only if the user moves significantly (>10px).
     * Prevents accidental cancellations from finger micro-shaking on mobile.
     */
    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!pressPosRef.current || (!longPressTimer.current && !rotateTimer.current)) return;
        const dx = clientX - pressPosRef.current.x;
        const dy = clientY - pressPosRef.current.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
            if (rotateTimer.current)   { clearTimeout(rotateTimer.current);   rotateTimer.current   = null; }
        }
    }, []);

    /** Cancel all timers completely */
    const cancelLongPress = useCallback(() => {
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
        if (rotateTimer.current)   { clearTimeout(rotateTimer.current);   rotateTimer.current   = null; }
        pressPosRef.current = null;
        pointerIdRef.current = null;
    }, []);

    /**
     * GPU-accelerated drag move.
     * Writes directly to ghostRef DOM node — zero React state updates during move.
     */
    const onDragMove = useCallback((clientX: number, clientY: number) => {
        applyGhostPosition(clientX, clientY);

        // Cancel rotation if user moved more than 10px
        if (rotateTimer.current && pressPosRef.current) {
            const dx = clientX - pressPosRef.current.x;
            const dy = clientY - pressPosRef.current.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                clearTimeout(rotateTimer.current);
                rotateTimer.current = null;
            }
        }
    }, [applyGhostPosition]);

    /**
     * Convert screen pixel position to grid coordinates.
     * Reads pan from the LIVE ref — always accurate regardless of pan state.
     */
    const screenToGrid = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const pan = panRef.current;
        const gridX = Math.round((screenX - rect.left - rect.width  / 2 - pan.x) / CELL_SIZE_PX);
        const gridY = Math.round(-(screenY - rect.top  - rect.height / 2 - pan.y) / CELL_SIZE_PX);
        return { x: gridX, y: gridY };
    }, [canvasRef, panRef]);

    /** Finalize drop — release capture, compute grid coord, call onDropped */
    const onDragEnd = useCallback(async (screenX: number, screenY: number) => {
        if (canvasRef.current && pointerIdRef.current !== null) {
            try { canvasRef.current.releasePointerCapture(pointerIdRef.current); } catch { /* already released */ }
        }
        cancelLongPress();
        if (!dragging) return;

        const { x, y } = screenToGrid(screenX, screenY);
        // Optimistic update first, then null the drag state
        await onDropped(dragging.table._id, x, y);
        setDragging(null);
    }, [dragging, cancelLongPress, screenToGrid, onDropped, canvasRef]);

    return {
        dragging,
        onTableTouchStart,
        handleMove,
        cancelLongPress,
        onDragMove,
        onDragEnd,
        isDragging: dragging !== null,
    };
}
