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
import './FloorPage.css';

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
            case TableStatus.AVAILABLE: return 'floor-table--available';
            case TableStatus.OCCUPIED: return 'floor-table--occupied';
            case TableStatus.RESERVED: return 'floor-table--reserved';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="floor-loading">
                <div className="floor-loading__spinner" />
                <p>Loading floor plan...</p>
            </div>
        );
    }

    return (
        <div className="floor-page">
            {/* Stats bar */}
            <div className="floor-stats">
                <div className="floor-stat">
                    <span className="floor-stat__dot floor-stat__dot--available" />
                    <span>{tables.filter((t) => t.status === TableStatus.AVAILABLE).length} Free</span>
                </div>
                <div className="floor-stat">
                    <span className="floor-stat__dot floor-stat__dot--occupied" />
                    <span>{tables.filter((t) => t.status === TableStatus.OCCUPIED).length} Occupied</span>
                </div>
                <div className="floor-stat">
                    <span className="floor-stat__dot floor-stat__dot--reserved" />
                    <span>{tables.filter((t) => t.status === TableStatus.RESERVED).length} Reserved</span>
                </div>
            </div>

            {/* Table Grid */}
            {tables.length === 0 ? (
                <div className="floor-empty">
                    <Users size={48} color="var(--text-muted)" />
                    <h3>No tables yet</h3>
                    <p>Add tables to get started</p>
                    {isAdmin && (
                        <Button variant="primary" onClick={() => navigate('/settings')}>
                            <Plus size={18} /> Add Tables
                        </Button>
                    )}
                </div>
            ) : (
                <div className="floor-grid">
                    {tables.map((table, idx) => (
                        <button
                            key={table._id}
                            className={`floor-table ${getStatusClass(table.status)}`}
                            style={{ animationDelay: `${idx * 40}ms` }}
                            onClick={() => handleTableTap(table)}
                        >
                            <span className="floor-table__name">{table.displayName || table.name}</span>
                            <Badge label={table.status} variant={table.status} />
                            <span className="floor-table__capacity">
                                <Users size={12} /> {table.capacity}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Action Sheet for occupied table */}
            {actionTable && (
                <div className="action-overlay" onClick={() => setActionTable(null)}>
                    <div className="action-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="action-sheet__handle" />
                        <h3 className="action-sheet__title">
                            {actionTable.displayName || actionTable.name}
                        </h3>
                        <p className="action-sheet__desc">This table has an active order</p>

                        <div className="action-sheet__actions">
                            <button className="action-btn action-btn--primary" onClick={handleAddMenu}>
                                <span className="action-btn__emoji">📋</span>
                                <span>Add Menu Items</span>
                            </button>
                            <button className="action-btn" onClick={handleNewCustomer}>
                                <span className="action-btn__emoji">👋</span>
                                <span>New Customer</span>
                            </button>
                            <button className="action-btn action-btn--danger" onClick={handleCancelOrder}>
                                <span className="action-btn__emoji">❌</span>
                                <span>Cancel Order</span>
                            </button>
                        </div>

                        <button className="action-sheet__cancel" onClick={() => setActionTable(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
