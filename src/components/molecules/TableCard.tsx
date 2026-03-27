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

/** Status-to-style mapping */
const STATUS_CLASSES: Record<TableStatus, string> = {
    [TableStatus.AVAILABLE]: 'border-emerald-300 bg-gradient-to-b from-emerald-50 to-white text-emerald-700',
    [TableStatus.OCCUPIED]: 'border-amber-300 bg-gradient-to-b from-amber-50 to-white text-amber-700',
    [TableStatus.RESERVED]: 'border-blue-300 bg-gradient-to-b from-blue-50 to-white text-blue-700',
};

/**
 * TableCard molecule
 * Positions itself on the coordinate canvas using the grid formula:
 *   screenX = canvasW/2 + table.position.x * cellSize + panX
 *   screenY = canvasH/2 - table.position.y * cellSize + panY
 * Sized by grid units: width = table.width * cellSize, height = table.height * cellSize.
 * Supports long-press drag for admins.
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
    const statusClass = STATUS_CLASSES[table.status] ?? 'border-stone-200 bg-white text-stone-700';

    /**
     * Responsive sizing logic:
     * - Base (2 people): 1.0 unit
     * - Every extra 2 people adds 0.6 units of width (instead of 1.0).
     * This makes larger tables look sleeker and more professional.
     */
    const cap = table.capacity ?? 2;
    const floatW = 1 + (Math.max(0, cap - 2) / 2) * 0.6;
    
    // Width is capacity-driven; Height is standard 1.0 unit.
    const safeW = floatW;
    const safeH = 1;

    const gridStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${safeW * cellSize}px`,
        height: `${safeH * cellSize}px`,
        /** calc(50% + ...) anchors from canvas center, then adds grid offset + pan */
        left: `calc(50% + ${table.position.x * cellSize + panX}px)`,
        top: `calc(50% + ${-(table.position.y * cellSize) + panY}px)`,
        transform: `translate(-50%, -50%) rotate(${table.rotation ?? 0}deg)`,
        animationDelay: `${index * 40}ms`,
        transition: isDraggingThis ? 'none' : 'left 0.15s ease, top 0.15s ease',
        zIndex: isDraggingThis ? 50 : 10,
        touchAction: 'none',
    };

    /** When being dragged, use raw screen position from the drag hook */
    const draggingStyle: React.CSSProperties = isDraggingThis && draggingScreenX !== undefined ? {
        ...gridStyle,
        position: 'fixed',
        left: draggingScreenX,
        top: draggingScreenY,
        opacity: 0.85,
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        cursor: 'grabbing',
    } : gridStyle;

    return (
        <button
            data-table={table._id}
            className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-xl border-2 shadow-sm transition-opacity duration-200 animate-[scaleIn_0.3s_ease-out_backwards] ${statusClass} ${isDraggingThis ? 'scale-105' : 'active:scale-95'} ${isAdmin ? 'cursor-grab' : ''}`}
            style={draggingStyle}
            onClick={onClick}
            onPointerDown={(e) => {
                if (isAdmin && onLongPressStart) {
                    onLongPressStart(e.clientX, e.clientY, e.pointerId);
                }
            }}
            onPointerUp={onLongPressCancel}
            title={table.displayName || table.name}
        >
            {/* Code badge — top right */}
            {table.code && (
                <span className="absolute -top-2 -right-2 bg-stone-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {table.code}
                </span>
            )}

            <span className="text-xs font-bold truncate w-full text-center leading-tight">
                {table.displayName || table.name}
            </span>

            {/* Status dot */}
            <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${table.status === TableStatus.AVAILABLE ? 'bg-emerald-500' :
                    table.status === TableStatus.OCCUPIED ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
        </button>
    );
}
