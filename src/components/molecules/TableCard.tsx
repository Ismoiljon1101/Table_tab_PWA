import React from 'react';
import { TableStatus } from '../../types/enums';
import type { Table } from '../../types';

interface TableCardProps {
    table: Table;
    onClick: () => void;
    index?: number;
    /** Pixel size of one grid unit — from FloorPlanCanvas CELL_SIZE_PX constant */
    cellSize: number;
    /** Pan offset X from useFloorPan */
    panX: number;
    /** Pan offset Y from useFloorPan */
    panY: number;
    /** Whether the current user is an admin (shows drag hint) */
    isAdmin?: boolean;
    /** Whether this specific table is currently being dragged */
    isDraggingThis?: boolean;
    /** Ref forwarded from FloorPlanCanvas — ghostRef drives position via translate3d */
    ghostRef?: React.RefObject<HTMLButtonElement | null>;
    /**
     * Initial finger X when drag was activated.
     * Sets the ghost's first JSX style position so it appears under the finger immediately.
     */
    initialDragX?: number;
    /** Initial finger Y when drag was activated. */
    initialDragY?: number;
    /** Fires when admin starts a long-press with touch position and pointer ID */
    onLongPressStart?: (clientX: number, clientY: number, pointerId: number) => void;
    /** Fires when long-press is cancelled (touch moved or released early) */
    onLongPressCancel?: () => void;
}

/** Status-to-style mapping: Solid 3D (CoC Style) */
const STATUS_THEME: Record<TableStatus, { bg: string, text: string, shadow: string, base: string }> = {
    [TableStatus.AVAILABLE]: { 
        bg: 'bg-[#C1702C]', 
        text: 'text-white', 
        shadow: 'rgba(193, 112, 44, 0.2)',
        base: 'border-b-[#8B4D1A]'
    },
    [TableStatus.OCCUPIED]: { 
        bg: 'bg-amber-500', 
        text: 'text-white', 
        shadow: 'rgba(180, 83, 9, 0.3)',
        base: 'border-b-amber-700'
    },
    [TableStatus.RESERVED]: { 
        bg: 'bg-blue-600', 
        text: 'text-white', 
        shadow: 'rgba(29, 78, 216, 0.3)',
        base: 'border-b-blue-800'
    },
};

/**
 * TableCard molecule
 * Positions itself on the coordinate canvas using the grid formula.
 */
export function TableCard({
    table,
    onClick,
    index = 0,
    cellSize,
    panX,
    panY,
    isAdmin = false,
    isDraggingThis = false,
    ghostRef,
    initialDragX = 0,
    initialDragY = 0,
    onLongPressStart,
    onLongPressCancel,
}: TableCardProps) {
    const theme = STATUS_THEME[table.status] ?? STATUS_THEME[TableStatus.AVAILABLE];

    const cap = table.capacity ?? 2;
    const baseDim = 1 + (Math.max(0, cap - 2) / 2) * 0.6;
    
    const isVertical = (table.height ?? 1) > (table.width ?? 1);
    const safeW = isVertical ? 1 : baseDim;
    const safeH = isVertical ? baseDim : 1;

    const gridStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${safeW * cellSize - 4}px`, 
        height: `${safeH * cellSize - 4}px`,
        left: `calc(50% + ${table.position.x * cellSize + panX}px)`,
        top: `calc(50% + ${-(table.position.y * cellSize) + panY}px)`,
        transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
        animationDelay: `${index * 40}ms`,
        transition: isDraggingThis ? 'none' : 'left 0.2s cubic-bezier(0.2, 0, 0, 1), top 0.2s cubic-bezier(0.2, 0, 0, 1), width 0.3s ease, height 0.3s ease',
        zIndex: isDraggingThis ? 50 : 10,
        touchAction: 'none',
    };

    /**
     * Ghost drag style.
     * position:fixed + translate3d seeded with the initial finger position.
     * After first pointermove, ghostRef.current.style.transform takes over (GPU path).
     * This guarantees the ghost appears directly under the finger with zero jump.
     */
    const draggingStyle: React.CSSProperties = isDraggingThis ? {
        ...gridStyle,
        position: 'fixed',
        left: 0,
        top: 0,
        transform: `translate3d(${initialDragX}px, ${initialDragY}px, 0) translate(-50%, -50%) scale(1.05)`,
        opacity: 0.95,
        boxShadow: `0 20px 40px ${theme.shadow}`,
        cursor: 'grabbing',
        willChange: 'transform',
    } : gridStyle;

    const rawLabel = table.displayName || table.name;
    const cleanLabel = rawLabel.endsWith('.') ? rawLabel.slice(0, -1) : rawLabel;
    const isNarrow = safeW <= 1.2;
    const displayLabel = isNarrow ? cleanLabel.slice(0, 4) : cleanLabel;

    return (
        <button
            ref={isDraggingThis ? ghostRef : undefined}
            data-table={table._id}
            className={`
                flex flex-col items-center justify-center rounded-2xl border-t border-x
                transition-all duration-100 animate-[scaleIn_0.4s_cubic-bezier(0.2,0,0,1)_backwards]
                ${theme.bg} ${theme.text}
                ${isDraggingThis ? '' : 'active:scale-[0.98] active:translate-y-[4px]'} ${isAdmin ? 'cursor-grab' : ''}
                
                /* ── MULTI-LAYER 3D EXTRUSION ── */
                shadow-[
                    0px_1px_0px_#8B4D1A,
                    0px_2px_0px_#8B4D1A,
                    0px_3px_0px_#8B4D1A,
                    0px_4px_0px_#8B4D1A,
                    0px_5px_0px_#8B4D1A,
                    0px_6px_0px_#8B4D1A,
                    0px_12px_24px_-8px_rgba(0,0,0,0.5) /* Deep Ground Shadow */
                ]
                active:shadow-[
                    0px_1px_0px_#8B4D1A,
                    0px_2px_0px_#8B4D1A,
                    0px_4px_8px_-2px_rgba(0,0,0,0.3)
                ]
            `}
            style={{
                ...draggingStyle,
                borderColor: table.status === TableStatus.AVAILABLE ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                borderTopColor: 'rgba(255,255,255,0.3)', // Rim Light
                borderLeftColor: 'rgba(255,255,255,0.1)',
            }}
            onClick={onClick}
            onPointerDown={(e) => {
                if (isAdmin && onLongPressStart) {
                    onLongPressStart(e.clientX, e.clientY, e.pointerId);
                }
            }}
            onPointerUp={onLongPressCancel}
            title={cleanLabel}
        >
            {/* Table Number/Label */}
            <span className={`text-[13px] font-black uppercase tracking-tighter ${isNarrow ? 'overflow-hidden whitespace-nowrap' : 'truncate'}`}>
                {displayLabel}
            </span>

            {/* Capacity / Code Badge */}
            <div className={`flex items-center gap-1 mt-0.5 ${table.status === TableStatus.AVAILABLE ? 'opacity-30' : 'opacity-60'}`}>
                <span className="text-[9px] font-black">{cap}P</span>
                {table.code && (
                    <>
                        <span className="w-0.5 h-0.5 rounded-full bg-current" />
                        <span className="text-[9px] font-black">{table.code}</span>
                    </>
                )}
            </div>
            
            {/* Pulse effect for occupied */}
            {table.status === TableStatus.OCCUPIED && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 animate-pulse pointer-events-none" />
            )}
        </button>
    );
}
