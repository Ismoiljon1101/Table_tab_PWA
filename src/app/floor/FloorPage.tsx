import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { UserRole, TableStatus } from '../../types/enums';
import type { Table } from '../../types';
import api from '../../services/api';

/**
 * Floor plan page — the primary view for waiters.
 * Shows draggable table cards with status colors.
 * Tap = select table for new order or show action sheet on occupied.
 */
export function FloorPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionTable, setActionTable] = useState<Table | null>(null);
    const user = useAuthStore((s) => s.user);
    const setTable = useCartStore((s) => s.setTable);
    const clearCart = useCartStore((s) => s.clearCart);
    const navigate = useNavigate();

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const { data } = await api.get<Table[]>('/tables');
            setTables(data);
        } catch (err) {
            console.error('Failed to fetch tables:', err);
        } finally {
            setLoading(false);
        }
    };

    /** Handle table tap */
    const handleTableTap = (table: Table) => {
        if (table.status === TableStatus.OCCUPIED) {
            setActionTable(table);
        } else {
            clearCart();
            setTable(table._id);
            navigate('/menu');
        }
    };

    /** Action sheet handlers */
    const handleAddMenu = () => {
        if (!actionTable) return;
        setTable(actionTable._id);
        navigate('/menu');
        setActionTable(null);
    };

    const handleNewCustomer = async () => {
        if (!actionTable) return;
        // Mark current order as served, then start fresh
        if (actionTable.currentOrderId) {
            try {
                await api.put(`/orders/${actionTable.currentOrderId}/status`, { status: 'served' });
            } catch (err) {
                console.error('Failed to complete order:', err);
            }
        }
        clearCart();
        setTable(actionTable._id);
        navigate('/menu');
        setActionTable(null);
    };

    const handleCancelOrder = async () => {
        if (!actionTable?.currentOrderId) return;
        // Note: BE doesn't have cancel endpoint yet, we set to served
        try {
            await api.put(`/orders/${actionTable.currentOrderId}/status`, { status: 'served' });
            await fetchTables();
        } catch (err) {
            console.error('Failed to cancel order:', err);
        }
        setActionTable(null);
    };

    /** Get status color class */
    const getStatusClass = (status: TableStatus): string => {
        switch (status) {
            case TableStatus.AVAILABLE: return 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white';
            case TableStatus.OCCUPIED: return 'border-amber-200 bg-gradient-to-b from-amber-50 to-white';
            case TableStatus.RESERVED: return 'border-blue-200 bg-gradient-to-b from-blue-50 to-white';
            default: return 'border-stone-200 bg-white';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p>Loading floor plan...</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            {/* Stats bar */}
            <div className="flex bg-white gap-4 p-3 rounded-xl shadow-sm mb-4 border border-stone-100">
                <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>{tables.filter((t) => t.status === TableStatus.AVAILABLE).length} Free</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    <span>{tables.filter((t) => t.status === TableStatus.OCCUPIED).length} Occupied</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>{tables.filter((t) => t.status === TableStatus.RESERVED).length} Reserved</span>
                </div>
            </div>

            {/* Table Grid */}
            {tables.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
                    <Users size={48} className="text-stone-400" />
                    <h3 className="text-lg font-semibold text-stone-900">No tables yet</h3>
                    <p className="text-stone-500 mb-2">Add tables to get started</p>
                    {isAdmin && (
                        <Button variant="primary" onClick={() => navigate('/settings')}>
                            <Plus size={18} className="mr-2" /> Add Tables
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {tables.map((table, idx) => (
                        <button
                            key={table._id}
                            className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 shadow-sm transition-all duration-200 active:scale-95 animate-[scaleIn_0.3s_ease-out_backwards] ${getStatusClass(table.status)}`}
                            style={{ animationDelay: `${idx * 40}ms` }}
                            onClick={() => handleTableTap(table)}
                        >
                            <span className="text-xl font-bold text-stone-900">{table.displayName || table.name}</span>
                            <Badge label={table.status} variant={table.status} />
                            <span className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                                <Users size={12} /> {table.capacity}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Action Sheet for occupied table */}
            {actionTable && (
                <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center animate-fade-in" onClick={() => setActionTable(null)}>
                    <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-5 pb-[calc(24px+env(safe-area-inset-bottom))] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="w-9 h-1 rounded-full bg-stone-300 mx-auto mb-5" />
                        <h3 className="text-xl font-bold text-center mb-1 text-stone-900">
                            {actionTable.displayName || actionTable.name}
                        </h3>
                        <p className="text-sm text-stone-500 text-center mb-6">This table has an active order</p>

                        <div className="flex flex-col gap-2">
                            <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-amber-50 text-amber-700 font-semibold transition-all duration-200 active:scale-95 active:bg-amber-100" onClick={handleAddMenu}>
                                <span className="text-xl">📋</span>
                                <span>Add Menu Items</span>
                            </button>
                            <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-stone-800 font-medium transition-all duration-200 active:scale-95 active:bg-stone-100" onClick={handleNewCustomer}>
                                <span className="text-xl">👋</span>
                                <span>New Customer</span>
                            </button>
                            <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-red-600 font-medium transition-all duration-200 active:scale-95 active:bg-red-50" onClick={handleCancelOrder}>
                                <span className="text-xl">❌</span>
                                <span>Cancel Order</span>
                            </button>
                        </div>

                        <button className="w-full mt-4 p-3 text-stone-500 font-medium rounded-xl active:bg-stone-50 transition-colors" onClick={() => setActionTable(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
