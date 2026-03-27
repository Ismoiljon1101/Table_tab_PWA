import { useState, useRef, useCallback } from 'react';
import type { Table } from '../types';

/** The pixel size of one grid unit (must match CELL_SIZE_PX in FloorPlanCanvas) */
const CELL_SIZE_PX = 44;

/** Duration in ms before a touch-and-hold triggers drag mode */
const LONG_PRESS_MS = 500;

interface DragState {
    /** The table currently being dragged */
    table: Table;
    /** Current screen position of the drag pointer */
    screenX: number;
    screenY: number;
}

interface UseTableDragOptions {
    /** Canvas element ref — used to calculate grid coordinates from screen position */
    canvasRef: React.RefObject<HTMLDivElement | null>;
    /** Live ref to the current pan offset { x, y } */
    panRef: React.RefObject<{ x: number; y: number }>;
    /** Called when a drag completes, with the new grid position */
    onDropped: (tableId: string, gridX: number, gridY: number) => Promise<void>;
    /** Called when a 1-second static hold is detected (Rotation) */
    onRotate?: (table: Table) => void;
}

/**
 * useTableDrag
 * Manages long-press → drag → drop for admin table repositioning.
 * - 500ms hold: Enter drag mode.
 * - 1000ms hold (without moving): Trigger rotation.
 */
export function useTableDrag({ canvasRef, panRef, onDropped, onRotate }: UseTableDragOptions) {
    const [dragging, setDragging] = useState<DragState | null>(null);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rotateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pressPosRef = useRef<{ x: number; y: number } | null>(null);
    const pointerIdRef = useRef<number | null>(null);

    /** Start long-press countdown for a table */
    const onTableTouchStart = useCallback((table: Table, clientX: number, clientY: number, pointerId: number) => {
        pressPosRef.current = { x: clientX, y: clientY };
        pointerIdRef.current = pointerId;

        // Stage 1: Drag Activation (500ms)
        longPressTimer.current = setTimeout(() => {
            setDragging({ table, screenX: clientX, screenY: clientY });
            
            if (canvasRef.current && pointerIdRef.current !== null) {
                try {
                    canvasRef.current.setPointerCapture(pointerIdRef.current);
                } catch { /* ignored */ }
            }

            // Stage 2: Rotation Trigger (Another 500ms, total 1000ms)
            rotateTimer.current = setTimeout(() => {
                // Only trigger if we are still dragging AND haven't moved much
                if (onRotate) {
                    onRotate(table);
                    setDragging(null); // Reset dragging to avoid conflict with alert/modal
                }
            }, 500);
        }, LONG_PRESS_MS);
    }, [canvasRef, onRotate]);

    /**
     * Cancel the long-press only if the user moves significantly (>10px).
     * Prevents accidental cancellations from finger micro-shaking on mobile.
     */
    const handleMove = useCallback((clientX: number, clientY: number) => {
        if (!pressPosRef.current || (!longPressTimer.current && !rotateTimer.current)) return;
        const dx = clientX - pressPosRef.current.x;
        const dy = clientY - pressPosRef.current.y;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            if (rotateTimer.current) {
                clearTimeout(rotateTimer.current);
                rotateTimer.current = null;
            }
        }
    }, []);

    /** Cancel the long-press timer completely */
    const cancelLongPress = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
        if (rotateTimer.current) {
            clearTimeout(rotateTimer.current);
            rotateTimer.current = null;
        }
        pressPosRef.current = null;
        pointerIdRef.current = null;
    }, []);

    /** Update drag position during move — table follows finger */
    const onDragMove = useCallback((clientX: number, clientY: number) => {
        setDragging(prev => prev ? { ...prev, screenX: clientX, screenY: clientY } : null);

        // If we move more than 10px from start, cancel the rotation timer
        if (rotateTimer.current && pressPosRef.current) {
            const dx = clientX - pressPosRef.current.x;
            const dy = clientY - pressPosRef.current.y;
            if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                clearTimeout(rotateTimer.current);
                rotateTimer.current = null;
            }
        }
    }, []);

    /**
     * Converts a screen pixel position to grid coordinates.
     * Reads pan values from the LIVE ref so the calculation is always accurate.
     */
    const screenToGrid = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const relX = screenX - rect.left;
        const relY = screenY - rect.top;
        const pan = panRef.current;
        const gridX = Math.round((relX - centerX - pan.x) / CELL_SIZE_PX);
        const gridY = Math.round(-(relY - centerY - pan.y) / CELL_SIZE_PX);
        return { x: gridX, y: gridY };
    }, [canvasRef, panRef]);

    /** Finalize drop — release pointer capture, compute grid coord, call onDropped */
    const onDragEnd = useCallback(async (screenX: number, screenY: number) => {
        // Release pointer capture
        if (canvasRef.current && pointerIdRef.current !== null) {
            try {
                canvasRef.current.releasePointerCapture(pointerIdRef.current);
            } catch { /* already released */ }
        }
        cancelLongPress();
        if (!dragging) return;
        
        const { x, y } = screenToGrid(screenX, screenY);
        
        // Call onDropped FIRST (optimistic update happens here)
        // This ensures the parent state reflects the new pos before setDragging(null)
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
