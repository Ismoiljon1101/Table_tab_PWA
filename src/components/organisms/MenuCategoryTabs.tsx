import { Filter } from 'lucide-react';
import type { Category } from '../../types';

interface MenuCategoryTabsProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
}

/**
 * MenuCategoryTabs organism
 * Horizontal scrollable tabs for filtering menu items by category.
 */
export function MenuCategoryTabs({ categories, selectedCategoryId, onSelectCategory }: MenuCategoryTabsProps) {
    return (
        <div className="flex bg-white items-center gap-2 overflow-x-auto px-4 py-1 scrollbar-hide border-b border-stone-50 transition-all active:cursor-grabbing">
            {categories.map((category) => (
                <button
                    key={category._id}
                    onClick={() => onSelectCategory(category._id)}
                    className={`px-4 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                        selectedCategoryId === category._id
                            ? 'bg-amber-600 border-amber-600 text-white shadow-sm shadow-amber-200'
                            : 'bg-stone-50 border-stone-100 text-stone-500'
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
