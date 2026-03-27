import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Category } from '../../types';
import api from '../../services/api';

interface CategoryFormModalProps {
    category: Category | null;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * CategoryFormModal
 * Modal for adding/editing a category.
 */
export function CategoryFormModal({ category, onClose, onSuccess }: CategoryFormModalProps) {
    const [name, setName] = useState(category?.name || '');
    const [code, setCode] = useState(category?.code || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!category;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = { 
            name,
            code: code.trim() || undefined
        };

        try {
            if (isEdit && category) {
                await api.patch(`/categories/${category._id}`, payload);
            } else {
                await api.post('/categories', payload);
            }
            onSuccess();
        } catch (err: unknown) {
            console.error('Failed to save category:', err);
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save category. Please try again.');
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
                        {isEdit ? 'Edit Category' : 'Add New Category'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-stone-400 active:bg-stone-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Category Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Drinks, Main Course"
                        required
                    />
                    <Input
                        label="Category Code (Optional)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. BN (Beverages), MC"
                    />

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
                            {isEdit ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
