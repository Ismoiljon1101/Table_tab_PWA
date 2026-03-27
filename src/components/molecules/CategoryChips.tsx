import React from 'react';
import { Filter } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryChipsProps {
    categories: Category[];
    selectedId: string;
    onSelect: (id: string) => void;
    showAll?: boolean;
}

/**
 * CategoryChips molecule
 * Premium horizontally scrollable chips for category selection.
 */
export function CategoryChips({ 
    categories, 
    selectedId, 
    onSelect, 
    showAll = true 
}: CategoryChipsProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto py-2 scroll-smooth scrollbar-hide -mx-4 px-4 sticky top-0 bg-stone-50/80 backdrop-blur-sm z-10 border-b border-stone-100/50">
            {showAll && (
                <button
                    onClick={() => onSelect('all')}
                    className={`
                        flex items-center gap-1.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap shadow-sm
                        ${selectedId === 'all'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-amber-200'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 active:scale-95'
                        }
                    `}
                >
                    <Filter size={14} strokeWidth={2.5} />
                    ALL
                </button>
            )}
            
            {categories.map((cat) => (
                <button
                    key={cat._id}
                    onClick={() => onSelect(cat._id)}
                    className={`
                        px-5 py-2 rounded-2xl border text-xs font-bold transition-all whitespace-nowrap shadow-sm
                        ${selectedId === cat._id
                            ? 'bg-amber-600 border-amber-600 text-white shadow-amber-200'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 active:scale-95'
                        }
                    `}
                >
                    {cat.name.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
