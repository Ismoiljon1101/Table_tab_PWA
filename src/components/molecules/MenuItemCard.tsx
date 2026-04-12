import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../atoms/Badge';
import { formatCurrency } from '../../utils/format';
import type { MenuItem } from '../../types';

interface MenuItemCardProps {
    item: MenuItem;
    onAdd: (item: MenuItem) => void;
    onClick?: () => void;
    index?: number;
}

/**
 * MenuItemCard molecule
 * Displays an individual menu item with name, price, and add button.
 * Upgraded with Liquid Glass and Cinematic Motion.
 */
export function MenuItemCard({ item, onAdd, onClick, index = 0 }: MenuItemCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1] 
            }}
            whileTap={{ scale: 0.98 }}
            className="group flex items-center gap-2 p-2.5 bg-white/70 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm shadow-stone-200/50 cursor-pointer transition-all hover:bg-white hover:border-amber-200/50 active:shadow-inner"
            onClick={onClick}
        >
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[15px] font-bold text-stone-900 truncate tracking-tight">{item.name}</span>
                    {item.isPopular && <Badge label="P" variant="preparing" />}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-amber-600">
                        {formatCurrency(item.price)}
                    </span>
                    {item.modifiers.length > 0 && (
                        <span className="text-[11px] text-stone-400 truncate">
                            {item.modifiers.length} options
                        </span>
                    )}
                </div>
            </div>
            
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-amber-600 text-white shadow-lg shadow-amber-600/20 transition-colors active:bg-amber-700"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(item);
                }}
            >
                <Plus size={20} strokeWidth={2.5} />
            </motion.button>
        </motion.div>
    );
}
