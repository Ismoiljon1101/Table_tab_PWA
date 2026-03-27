import { useState, useRef, useCallback, useEffect } from 'react';
import { Users, Plus, Crosshair } from 'lucide-react';
import { Button } from '../atoms/Button';
import { TableCard } from '../molecules/TableCard';
import { useTableDrag } from '../../hooks/useTableDrag';
import { useAuthStore } from '../../stores/authStore';
import { AlignmentPicker } from '../molecules/AlignmentPicker';
import api from '../../services/api';
import type { Table } from '../../types';

/**
 * CELL_SIZE_PX
 * Pixel size of one grid coordinate unit.
 * Standard restaurant table = 2×1 units → 88×44px on screen.
 * This gives ~4 tables across a 375px mobile screen at 1-unit spacing.
 */
const CELL_SIZE_PX = 44;

const PAN_KEY_PREFIX = 'floor_pan_';

interface FloorPlanCanvasProps {
    tables: Table[];
    isAdmin: boolean;
    onTableTap: (table: Table) => void;
    onAddTables: () => void;
    onTableMoved?: (tableId: string, x: number, y: number) => void;
    onTableUpdate?: (tableId: string, updates: Partial<Table>) => void;
}

/**
 * FloorPlanCanvas organism
 *
 * Key implementation: Tables + grid live inside a single wrapper div.
 * Pan transforms are applied DIRECTLY to the DOM via refs — zero React
 * re-renders during panning. Momentum/inertia on pointer-up via RAF.
 * This gives smooth 60fps feel identical to Google Maps.
 */
