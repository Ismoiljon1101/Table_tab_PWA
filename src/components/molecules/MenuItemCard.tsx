import { Plus } from 'lucide-react';
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
 */
export function MenuItemCard({ item, onAdd, onClick, index = 0 }: MenuItemCardProps) {
    return (
        <div
            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm animate-[slideUp_0.3s_ease-out_both] cursor-pointer hover:border-amber-200 transition-all duration-300 active:scale-[0.98]"
            style={{ animationDelay: `${index * 30}ms` }}
            onClick={onClick}
        >
            <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-stone-900">{item.name}</span>
                    {item.isPopular && <Badge label="Popular" variant="preparing" />}
                </div>
                <span className="text-base font-bold text-amber-600">{formatCurrency(item.price)}</span>
                {item.modifiers.length > 0 && (
                    <span className="text-xs text-stone-400 mt-1">
                        {item.modifiers.map((m) => m.name).join(' · ')}
                    </span>
                )}
            </div>
            <button
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 text-amber-600 transition-colors active:scale-95 active:bg-amber-600 active:text-white"
                onClick={(e) => {
                    e.stopPropagation();
                    onAdd(item);
                }}
            >
                <Plus size={18} />
            </button>
        </div>
    );
}
