import type { Table } from '../../types';
import { TableStatus } from '../../types/enums';

interface FloorStatsProps {
    tables: Table[];
}

/**
 * FloorStats molecule
 * Displays summarized status counts for the floor plan.
 */
export function FloorStats({ tables }: FloorStatsProps) {
    const freeCount = tables.filter((t) => t.status === TableStatus.AVAILABLE).length;
    const occupiedCount = tables.filter((t) => t.status === TableStatus.OCCUPIED).length;
    const reservedCount = tables.filter((t) => t.status === TableStatus.RESERVED).length;

    return (
        <div className="flex bg-white gap-4 p-3 rounded-xl shadow-sm border border-stone-100 italic">
            <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>{freeCount} Free</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>{occupiedCount} Occupied</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>{reservedCount} Reserved</span>
            </div>
        </div>
    );
}
