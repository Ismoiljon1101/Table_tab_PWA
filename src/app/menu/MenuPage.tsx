import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { MenuTemplate } from '../../components/templates/MenuTemplate';
import { MenuCategoryTabs } from '../../components/organisms/MenuCategoryTabs';
import { MenuItemCard } from '../../components/molecules/MenuItemCard';
import { ModifierModal } from '../../components/organisms/ModifierModal';
import { CartBottomSheet } from '../../components/organisms/CartBottomSheet';
import { useCartStore } from '../../stores/cartStore';
import api from '../../services/api';
import type { MenuItem, Category, Table } from '../../types';

/**
 * MenuPage
 * Refactored to use Atomic Design (Templates, Organisms, Molecules).
 */
export function MenuPage() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const cart = useCartStore();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [itemRes, catRes] = await Promise.all([
                api.get<MenuItem[]>('/menu'),
                api.get<Category[]>('/categories'),
            ]);
            setItems(itemRes.data);
            setCategories(catRes.data);
        } catch (err) {
            console.error('Failed to fetch menu data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (cart.items.length === 0) return;
        setIsPlacingOrder(true);
        try {
            const tableId = typeof cart.tableId === 'string' ? cart.tableId : (cart.tableId as unknown as Table)?._id;
            await api.post('/orders', {
                tableId,
                items: cart.items.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    modifiers: item.modifiers,
                    notes: item.notes
                }))
            });
            cart.clearCart();
            setIsCartOpen(false);
            window.location.href = '/floor';
        } catch (err) {
            console.error('Failed to place order:', err);
            alert('Failed to place order. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const filteredItems = useMemo(() => {
        let result = items;
        if (selectedCategoryId !== 'all') {
            result = result.filter(i => {
                const catId = typeof i.category === 'string' ? i.category : i.category?._id;
                return catId === selectedCategoryId;
            });
        }
        if (searchQuery) {
            result = result.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return result;
    }, [items, selectedCategoryId, searchQuery]);

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p className="text-stone-400 font-medium">Loading delicious options...</p>
            </div>
        );
    }

    const header = (
        <div className="px-4 py-3 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-stone-900">Ordering Menu</h2>
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-stone-50 border border-stone-100 rounded-xl text-sm focus:outline-none focus:border-amber-600 transition-colors"
                />
            </div>
        </div>
    );

    const tabs = (
        <MenuCategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
        />
    );

    const cartTrigger = cart.items.length > 0 ? (
        <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-amber-600 rounded-2xl text-white shadow-xl shadow-amber-600/30 active:scale-95 transition-all"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-amber-600">
                        {cart.totalItems()}
                    </span>
                </div>
                <span className="font-bold">View Cart</span>
            </div>
            <span className="text-lg font-bold">Total: {cart.totalItems()}</span>
        </button>
    ) : null;

    return (
        <MenuTemplate
            header={header}
            tabs={tabs}
            cartTrigger={cartTrigger}
            bottomSheet={isCartOpen && (
                <CartBottomSheet
                    onClose={() => setIsCartOpen(false)}
                    onPlaceOrder={handlePlaceOrder}
                    isPlacingOrder={isPlacingOrder}
                />
            )}
        >
            <div className="flex flex-col gap-4">
                {filteredItems.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-2">
                        <p className="text-stone-400 font-medium">No items found</p>
                        <button 
                            onClick={() => {setSelectedCategoryId('all'); setSearchQuery('');}}
                            className="text-amber-600 text-sm font-semibold"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredItems.map((item) => (
                            <MenuItemCard
                                key={item._id}
                                item={item}
                                onClick={() => setSelectedItem(item)}
                                onAdd={() => cart.addItem({
                                    menuItemId: item._id,
                                    name: item.name,
                                    unitPrice: item.price,
                                    quantity: 1,
                                    modifiers: [],
                                    notes: ''
                                })}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedItem && (
                <ModifierModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </MenuTemplate>
    );
}
