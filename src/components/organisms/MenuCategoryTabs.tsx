import { motion } from 'framer-motion';
import type { Category } from '../../types';

interface MenuCategoryTabsProps {
    categories: Category[];
    selectedCategoryId: string;
    onSelectCategory: (id: string) => void;
}

/**
 * MenuCategoryTabs organism
 * Horizontal scrollable tabs for filtering menu items by category.
 * Upgraded with Liquid Glass and Layout Transitions.
 */
export function MenuCategoryTabs({ categories, selectedCategoryId, onSelectCategory }: MenuCategoryTabsProps) {
    return (
        <div className="flex bg-white/70 backdrop-blur-md items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-hide border-b border-white/20 sticky top-0 z-40 transition-all">
            {categories.map((category) => {
                const isActive = selectedCategoryId === category._id;
                return (
                    <motion.button
                        key={category._id}
                        layout
                        onClick={() => onSelectCategory(category._id)}
                        whileTap={{ scale: 0.95 }}
                        className={`relative px-5 py-2 rounded-2xl text-[13px] font-bold whitespace-nowrap transition-colors ${
                            isActive
                                ? 'text-white'
                                : 'bg-stone-100/50 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-amber-600 rounded-2xl shadow-lg shadow-amber-600/30"
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10">{category.name}</span>
                    </motion.button>
                );
            })}
        </div>
    );
}
