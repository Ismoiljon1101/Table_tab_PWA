import { useState, useEffect, useMemo } from 'react';
import { useSearchStore } from '../../stores/searchStore';
import { Search, ShoppingCart } from 'lucide-react';
import { MenuTemplate } from '../../components/templates/MenuTemplate';
import { MenuCategoryTabs } from '../../components/organisms/MenuCategoryTabs';
import { MenuItemCard } from '../../components/molecules/MenuItemCard';
import { ModifierModal } from '../../components/organisms/ModifierModal';
import { CartBottomSheet } from '../../components/organisms/CartBottomSheet';
import { useCartStore } from '../../stores/cartStore';
import api from '../../services/api';
import type { MenuItem, Category } from '../../types';

/**
 * MenuPage
 * Refactored to use Atomic Design (Templates, Organisms, Molecules).
 */
export function MenuPage() {
    // --- STATE MANAGEMENT ---
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // --- SHARED STORES ---
    const cart = useCartStore(); // Handles global order state
    const search = useSearchStore(); // Consumes search query from the top header (AppShell)

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
            
            // Auto-select the first category by default
            if (catRes.data.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(catRes.data[0]._id);
            }
        } catch (err) {
            console.error('Failed to fetch menu data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCart = () => {
        window.dispatchEvent(new CustomEvent('open-cart'));
    };

    /**
     * Computes the final list of items based on Category selection and Global Search (from App Bar).
     * This is memoized to prevent re-filtering on every re-render.
     */
    const filteredItems = useMemo(() => {
        let result = items;

        // 1. Filter by category (Defaulting to the selected one)
        if (selectedCategoryId) {
            result = result.filter((i: MenuItem) => {
                const catId = typeof i.category === 'string' ? i.category : i.category?._id;
                return catId === selectedCategoryId;
            });
        }

        // 2. Filter by search query (shared from top AppShell)
        if (search.query) {
            result = result.filter((i: MenuItem) => i.name.toLowerCase().includes(search.query.toLowerCase()));
        }
        
        return result;
    }, [items, selectedCategoryId, search.query]);

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p className="text-stone-400 font-medium">Loading delicious options...</p>
            </div>
        );
    }

    // Sticky Header Content (Only shown if Header Search is toggled ON)
    const header = null;

    // Sticky Category Tabs (Passed to MenuTemplate to be pinned at top-[8vh])
    const tabs = (
        <MenuCategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
        />
    );

    const cartTrigger = cart.items.length > 0 ? (
        <button
            onClick={handleOpenCart}
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
        >
            <div className="flex flex-col gap-4">
                {filteredItems.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center gap-2">
                        <p className="text-stone-400 font-medium">No items found</p>
                        <button 
                            onClick={() => {if(categories.length > 0) setSelectedCategoryId(categories[0]._id); search.setQuery('');}}
                            className="text-amber-600 text-sm font-semibold"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

// --- HELPERS / TYPE GUARDS ---
