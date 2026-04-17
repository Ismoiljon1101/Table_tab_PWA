import { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Crosshair, Lock, LockOpen } from 'lucide-react';
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
    const ghostRef = useRef<HTMLButtonElement>(null); // drag ghost — direct DOM position
    const restaurant = useAuthStore((s) => s.restaurant);
    const [isLocked, setIsLocked] = useState(false);

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

        /*
         * Swap the existing dimensions rather than hardcoding 2/1.
         * H → wider dimension becomes width (landscape).
         * V → wider dimension becomes height (portrait).
         */
        const w = table.width ?? 1;
        const h = table.height ?? 1;
        const larger  = Math.max(w, h);
        const smaller = Math.min(w, h);
        const newWidth  = orientation === 'H' ? larger  : smaller;
        const newHeight = orientation === 'H' ? smaller : larger;

        onTableUpdate?.(table._id, { width: newWidth, height: newHeight });
        setRotationTarget(null);

        try {
            await api.patch(`/tables/${table._id}`, { width: newWidth, height: newHeight });
        } catch (err) {
            console.error('Failed to save rotation:', err);
        }
    };

    const { dragging, onTableTouchStart, handleMove, cancelLongPress, onDragMove, onDragEnd, isDragging, ignoreNextTap } = useTableDrag({
        canvasRef,
        panRef,
        ghostRef,
        onDropped: handleDropped,
        onRotate: handleRotate,
    });

    /* ─── Pointer handlers (must after useTableDrag to use its returns) ─── */
    const isPanningRef = useRef(false);

    const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('[data-table]')) return;
        if (isLocked) return; // Ignore panning if locked
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        isPanningRef.current = true;
        dragStartRef.current = { px: panRef.current.x, py: panRef.current.y, cx: e.clientX, cy: e.clientY };
        lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
        velocityRef.current = { vx: 0, vy: 0 };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }, [isLocked]);

    const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
        if (isDragging) { 
            onDragMove(e.clientX, e.clientY); 
            return; 
        }
        
        // Help determine if a long-press on a table should be cancelled
        handleMove(e.clientX, e.clientY);

        if (isLocked || !isPanningRef.current || !dragStartRef.current) return;

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
    }, [isDragging, onDragMove, handleMove, applyPan, isLocked]);

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
            className="relative w-full h-full overflow-hidden bg-[#fafafa] rounded-3xl border border-stone-200/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.01)] cursor-grab active:cursor-grabbing select-none touch-none"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
            onPointerLeave={handleCanvasPointerUp}
        >
            {/* ── HYBRID GRID SYSTEM (dots + subtle lines) ── */}
            <div
                ref={gridRef}
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle, #e2e8f0 1.2px, transparent 1.2px),
                        linear-gradient(to right, #f1f1f1 0.5px, transparent 0.5px),
                        linear-gradient(to bottom, #f1f1f1 0.5px, transparent 0.5px)
                    `,
                    backgroundSize: `
                        ${CELL_SIZE_PX}px ${CELL_SIZE_PX}px,
                        ${CELL_SIZE_PX}px ${CELL_SIZE_PX}px,
                        ${CELL_SIZE_PX}px ${CELL_SIZE_PX}px
                    `,
                    backgroundPosition: '50% 50%',
                }}
            />


            {/* Subtle Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.015)_100%)]" />

            {/* Origin Crosshair */}
            <div
                ref={originRef}
                className="absolute pointer-events-none"
                style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
                <div className="relative flex items-center justify-center w-6 h-6 rounded-full border border-stone-300 bg-white/80 shadow-sm backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-stone-500" />
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
                            onClick={() => !isDragging && !ignoreNextTap && onTableTap(table)}
                            onLongPressStart={(cx, cy, pid) => isAdmin && onTableTouchStart(table, cx, cy, pid)}
                            onLongPressCancel={cancelLongPress}
                        />
                    );
                })}
            </div>

            {/*
              Drag ghost — rendered OUTSIDE sceneRef so position:fixed
              is truly relative to the viewport, not offset by the scene transform.
              Position is driven by ghostRef direct DOM mutation (GPU translate3d).
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
                    ghostRef={ghostRef}
                    initialDragX={dragging.initialX}
                    initialDragY={dragging.initialY}
                    onClick={() => {}}
                    onLongPressCancel={cancelLongPress}
                />
            )}

            {/* Controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-20">
                <button
                    className={`flex items-center justify-center w-9 h-9 backdrop-blur-sm border rounded-full shadow-sm active:scale-95 transition-all ${isLocked ? 'bg-red-500 border-red-600 text-white' : 'bg-white/90 border-stone-200 text-stone-500'}`}
                    onClick={() => setIsLocked(!isLocked)}
                    title={isLocked ? 'Unlock Floor' : 'Lock Floor'}
                >
                    {isLocked ? <Lock size={16} /> : <LockOpen size={16} />}
                </button>

                <button
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-full text-xs text-stone-500 font-medium shadow-sm active:scale-95 transition-transform"
                    onClick={resetPan}
                >
                    <Crosshair size={12} /> Origin
                </button>
            </div>

            {/* Rotation Modal — portalled to document.body to escape transformed stacking context */}
            {rotationTarget && createPortal(
                <AlignmentPicker 
                    tableName={rotationTarget.name}
                    onClose={() => setRotationTarget(null)}
                    onSelect={performRotation}
                />,
                document.body
            )}
        </div>
    );
}
