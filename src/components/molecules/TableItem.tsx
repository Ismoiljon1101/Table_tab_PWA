import { Edit2, Trash2, Users } from 'lucide-react';
import { Badge } from '../atoms/Badge';
import type { Table } from '../../types';

interface TableItemProps {
    table: Table;
    onEdit: (table: Table) => void;
    onDelete: (id: string) => void;
}

/**
 * TableItem molecule (Admin)
 * Displays an individual table row in management view with edit and delete actions.
 */
export function TableItem({ table, onEdit, onDelete }: TableItemProps) {
    return (
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm transition-all active:scale-[0.99] active:bg-stone-50">
            <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-900">{table.displayName || table.name}</span>
                    {table.code && (
                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold uppercase tracking-wider">
                            {table.code}
                        </span>
                    )}
                    <Badge label={table.status} variant={table.status} />
                </div>
                <span className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                    <Users size={12} /> {table.capacity} Seats
                </span>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => onEdit(table)}
                    className="p-2.5 text-stone-400 active:text-amber-600 transition-colors rounded-lg active:bg-amber-50"
                    title="Edit Table"
                >
                    <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => onDelete(table._id)}
                    className="p-2.5 text-stone-400 active:text-red-500 transition-colors rounded-lg active:bg-red-50"
                    title="Delete Table"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
