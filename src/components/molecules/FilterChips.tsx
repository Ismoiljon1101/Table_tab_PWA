import React from 'react';
import { Filter } from 'lucide-react';

interface FilterItem {
    _id: string;
    name: string;
}

interface FilterChipsProps {
    items: FilterItem[];
    selectedId: string;
    onSelect: (id: string) => void;
    showAll?: boolean;
    className?: string;
}

// dont add the fucking ALL
export function FilterChips({ 
    items, 
    selectedId, 
    onSelect, 
    showAll = false,
    className = ""
}: FilterChipsProps) {
    return (
        <div className={`flex items-center gap-1.5 overflow-x-auto py-1 scroll-smooth scrollbar-hide -mx-4 px-4 bg-stone-50/80 backdrop-blur-sm z-10 border-b border-stone-100/50 ${className}`}>
            {showAll && (
                <button
                    onClick={() => onSelect('all')}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all whitespace-nowrap shadow-sm
                        ${selectedId === 'all'
                            ? 'bg-amber-600 border-amber-600 text-white shadow-amber-200'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 active:scale-95'
                        }
                    `}
                >
                    <Filter size={12} strokeWidth={2.5} />
                    ALL
                </button>
            )}
            
            {items.map((item) => (
                <button
                    key={item._id}
                    onClick={() => onSelect(item._id)}
                    className={`
                        px-3 py-1 rounded-xl border text-xs font-bold transition-all whitespace-nowrap shadow-sm
                        ${selectedId === item._id
                            ? 'bg-amber-600 border-amber-600 text-white shadow-amber-200'
                            : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 active:scale-95'
                        }
                    `}
                >
                    {item.name.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
