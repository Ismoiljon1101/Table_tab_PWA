import { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { MenuItem, Category } from '../../types';
import api from '../../services/api';

interface ItemFormModalProps {
    item: MenuItem | null;
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * ItemFormModal
 * Modal for adding/editing a menu item.
 */
export function ItemFormModal({ item, categories, onClose, onSuccess }: ItemFormModalProps) {
    const [name, setName] = useState(item?.name || '');
    const [code, setCode] = useState(item?.code || '');
    const [price, setPrice] = useState(item?.price?.toString() || '');
    const [category, setCategory] = useState<string>(
        typeof item?.category === 'string' ? item.category : item?.category?._id || ''
    );
    const [isAvailable, setIsAvailable] = useState(item ? item.isAvailable : true);
    const [isPopular, setIsPopular] = useState(item ? item.isPopular : false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!item;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!category) {
            setError('Please select a category');
            setLoading(false);
            return;
        }

        const payload = {
            name,
            code: code.trim() || undefined,
            price: parseFloat(price),
            category,
            isAvailable,
            isPopular,
            modifiers: item?.modifiers || [],
        };

        try {
            if (isEdit && item) {
                await api.put(`/menu/${item._id}`, payload);
            } else {
                await api.post('/menu', payload);
            }
            onSuccess();
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-[300] flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div 
                className="w-full max-w-[480px] bg-white rounded-t-3xl p-6 pb-[calc(24px+env(safe-area-inset-bottom))] animate-slide-up" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-stone-900">
                        {isEdit ? 'Edit Menu Item' : 'Add New Item'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-stone-400 active:bg-stone-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Item Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Burger, Pizza"
                        required
                    />
                    <Input
                        label="Item Code (Optional)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. B-01, PZ-02"
                    />
                    
                    <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
                            Category
                        </label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 appearance-none focus:outline-none focus:border-amber-600 transition-colors"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                <Tag size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 mt-1">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-stone-900">Available</span>
                            <span className="text-[11px] text-stone-500">In stock for orders</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isAvailable}
                                onChange={(e) => setIsAvailable(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100 mt-1">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-stone-900">Popular Item</span>
                            <span className="text-[11px] text-stone-500">Shows popular badge</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isPopular}
                                onChange={(e) => setIsPopular(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                        </label>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100 italic">
                            {error}
                        </p>
                    )}

                    <div className="flex gap-3 mt-4">
                        <Button variant="ghost" fullWidth onClick={onClose} type="button">
                            Cancel
                        </Button>
                        <Button variant="primary" fullWidth loading={loading} type="submit">
                            {isEdit ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
