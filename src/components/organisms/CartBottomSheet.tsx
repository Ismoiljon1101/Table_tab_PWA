import { Trash2, Minus, Plus, StickyNote } from 'lucide-react';
import { Button } from '../atoms/Button';
import { useCartStore } from '../../stores/cartStore';
import { formatCurrency } from '../../utils/format';
import type { ItemModifier } from '../../types';

interface CartBottomSheetProps {
    onClose: () => void;
    onPlaceOrder: () => Promise<void>;
    isPlacingOrder: boolean;
}

/**
 * CartBottomSheet organism
 * Displays the current cart items, allowing quantity changes and order submission.
 */
export function CartBottomSheet({ onClose, onPlaceOrder, isPlacingOrder }: CartBottomSheetProps) {
    const cart = useCartStore();
    const cartItemCount = cart.totalItems();
    const cartSubtotal = cart.subtotal();

    return (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-[480px] max-h-[80dvh] bg-white rounded-t-3xl flex flex-col animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="flex-shrink-0 w-9 h-1 rounded-full bg-stone-300 mx-auto mt-3 mb-3" />
                <h3 className="flex-shrink-0 text-lg font-bold text-center text-stone-900 pb-3 border-b border-stone-100">
                    Your Order ({cartItemCount})
                </h3>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                    {cart.items.map((item) => {
                        const modKey = item.modifiers.map((m) => `${m.name}:${m.option}`).join('|');
                        return (
                            <div key={`${item.menuItemId}_${modKey}`} className="flex items-center gap-3">
                                <div className="flex-1 flex flex-col gap-px">
                                    <span className="text-base font-medium text-stone-900">{item.name}</span>
                                    {item.modifiers.length > 0 && (
                                        <span className="text-xs text-stone-500">
                                            {item.modifiers.map((m) => m.option).join(', ')}
                                        </span>
                                    )}
                                    {item.notes && (
                                        <span className="text-xs text-blue-600 flex items-center gap-1 mt-1">
                                            <StickyNote size={10} /> {item.notes}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-shrink-0 items-center gap-2">
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 active:bg-stone-100"
                                        onClick={() => cart.updateQuantity(item.menuItemId, item.modifiers, item.quantity - 1)}
                                    >
                                        {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                                    </button>
                                    <span className="min-w-[20px] text-center font-semibold text-stone-900">{item.quantity}</span>
                                    <button
                                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 active:bg-stone-100"
                                        onClick={() => cart.updateQuantity(item.menuItemId, item.modifiers, item.quantity + 1)}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                <span className="min-w-[60px] text-right text-base font-semibold text-amber-600">
                                    {formatCurrency(
                                        (item.unitPrice + item.modifiers.reduce((s: number, m: ItemModifier) => s + m.price, 0)) * item.quantity
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex-shrink-0 p-4 border-t border-stone-100 flex flex-col gap-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
                    <div className="flex justify-between items-center text-base font-medium text-stone-900">
                        <span>Total</span>
                        <span className="text-xl font-bold text-amber-600">{formatCurrency(cartSubtotal)}</span>
                    </div>
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        loading={isPlacingOrder}
                        onClick={onPlaceOrder}
                    >
                        {cart.editingOrderId ? 'Update Order' : 'Place Order'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
