import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { Button } from '../atoms/Button';
import { TableItem } from '../molecules/TableItem';
import type { Table, Section } from '../../types';
import api from '../../services/api';
import { TableFormModal } from './TableFormModal';

/**
 * TableManagement component
 * Handles CRUD operations for tables.
 */
export const TableManagement = forwardRef<{ handleAdd: () => void }, {}>(({}, ref) => {
    const [tables, setTables] = useState<Table[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);

    useImperativeHandle(ref, () => ({
        handleAdd: () => {
            setEditingTable(null);
            setIsModalOpen(true);
        }
    }));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [tableRes, sectionRes] = await Promise.all([
                api.get<Table[]>('/tables'),
                api.get<Section[]>('/sections'),
            ]);
            setTables(tableRes.data);
            setSections(sectionRes.data);
        } catch (err) {
            console.error('Failed to fetch table data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (table: Table) => {
        setEditingTable(table);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        try {
            await api.delete(`/tables/${id}`);
            setTables(tables.filter((t: Table) => t._id !== id));
        } catch (err) {
            console.error('Failed to delete table:', err);
            alert('Failed to delete table');
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTable(null);
    };

    const handleModalSuccess = () => {
        fetchData();
        handleModalClose();
    };

    if (loading && tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-600 rounded-full animate-spin mb-3" />
                <p className="text-stone-400">Loading tables...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {tables.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center flex flex-col items-center gap-4 animate-fade-in">
                    <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center">
                        <LayoutGrid size={32} className="text-stone-300" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-lg font-bold text-stone-900">No tables yet</p>
                        <p className="text-sm text-stone-500 max-w-[200px] mx-auto leading-relaxed">
                            Your restaurant floor is empty. Scale your business by adding tables!
                        </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="mt-2">
                        <Plus size={16} className="mr-1" /> Add Your First Table
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {tables.map((table: Table) => (
                        <TableItem 
                            key={table._id} 
                            table={table} 
                            onEdit={handleEdit} 
                            onDelete={handleDelete} 
                        />
                    ))}
                </div>
            )}

            {isModalOpen && (
                <TableFormModal 
                    table={editingTable} 
                    sections={sections}
                    onClose={handleModalClose} 
                    onSuccess={handleModalSuccess} 
                />
            )}
        </div>
    );
});
