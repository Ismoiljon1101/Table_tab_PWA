import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit2, Trash2, UtensilsCrossed, Filter, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import type { MenuItem, Category } from '../../types';
import { formatCurrency } from '../../utils/format';
import api from '../../services/api';
import { ItemFormModal } from './ItemFormModal';

/**
 * MenuItemManagement component
 * Handles CRUD operations for menu items.
 */
export const MenuItemManagement = forwardRef<{ handleAdd: () => void }, {}>(({}, ref) => {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    useImperativeHandle(ref, () => ({
        handleAdd: () => {
            setEditingItem(null);
            setIsModalOpen(true);
        }
    }));

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

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this menu item?')) return;
        try {
            await api.delete(`/menu/${id}`);
            setItems(items.filter((i) => i._id !== id));
        } catch (err) {
            console.error('Failed to delete item:', err);
            alert('Failed to delete item');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleModalSuccess = () => {
        fetchData();
        handleModalClose();
    };

    const filteredItems = selectedCategory === 'all' 
        ? items 
        : items.filter((i) => {
            const catId = typeof i.category === 'string' ? i.category : i.category?._id;
            return catId === selectedCategory;
        });

    if (loading && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-3" />
                <p className="text-stone-400">Loading menu...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                        selectedCategory === 'all'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-white border-stone-100 text-stone-500'
                    }`}
                >
                    <Filter size={12} />
                    All Items
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat._id)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                            selectedCategory === cat._id
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-white border-stone-100 text-stone-500'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {filteredItems.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center flex flex-col items-center gap-2">
                    <UtensilsCrossed size={40} className="text-stone-200" />
                    <p className="text-stone-500 font-medium">No items found</p>
                    <p className="text-xs text-stone-400">Add items to your menu to take orders.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                        <Plus size={16} className="mr-1" /> Add Your First Item
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filteredItems.map((item) => (
                        <div key={item._id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                            <div className="flex-1 flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-stone-900">{item.name}</span>
                                    {item.code && (
                                        <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[9px] font-bold uppercase tracking-wider">
                                            {item.code}
                                        </span>
                                    )}
                                    {item.isPopular && <Badge label="Popular" variant="preparing" />}
                                    {!item.isAvailable && <Badge label="Sold Out" variant="busy" />}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500">
                                    <span className="font-bold text-amber-600 truncate">{formatCurrency(item.price)}</span>
                                    <span>•</span>
                                    <span>
                                        {typeof item.category === 'string' 
                                            ? categories.find(c => c._id === item.category)?.name || 'Uncategorized'
                                            : item.category?.name || 'Uncategorized'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEdit(item)}
                                    className="p-2 text-stone-400 active:text-amber-600 transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 text-stone-400 active:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <ItemFormModal 
                    item={editingItem} 
                    categories={categories}
                    onClose={handleModalClose} 
                    onSuccess={handleModalSuccess} 
                />
            )}
        </div>
    );
});
