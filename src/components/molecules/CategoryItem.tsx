import { Edit2, Trash2 } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryItemProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDelete: (id: string) => void;
}

/**
 * CategoryItem molecule
 * Displays an individual category row with edit and delete actions.
 */
export function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
    return (
        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm transition-all active:scale-[0.99] active:bg-stone-50">
            <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-900">{category.name}</span>
                    {category.code && (
                        <span className="px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-[9px] font-bold uppercase tracking-wider">
                            {category.code}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex gap-1">
                <button 
                    onClick={() => onEdit(category)}
                    className="p-2.5 text-stone-400 active:text-amber-600 transition-colors rounded-lg active:bg-amber-50"
                    title="Edit Category"
                >
                    <Edit2 size={18} />
                </button>
                <button 
                    onClick={() => onDelete(category._id)}
                    className="p-2.5 text-stone-400 active:text-red-500 transition-colors rounded-lg active:bg-red-50"
                    title="Delete Category"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
