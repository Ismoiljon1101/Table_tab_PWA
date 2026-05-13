import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/format';
import type { MenuItem, ItemModifier } from '../../types';

interface ModifierModalProps {
    item: MenuItem;
    onClose: () => void;
}

/**
 * ModifierModal organism
 * Allows users to customize an item with modifiers and add it to the cart.
 * Upgraded with Liquid Glass and Spring Physics.
 */
export function ModifierModal({ item, onClose }: ModifierModalProps) {
    const addItem = useCartStore((s) => s.addItem);
    const [selectedModifiers, setSelectedModifiers] = useState<ItemModifier[]>([]);
    const [notes, setNotes] = useState('');

    const toggleModifier = (modName: string, optionName: string, price: number) => {
        const exists = selectedModifiers.find(m => m.name === modName && m.option === optionName);
        if (exists) {
            setSelectedModifiers(selectedModifiers.filter(m => !(m.name === modName && m.option === optionName)));
        } else {
            const filtered = selectedModifiers.filter(m => m.name !== modName);
            setSelectedModifiers([...filtered, { name: modName, option: optionName, price }]);
        }
    };

    const handleAdd = () => {
        addItem({
            menuItemId: item._id,
            name: item.name,
            unitPrice: item.price,
            quantity: 1,
            modifiers: selectedModifiers,
            notes: notes
        });
        onClose();
    };

    const totalPrice = item.price + selectedModifiers.reduce((acc, curr) => acc + curr.price, 0);

    const isAvailable = item.isAvailable !== false;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[300] flex items-end justify-center">
                {/* Backdrop overlay */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Sheet */}
                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="relative w-full max-w-[500px] bg-white rounded-t-[32px] flex flex-col max-h-[90dvh] shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 flex justify-between items-center bg-white/70 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-stone-900 tracking-tight">{item.name}</h3>
                            <span className="text-sm font-semibold text-amber-600">Base: {formatCurrency(item.price)}</span>
                        </div>
                        <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose} 
                            className="p-2 bg-stone-100 text-stone-400 hover:bg-stone-200 hover:text-stone-600 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 scrollbar-hide">
                        {item.modifiers.map((mod) => (
                            <div key={mod.name} className="flex flex-col gap-4">
                                <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">{mod.name}</h4>
                                <div className="grid grid-cols-1 gap-2.5">
                                    {mod.options.map((opt) => {
                                        const isSelected = selectedModifiers.some(m => m.name === mod.name && m.option === opt.name);
                                        return (
                                            <motion.button
                                                key={opt.name}
                                                layout
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleModifier(mod.name, opt.name, opt.price)}
                                                className={`group flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${
                                                    isSelected
                                                        ? 'border-amber-600 bg-amber-50 shadow-sm shadow-amber-600/10'
                                                        : 'border-stone-100 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                                                        isSelected ? 'bg-amber-600 border-amber-600' : 'border-stone-200 bg-white'
                                                    }`}>
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                    <span className={`text-[15px] font-bold ${isSelected ? 'text-amber-900' : 'text-stone-700'}`}>
                                                        {opt.name}
                                                    </span>
                                                </div>
                                                {opt.price > 0 && (
                                                    <span className={`text-[13px] font-black tabular-nums transition-all ${isSelected ? 'text-amber-600' : 'text-stone-400'}`}>
                                                        +{formatCurrency(opt.price)}
                                                    </span>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col gap-4 pb-10">
                            <h4 className="text-[11px] font-black text-stone-400 uppercase tracking-[0.2em]">Special Notes</h4>
                            <div className="bg-stone-50/50 rounded-2xl p-1 border border-stone-100 focus-within:border-amber-200 focus-within:bg-white transition-all">
                                <Input
                                    label=""
                                    placeholder="Extra spicy? No onions? Let us know!"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="border-none bg-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-white/70 backdrop-blur-md border-t border-white/20 pb-[calc(24px+env(safe-area-inset-bottom))]">
                        <Button 
                            variant="primary" 
                            size="lg" 
                            fullWidth 
                            onClick={handleAdd}
                            disabled={!isAvailable}
                            className="h-16 rounded-2xl text-[15px] font-black uppercase tracking-widest shadow-xl shadow-amber-600/30 active:scale-[0.97] transition-all"
                        >
                            {isAvailable ? `Confirm • ${formatCurrency(totalPrice)}` : "Out of stock"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
