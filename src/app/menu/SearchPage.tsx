import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MenuItemCard } from '../../components/molecules/MenuItemCard';
import { ModifierModal } from '../../components/organisms/ModifierModal';
import { useCartStore } from '../../stores/cartStore';
import api from '../../services/api';
import type { MenuItem } from '../../types';

/**
 * SearchPage
 * Dedicated full-screen search experience for the restaurant menu.
 */
export function SearchPage() {
    const navigate = useNavigate();
    const cart = useCartStore();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchItems();
        // Auto-focus search input on mount
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await api.get<MenuItem[]>('/menu');
            setItems(res.data);
        } catch (err) {
            console.error('Failed to fetch items for search:', err);
        } finally {
            setLoading(false);
        }
    };

    const results = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return items.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.code?.toLowerCase().includes(query)
        );
    }, [items, searchQuery]);

    return (
        <div className="flex flex-col h-[100dvh] bg-white animate-in slide-in-from-bottom-4 duration-300">
            {/* Search Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 pt-[calc(12px+env(safe-area-inset-top,0px))] pb-3 flex items-center gap-3">
                <button 
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-600 active:scale-90 transition-transform"
                >
                    <ArrowLeft size={20} />
                </button>
                
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="What are you craving?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 bg-stone-100 border-none rounded-2xl text-base focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1 hover:text-stone-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </header>

            {/* Results Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-[calc(32px+env(safe-area-inset-bottom,0px))]">
                {loading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-6 h-6 border-2 border-stone-200 border-t-amber-600 rounded-full animate-spin" />
                        <p className="text-stone-400 text-sm font-medium">Preparing your menu...</p>
                    </div>
                ) : searchQuery.trim() === '' ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
                            <Search size={32} className="text-stone-300" />
                        </div>
                        <div>
                            <h3 className="text-stone-900 font-bold mb-1">Search the Menu</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">Search to find your favorite dishes, Appetizers, and drinks.</p>
                        </div>
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-4">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
                            <X size={32} className="text-orange-300" />
                        </div>
                        <div>
                            <h3 className="text-stone-900 font-bold mb-1">No matches found</h3>
                            <p className="text-stone-500 text-sm leading-relaxed">We couldn't find anything matching "{searchQuery}". Try a different keyword.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest pl-1 mb-1">
                            {results.length} result{results.length !== 1 ? 's' : ''} found
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {results.map((item) => (
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
                    </div>
                )}
            </main>

            {/* Item Customization Modal */}
            {selectedItem && (
                <ModifierModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}
