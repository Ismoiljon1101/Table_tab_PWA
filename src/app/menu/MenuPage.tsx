import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, StickyNote } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { useCartStore } from '../../stores/cartStore';
import type { MenuItem, Category, ItemModifier } from '../../types';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';

/**
 * Menu browsing page — category tabs, item cards, and cart bottom sheet.
 */
export function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const cart = useCartStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                api.get<MenuItem[]>('/menu'),
                api.get<Category[]>('/categories'),
            ]);
            setItems(menuRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Failed to fetch menu:', err);
        } finally {
            setLoading(false);
        }
    };

    /** Filter items by active category */
    const filteredItems = activeCategory === 'all'
        ? items.filter((i) => i.isAvailable)
        : items.filter((i) => {
            const catId = typeof i.category === 'string' ? i.category : i.category?._id;
            return catId === activeCategory && i.isAvailable;
        });

    /** Quick-add item to cart (no modifiers) */
    const quickAdd = (item: MenuItem) => {
        cart.addItem({
            menuItemId: item._id,
            name: item.name,
            quantity: 1,
            unitPrice: item.price,
            modifiers: [],
        });
    };

    /** Place order */
    const placeOrder = async () => {
        if (!cart.tableId || cart.items.length === 0) return;
        setPlacingOrder(true);
        try {
            await api.post('/orders', {
                tableId: cart.tableId,
                items: cart.items,
            });
            cart.clearCart();
            navigate('/orders');
        } catch (err) {
            console.error('Failed to place order:', err);
            alert('Failed to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    const cartItemCount = cart.totalItems();
    const cartSubtotal = cart.subtotal();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Header */}
            <div className="sticky top-14 z-40 flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-stone-900 active:bg-stone-100 transition-colors"
                    onClick={() => navigate('/')}
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-stone-900">Menu</h2>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white [&::-webkit-scrollbar]:hidden">
                <button
                    className={`flex-shrink-0 px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === 'all'
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : 'bg-stone-50 border-stone-200 text-stone-600 active:bg-stone-100'
                        }`}
                    onClick={() => setActiveCategory('all')}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        className={`flex-shrink-0 px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat._id
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'bg-stone-50 border-stone-200 text-stone-600 active:bg-stone-100'
                            }`}
                        onClick={() => setActiveCategory(cat._id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            <div className="flex flex-col gap-3 p-4 pb-24">
                {filteredItems.length === 0 ? (
                    <p className="text-center p-10 text-stone-400">No items in this category</p>
                ) : (
                    filteredItems.map((item, idx) => (
                        <div
                            key={item._id}
                            className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm animate-[slideUp_0.3s_ease-out_both]"
                            style={{ animationDelay: `${idx * 30}ms` }}
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
                                onClick={() => quickAdd(item)}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Cart FAB */}
            {cartItemCount > 0 && !showCart && (
                <button
                    className="fixed bottom-[calc(64px+env(safe-area-inset-bottom)+16px)] left-1/2 -translate-x-1/2 z-[80] flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-full text-base font-semibold shadow-[0_4px_20px_rgba(217,119,6,0.35)] whitespace-nowrap active:scale-95 transition-transform animate-slide-up"
                    onClick={() => setShowCart(true)}
                >
                    <ShoppingCart size={20} />
                    <span>{cartItemCount} items · {formatCurrency(cartSubtotal)}</span>
                </button>
            )}

            {/* Cart Bottom Sheet */}
            {showCart && (
                <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center animate-fade-in" onClick={() => setShowCart(false)}>
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
                                loading={placingOrder}
                                onClick={placeOrder}
                            >
                                Place Order
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
