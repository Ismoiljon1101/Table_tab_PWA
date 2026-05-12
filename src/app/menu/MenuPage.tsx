import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchStore } from '../../stores/searchStore';
import { ShoppingCart } from 'lucide-react';
import { MenuTemplate } from '../../components/templates/MenuTemplate';
import { MenuCategoryTabs } from '../../components/organisms/MenuCategoryTabs';
import { MenuItemCard } from '../../components/molecules/MenuItemCard';
import { ModifierModal } from '../../components/organisms/ModifierModal';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import type { MenuItem, Category } from '../../types';
import { MenuSkeleton } from '../../components/atoms/MenuSkeleton';

/**
 * MenuPage
 * Refactored to use Atomic Design (Templates, Organisms, Molecules).
 * Enhanced with Cinematic Motion and Staggered entry.
 * Data fetching via React Query — cached for 5 min, instant on revisit.
 */
export function MenuPage() {
    // --- STATE MANAGEMENT ---
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

    // --- SHARED STORES ---
    const cart = useCartStore();
    const search = useSearchStore();
    const user = useAuthStore((s) => s.user);

    // React Query: menu items — cached, no re-fetch on every navigation
    const { data: items = [], isLoading: isLoadingItems } = useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const res = await api.get<MenuItem[]>('/menu');
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 min cache
        enabled: !!user,
    });

    // React Query: categories — cached
    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get<Category[]>('/categories');
            // Auto-select first category on first load
            if (res.data.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(res.data[0]._id);
            }
            return res.data;
        },
        staleTime: 1000 * 60 * 5,
        enabled: !!user,
    });

    const isLoading = isLoadingItems || isLoadingCategories;

    const handleOpenCart = () => {
        window.dispatchEvent(new CustomEvent('open-cart'));
    };

    const filteredItems = useMemo(() => {
        let result = items;
        if (selectedCategoryId) {
            result = result.filter((i: MenuItem) => {
                const catId = typeof i.category === 'string' ? i.category : i.category?._id;
                return catId === selectedCategoryId;
            });
        }
        if (search.query) {
            result = result.filter((i: MenuItem) => i.name.toLowerCase().includes(search.query.toLowerCase()));
        }
        return result;
    }, [items, selectedCategoryId, search.query]);

    if (isLoading && items.length === 0) {
        return (
            <div className="flex flex-col p-4 gap-3 overflow-hidden">
                {[...Array(8)].map((_, i) => <MenuSkeleton key={i} />)}
            </div>
        );
    }

    const tabs = (
        <MenuCategoryTabs
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
        />
    );

    const cartTrigger = cart.items.length > 0 ? (
        <motion.button
            layout
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenCart}
            className="w-full flex items-center justify-between p-4 bg-amber-600 rounded-2xl text-white shadow-xl shadow-amber-600/30 transition-all font-bold"
        >
            <div className="flex items-center gap-3">
                <div className="relative">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-amber-600">
                        {cart.totalItems()}
                    </span>
                </div>
                <span>View Cart</span>
            </div>
            <span className="text-lg uppercase">Total: {cart.totalItems()}</span>
        </motion.button>
    ) : null;

    return (
        <MenuTemplate
            header={null}
            tabs={tabs}
            cartTrigger={cartTrigger}
        >
            <div className="flex flex-col gap-4">
                <AnimatePresence mode="wait">
                    {filteredItems.length === 0 ? (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 text-center flex flex-col items-center gap-2"
                        >
                            <p className="text-stone-400 font-medium italic">No delicious options found</p>
                            <button 
                                onClick={() => {if(categories.length > 0) setSelectedCategoryId(categories[0]._id); search.setQuery('');}}
                                colonial-button="true"
                                className="text-amber-600 text-xs font-bold tracking-widest uppercase border-b border-amber-600/30"
                            >
                                Clear filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key={selectedCategoryId || 'all'}
                            initial="hidden"
                            animate="show"
                            exit="hidden"
                            variants={{
                                show: { transition: { staggerChildren: 0.05 } }
                            }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5"
                        >
                            {filteredItems.map((item, idx) => (
                                <MenuItemCard
                                    key={item._id}
                                    item={item}
                                    index={idx}
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
                        </motion.div>
                    )}
                </AnimatePresence>
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
