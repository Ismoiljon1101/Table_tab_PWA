import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, ShoppingCart, Trash2, StickyNote } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { useCartStore } from '../../stores/cartStore';
import type { MenuItem, Category, ItemModifier } from '../../types';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';
import './MenuPage.css';

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
            <div className="menu-loading">
                <div className="menu-loading__spinner" />
                <p>Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="menu-page">
            {/* Header */}
            <div className="menu-header">
                <button className="menu-header__back" onClick={() => navigate('/')}>
                    <ArrowLeft size={20} />
                </button>
                <h2 className="menu-header__title">Menu</h2>
            </div>

            {/* Category Tabs */}
            <div className="category-strip">
                <button
                    className={`category-chip ${activeCategory === 'all' ? 'category-chip--active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                >
                    All
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        className={`category-chip ${activeCategory === cat._id ? 'category-chip--active' : ''}`}
                        onClick={() => setActiveCategory(cat._id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Menu Items */}
            <div className="menu-items">
                {filteredItems.length === 0 ? (
                    <p className="menu-items__empty">No items in this category</p>
                ) : (
                    filteredItems.map((item, idx) => (
                        <div
                            key={item._id}
                            className="menu-card animate-slide-up"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            <div className="menu-card__info">
                                <div className="menu-card__name-row">
                                    <span className="menu-card__name">{item.name}</span>
                                    {item.isPopular && <Badge label="Popular" variant="preparing" />}
                                </div>
                                <span className="menu-card__price">{formatCurrency(item.price)}</span>
                                {item.modifiers.length > 0 && (
                                    <span className="menu-card__modifiers">
                                        {item.modifiers.map((m) => m.name).join(' · ')}
                                    </span>
                                )}
                            </div>
                            <button className="menu-card__add" onClick={() => quickAdd(item)}>
                                <Plus size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Cart FAB */}
            {cartItemCount > 0 && !showCart && (
                <button className="cart-fab animate-slide-up" onClick={() => setShowCart(true)}>
                    <ShoppingCart size={20} />
                    <span>{cartItemCount} items · {formatCurrency(cartSubtotal)}</span>
                </button>
            )}

            {/* Cart Bottom Sheet */}
            {showCart && (
                <div className="cart-overlay" onClick={() => setShowCart(false)}>
                    <div className="cart-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-sheet__handle" />
                        <h3 className="cart-sheet__title">
                            Your Order ({cartItemCount})
                        </h3>

                        <div className="cart-items">
                            {cart.items.map((item) => {
                                const modKey = item.modifiers.map((m) => `${m.name}:${m.option}`).join('|');
                                return (
                                    <div key={`${item.menuItemId}_${modKey}`} className="cart-item">
                                        <div className="cart-item__info">
                                            <span className="cart-item__name">{item.name}</span>
                                            {item.modifiers.length > 0 && (
                                                <span className="cart-item__mods">
                                                    {item.modifiers.map((m) => m.option).join(', ')}
                                                </span>
                                            )}
                                            {item.notes && (
                                                <span className="cart-item__notes">
                                                    <StickyNote size={10} /> {item.notes}
                                                </span>
                                            )}
                                        </div>

                                        <div className="cart-item__controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => cart.updateQuantity(item.menuItemId, item.modifiers, item.quantity - 1)}
                                            >
                                                {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                                            </button>
                                            <span className="qty-count">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => cart.updateQuantity(item.menuItemId, item.modifiers, item.quantity + 1)}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>

                                        <span className="cart-item__price">
                                            {formatCurrency(
                                                (item.unitPrice + item.modifiers.reduce((s: number, m: ItemModifier) => s + m.price, 0)) * item.quantity
                                            )}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-sheet__footer">
                            <div className="cart-sheet__total">
                                <span>Total</span>
                                <span className="cart-sheet__total-amount">{formatCurrency(cartSubtotal)}</span>
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
