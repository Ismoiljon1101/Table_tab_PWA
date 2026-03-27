import { useState } from 'react';
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
            // Re-selecting for the same category (radio-style)
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

    return (
        <div className="fixed inset-0 bg-black/40 z-[300] flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-[480px] bg-white rounded-t-3xl flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 flex justify-between items-center border-b border-stone-100">
                    <h3 className="text-xl font-bold text-stone-900">{item.name}</h3>
                    <button onClick={onClose} className="p-2 text-stone-400 active:bg-stone-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
                    {item.modifiers.map((mod) => (
                        <div key={mod.name} className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-stone-600 uppercase tracking-widest">{mod.name}</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {mod.options.map((opt) => {
                                    const isSelected = selectedModifiers.some(m => m.name === mod.name && m.option === opt.name);
                                    return (
                                        <button
                                            key={opt.name}
                                            onClick={() => toggleModifier(mod.name, opt.name, opt.price)}
                                            className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-200 ${
                                                isSelected
                                                    ? 'border-amber-600 bg-amber-50 shadow-sm shadow-amber-100'
                                                    : 'border-stone-100 bg-stone-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                                    isSelected ? 'bg-amber-600 border-amber-600' : 'border-stone-300 bg-white'
                                                }`}>
                                                    {isSelected && <Check size={12} className="text-white" />}
                                                </div>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-amber-900' : 'text-stone-700'}`}>
                                                    {opt.name}
                                                </span>
                                            </div>
                                            {opt.price > 0 && (
                                                <span className={`text-xs font-bold ${isSelected ? 'text-amber-600' : 'text-stone-400'}`}>
                                                    +{formatCurrency(opt.price)}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col gap-3 pb-4">
                        <h4 className="text-sm font-bold text-stone-600 uppercase tracking-widest">Special Notes</h4>
                        <Input
                            label="Notes"
                            placeholder="Add your preferences here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-5 border-t border-stone-100 pb-[calc(20px+env(safe-area-inset-bottom))]">
                    <Button variant="primary" size="lg" fullWidth onClick={handleAdd}>
                        Add to Order • {formatCurrency(totalPrice)}
                    </Button>
                </div>
            </div>
        </div>
    );
}
