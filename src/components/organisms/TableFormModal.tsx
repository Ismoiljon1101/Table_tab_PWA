import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import type { Table, Section } from '../../types';
import api from '../../services/api';

interface TableFormModalProps {
    table: Table | null;
    sections: Section[];
    onClose: () => void;
    onSuccess: () => void;
}

/**
 * TableFormModal
 * Modal for adding/editing a table.
 */
export function TableFormModal({ table, sections, onClose, onSuccess }: TableFormModalProps) {
    const [name, setName] = useState(table?.name || '');
    const [displayName, setDisplayName] = useState(table?.displayName || '');
    const [code, setCode] = useState(table?.code || '');
    const [capacity, setCapacity] = useState(table?.capacity?.toString() || '4');
    const [sectionId, setSectionId] = useState<string>(table?.section || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!table;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            name,
            displayName: displayName || name,
            code: code.trim() || undefined,
            capacity: parseInt(capacity, 10),
            section: sectionId || null,
            // width/height = grid units. 1 unit = 44px. 2×1 = standard table (88×44px). 1×2 = narrow tall.
            ...(isEdit ? {} : { position: { x: 0, y: 0 }, rotation: 0, width: 2, height: 1, shape: 'rectangle' })
        };

        try {
            if (isEdit && table) {
                await api.put(`/tables/${table._id}`, payload);
            } else {
                await api.post('/tables', payload);
            }
            onSuccess();
        } catch (err: unknown) {
            setError((err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save table. Please try again.');
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
                        {isEdit ? 'Edit Table' : 'Add New Table'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-stone-400 active:bg-stone-50 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="System Name (e.g. table-1)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Internal name"
                        required
                    />
                    <Input
                        label="Display Name (e.g. T-01)"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Visible to staff"
                    />
                    <Input
                        label="Code (Optional)"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Unique reference (e.g. T1)"
                    />
                    <Input
                        label="Capacity"
                        type="number"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        min="1"
                        required
                    />

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
                            Section (Optional)
                        </label>
                        <select
                            value={sectionId}
                            onChange={(e) => setSectionId(e.target.value)}
                            className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 appearance-none focus:outline-none focus:border-amber-600 transition-colors"
                        >
                            <option value="">No Section</option>
                            {sections.map(sec => (
                                <option key={sec._id} value={sec._id}>{sec.name}</option>
                            ))}
                        </select>
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
                            {isEdit ? 'Save Changes' : 'Create Table'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
