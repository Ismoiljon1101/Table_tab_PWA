import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Section } from '../../types';
import api from '../../services/api';

interface SectionFormModalProps {
    section: Section | null;
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * Modal form for creating or editing a table section.
 */
export function SectionFormModal({ section, onClose, onSuccess }: SectionFormModalProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!section;

    useEffect(() => {
        if (section) {
            setName(section.name);
            setCode(section.code || '');
        }
    }, [section]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);

        const payload = { 
            name,
            code: code.trim() || undefined
        };

        try {
            if (isEdit && section) {
                await api.patch(`/sections/${section._id}`, payload);
            } else {
                await api.post('/sections', payload);
            }
            onSuccess();
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save section');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <h3 className="text-lg font-bold text-stone-900">
                        {isEdit ? 'Edit Section' : 'Add New Section'}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 font-medium">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Section Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Garden, VIP Room"
                        required
                    />

                    <Input
                        label="Code (Optional)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. VIP, OUT-1"
                    />

                    <div className="flex gap-3 mt-4">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            className="flex-1" 
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            className="flex-1"
                            loading={isLoading}
                            disabled={!name.trim()}
                        >
                            {isEdit ? 'Update Section' : 'Add Section'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
