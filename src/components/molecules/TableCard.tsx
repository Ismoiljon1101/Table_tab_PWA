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
    /** Screen X while dragging (overrides computed position) */
    draggingScreenX?: number;
    /** Screen Y while dragging (overrides computed position) */
    draggingScreenY?: number;
    /** Fires when admin starts a long-press with touch position and pointer ID */
    onLongPressStart?: (clientX: number, clientY: number, pointerId: number) => void;
    /** Fires when long-press is cancelled (touch moved or released early) */
    onLongPressCancel?: () => void;
}

/** Status-to-style mapping: Solid 3D (CoC Style) */
const STATUS_THEME: Record<TableStatus, { bg: string, text: string, shadow: string, base: string }> = {
    [TableStatus.AVAILABLE]: { 
        bg: 'bg-white', 
        text: 'text-stone-400', 
        shadow: 'rgba(0,0,0,0.03)',
        base: 'border-b-stone-100'
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
    draggingScreenX,
    draggingScreenY,
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

    const draggingStyle: React.CSSProperties = isDraggingThis && draggingScreenX !== undefined ? {
        ...gridStyle,
        position: 'fixed',
        left: draggingScreenX,
        top: draggingScreenY,
        opacity: 0.95,
        scale: 1.05,
        boxShadow: `0 20px 40px ${theme.shadow}`,
        cursor: 'grabbing',
    } : gridStyle;

    const rawLabel = table.displayName || table.name;
    const cleanLabel = rawLabel.endsWith('.') ? rawLabel.slice(0, -1) : rawLabel;
    const isNarrow = safeW <= 1.2;
    const displayLabel = isNarrow ? cleanLabel.slice(0, 4) : cleanLabel;

    return (
        <button
            data-table={table._id}
            className={`
                flex flex-col items-center justify-center rounded-2xl border-t border-x 
                border-b-[5px] active:border-b-[2px] active:translate-y-[3px]
                transition-all duration-100 animate-[scaleIn_0.4s_cubic-bezier(0.2,0,0,1)_backwards]
                ${theme.bg} ${theme.text} ${theme.base}
                ${isDraggingThis ? '' : 'active:scale-95'} ${isAdmin ? 'cursor-grab' : ''}
                shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)]
            `}
            style={{
                ...draggingStyle,
                borderColor: table.status === TableStatus.AVAILABLE ? '#f1f1f1' : 'rgba(0,0,0,0.05)',
                borderBottomColor: table.status === TableStatus.AVAILABLE ? '#e2e8f0' : undefined
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