export function FloorPlanCanvas({ 
    tables, 
    isAdmin, 
    onTableTap, 
    onAddTables, 
    onTableMoved, 
    onTableUpdate 
}: FloorPlanCanvasProps) {
    const [rotationTarget, setRotationTarget] = useState<Table | null>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<HTMLDivElement>(null); // transform target for all tables
    const gridRef = useRef<HTMLDivElement>(null);  // grid overlay
    const originRef = useRef<HTMLDivElement>(null); // crosshair
    const restaurant = useAuthStore((s) => s.restaurant);

    /* ─── Pan state (no React state — pure refs for performance) ─── */
    const panRef = useRef({ x: 0, y: 0 });
    const dragStartRef = useRef<{ px: number; py: number; cx: number; cy: number } | null>(null);
    const velocityRef = useRef({ vx: 0, vy: 0 });
    const lastMoveRef = useRef({ x: 0, y: 0, t: 0 });
    const rafRef = useRef<number | null>(null);

    const getKey = useCallback(() => `${PAN_KEY_PREFIX}${restaurant?._id || 'default'}`, [restaurant?._id]);

    /** Apply pan to DOM elements directly — skips React render tree */
    const applyPan = useCallback((x: number, y: number) => {
        panRef.current = { x, y };
        if (sceneRef.current)  sceneRef.current.style.transform  = `translate(${x}px, ${y}px)`;
        if (gridRef.current)   gridRef.current.style.backgroundPosition = `calc(50% + ${x}px) calc(50% + ${y}px)`;
        if (originRef.current) {
            originRef.current.style.left = `calc(50% + ${x}px)`;
            originRef.current.style.top  = `calc(50% + ${y}px)`;
        }
    }, []);

    const persistPan = useCallback(() => {
        try { localStorage.setItem(getKey(), JSON.stringify(panRef.current)); } catch { /* ignore */ }
    }, [getKey]);

    /** Load saved pan on mount */
    useEffect(() => {
        try {
            const s = localStorage.getItem(getKey());
            if (s) { const p = JSON.parse(s) as { x: number; y: number }; applyPan(p.x, p.y); }
        } catch { /* ignore */ }
    }, [getKey, applyPan]);

    /* ─── Table drag hook (needs pan for grid coordinate calc) ─── */
    const handleDropped = useCallback(async (tableId: string, gridX: number, gridY: number) => {
        // Optimistic update: notify parent immediately to prevent "trip" back to old pos
        onTableMoved?.(tableId, gridX, gridY);
        try {
            await api.patch(`/tables/${tableId}`, { position: { x: gridX, y: gridY } });
        } catch (err) { 
            console.error('Failed to save table position:', err);
            // Optional: fetch tables again on error to revert to server state
        }
    }, [onTableMoved]);

    const handleRotate = useCallback((table: Table) => {
        setRotationTarget(table);
    }, []);

    const performRotation = async (orientation: 'H' | 'V') => {
        if (!rotationTarget) return;
        const table = rotationTarget;
        
        // H = 2x1, V = 1x2 (in base schema units).
        // TableCard uses these to determine orientation, magnitude is capacity-based.
        const newWidth = orientation === 'H' ? 2 : 1;
        const newHeight = orientation === 'H' ? 1 : 2;

        onTableUpdate?.(table._id, { width: newWidth, height: newHeight });
        setRotationTarget(null);

        try {
            await api.patch(`/tables/${table._id}`, { width: newWidth, height: newHeight });
        } catch (err) {
            console.error('Failed to save rotation:', err);
        }
    };

    const { dragging, onTableTouchStart, handleMove, cancelLongPress, onDragMove, onDragEnd, isDragging } = useTableDrag({
        canvasRef,
        panRef,
        onDropped: handleDropped,
        onRotate: handleRotate,
    });

    /* ─── Pointer handlers (must after useTableDrag to use its returns) ─── */
    const isPanningRef = useRef(false);

    const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('[data-table]')) return;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        isPanningRef.current = true;
        dragStartRef.current = { px: panRef.current.x, py: panRef.current.y, cx: e.clientX, cy: e.clientY };
        lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
        velocityRef.current = { vx: 0, vy: 0 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, []);

    const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
        if (isDragging) { 
            onDragMove(e.clientX, e.clientY); 
            return; 
        }
        
        // Help determine if a long-press on a table should be cancelled
        handleMove(e.clientX, e.clientY);

        if (!isPanningRef.current || !dragStartRef.current) return;

        const dx = e.clientX - dragStartRef.current.cx;
        const dy = e.clientY - dragStartRef.current.cy;
        applyPan(dragStartRef.current.px + dx, dragStartRef.current.py + dy);

        // Track velocity for momentum
        const now = performance.now();
        const dt = now - lastMoveRef.current.t;
        if (dt > 0) {
            const rawVx = (e.clientX - lastMoveRef.current.x) / dt;
            const rawVy = (e.clientY - lastMoveRef.current.y) / dt;
            velocityRef.current = { vx: rawVx * 0.6 + velocityRef.current.vx * 0.4, vy: rawVy * 0.6 + velocityRef.current.vy * 0.4 };
        }
        lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
    }, [isDragging, onDragMove, handleMove, applyPan]);

    const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
        if (isDragging) { 
            onDragEnd(e.clientX, e.clientY); 
            return; 
        }
        if (!isPanningRef.current) {
            cancelLongPress();
            return;
        }
        isPanningRef.current = false;
        dragStartRef.current = null;

        // Momentum — decelerate with friction
        let { vx, vy } = velocityRef.current;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed < 0.1) { persistPan(); return; }

        const FRICTION = 0.88;
        const MIN = 0.05;
        let cvx = vx * 14;
        let cvy = vy * 14;

        const step = () => {
            cvx *= FRICTION;
            cvy *= FRICTION;
            applyPan(panRef.current.x + cvx, panRef.current.y + cvy);
            if (Math.abs(cvx) > MIN || Math.abs(cvy) > MIN) {
                rafRef.current = requestAnimationFrame(step);
            } else {
                rafRef.current = null;
                persistPan();
            }
        };
        rafRef.current = requestAnimationFrame(step);
    }, [isDragging, onDragEnd, cancelLongPress, applyPan, persistPan]);

    const resetPan = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        applyPan(0, 0);
        persistPan();
    }, [applyPan, persistPan]);

    /* ─── Empty state ─── */
    if (tables.length === 0) {
        return (
            <div className="flex flex-col items-center gap-3 py-16 px-4 text-center bg-white rounded-3xl border-2 border-dashed border-stone-200">
                <Users size={48} className="text-stone-300" />
                <h3 className="text-lg font-semibold text-stone-900">No tables yet</h3>
                <p className="text-stone-500 mb-2 max-w-[200px] mx-auto text-sm">Add tables from the Management page.</p>
                {isAdmin && (
                    <Button variant="primary" onClick={onAddTables}>
                        <Plus size={18} className="mr-2" /> Add Tables
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div
            ref={canvasRef}
            className="relative w-full h-full overflow-hidden bg-stone-50 rounded-3xl border border-stone-200/60 shadow-inner cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
        >
            {/* Dot grid — moves with pan via ref, never triggers React render */}
            <div
                ref={gridRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
                    backgroundSize: `${CELL_SIZE_PX}px ${CELL_SIZE_PX}px`,
                    backgroundPosition: '50% 50%',
                    opacity: 0.5,
                }}
            />

            {/* Origin crosshair */}
            <div
                ref={originRef}
                className="absolute pointer-events-none"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="absolute w-[200vw] h-[1px] bg-amber-300/40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute h-[200vh] w-[1px] bg-amber-300/40 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 border-2 border-amber-400 shadow-sm">
                    <Crosshair size={12} className="text-amber-500" />
                </div>
            </div>

            {/*
              Scene container: pan applied HERE as transform, not on each table.
              Tables are positioned relative to canvas center with NO panX/panY offset.
              IMPORTANT: The dragged table is rendered OUTSIDE this div (see below)
              because CSS transforms create a containing block for position:fixed children.
            */}
            <div
                ref={sceneRef}
                className="absolute inset-0"
                style={{ willChange: 'transform' }}
            >
                {tables.map((table, idx) => {
                    // Skip the table being dragged — it renders outside sceneRef
                    if (dragging?.table._id === table._id) return null;
                    return (
                        <TableCard
                            key={table._id}
                            table={table}
                            index={idx}
                            cellSize={CELL_SIZE_PX}
                            panX={0}
                            panY={0}
                            isAdmin={isAdmin}
                            isDraggingThis={false}
                            onClick={() => !isDragging && onTableTap(table)}
                            onLongPressStart={(cx, cy, pid) => isAdmin && onTableTouchStart(table, cx, cy, pid)}
                            onLongPressCancel={cancelLongPress}
                        />
                    );
                })}
            </div>

            {/*
              Drag ghost — rendered OUTSIDE sceneRef so position:fixed
              is truly relative to the viewport, not offset by the scene transform.
            */}
            {dragging && (
                <TableCard
                    key={`drag-${dragging.table._id}`}
                    table={dragging.table}
                    index={0}
                    cellSize={CELL_SIZE_PX}
                    panX={0}
                    panY={0}
                    isAdmin={isAdmin}
                    isDraggingThis={true}
                    draggingScreenX={dragging.screenX}
                    draggingScreenY={dragging.screenY}
                    onClick={() => {}}
                    onLongPressCancel={cancelLongPress}
                />
            )}

            {/* Reset to origin */}
            <button
                className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-xs text-stone-500 font-medium shadow-sm active:scale-95 transition-transform z-20"
                onClick={resetPan}
            >
                <Crosshair size={12} /> Origin
            </button>

            {/* Rotation Modal */}
            {rotationTarget && (
                <AlignmentPicker 
                    tableName={rotationTarget.name}
                    onClose={() => setRotationTarget(null)}
                    onSelect={performRotation}
                />
            )}
        </div>
    );
}
