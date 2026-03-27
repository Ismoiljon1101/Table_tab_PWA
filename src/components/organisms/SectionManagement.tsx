import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Layout, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { SectionItem } from '../molecules/SectionItem';
import type { Section } from '../../types';
import api from '../../services/api';
import { SectionFormModal } from './SectionFormModal';

/**
 * SectionManagement component
 * Handles CRUD operations for table sections.
 */
export const SectionManagement = forwardRef<{ handleAdd: () => void }, {}>(({}, ref) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<Section | null>(null);

    useImperativeHandle(ref, () => ({
        handleAdd: () => {
            setEditingSection(null);
            setIsModalOpen(true);
        }
    }));

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            setLoading(true);
            const { data } = await api.get<Section[]>('/sections');
            setSections(data);
        } catch (err) {
            console.error('Failed to fetch sections:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (section: Section) => {
        setEditingSection(section);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this section? Tables in this section will be unassigned.')) return;
        try {
            await api.delete(`/sections/${id}`);
            setSections(sections.filter((s) => s._id !== id));
        } catch (err) {
            console.error('Failed to delete section:', err);
            alert('Failed to delete section');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingSection(null);
    };

    const handleModalSuccess = () => {
        fetchSections();
        handleModalClose();
    };

    if (loading && sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-3" />
                <p className="text-stone-400">Loading sections...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {sections.length === 0 ? (
                <div className="bg-white border border-stone-100 rounded-2xl p-10 text-center flex flex-col items-center gap-2">
                    <Layout size={40} className="text-stone-200" />
                    <p className="text-stone-500 font-medium">No sections found</p>
                    <p className="text-xs text-stone-400">Add sections (e.g., Indoor, Terrace, Bar) to organize your tables.</p>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                        <Plus size={16} className="mr-1" /> Add Your First Section
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {sections.map((section) => (
                        <SectionItem 
                            key={section._id} 
                            section={section} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}

            {isModalOpen && (
                <SectionFormModal 
                    section={editingSection} 
                    onClose={handleModalClose} 
                    onSuccess={handleModalSuccess} 
                />
            )}
        </div>
    );
});
