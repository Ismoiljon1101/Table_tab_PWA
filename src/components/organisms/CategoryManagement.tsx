import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { CategoryItem } from '../molecules/CategoryItem';
import type { Category } from '../../types';
import api from '../../services/api';
import { CategoryFormModal } from './CategoryFormModal';

/**
 * CategoryManagement component
 * Handles CRUD operations for categories.
 */
export const CategoryManagement = forwardRef<{ handleAdd: () => void }, {}>(({}, ref) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useImperativeHandle(ref, () => ({
        handleAdd: () => {
            setEditingCategory(null);
            setIsModalOpen(true);
        }
    }));

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await api.get<Category[]>('/categories');
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this category? All items in this category will become uncategorized.')) return;
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter((c) => c._id !== id));
        } catch (err) {
            console.error('Failed to delete category:', err);
            alert('Failed to delete category');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleModalSuccess = () => {
        fetchCategories();
        handleModalClose();
    };

    if (loading && categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-3" />
                <p className="text-stone-400">Loading categories...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {categories.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center flex flex-col items-center gap-2">
                    <Tag size={40} className="text-stone-200" />
                    <p className="text-stone-500 font-medium">No categories found</p>
                    <p className="text-xs text-stone-400">Create categories to organize your menu items.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                        <Plus size={16} className="mr-1" /> Add Your First Category
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {categories.map((cat) => (
                        <CategoryItem 
                            key={cat._id} 
                            category={cat} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}

            {isModalOpen && (
                <CategoryFormModal 
                    category={editingCategory} 
                    onClose={handleModalClose} 
                    onSuccess={handleModalSuccess} 
                />
            )}
        </div>
    );
});
