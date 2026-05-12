import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SectionTabs } from '../../components/organisms/SectionTabs';
import { FloorTemplate } from '../../components/templates/FloorTemplate';
import { FloorPlanCanvas } from '../../components/organisms/FloorPlanCanvas';
import { TableActionSheet } from '../../components/organisms/TableActionSheet';
import { ConfirmationModal } from '../../components/molecules/ConfirmationModal';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { UserRole } from '../../types/enums';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import { mongoIdsMatch } from '../../libs/mongoId';
import type { Table, Section } from '../../types';

export function FloorPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const currentFloorName = useAuthStore((s) => s.currentFloorName);
    const setCurrentFloorName = useAuthStore((s) => s.setCurrentFloorName);
    const cart = useCartStore();

    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [actionTable, setActionTable] = useState<Table | null>(null);
    const [pendingTable, setPendingTable] = useState<Table | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    // 1. Fetch Sections
    const { data: sections = [], isSuccess: isSectionsLoaded } = useQuery({
        queryKey: ['sections'],
        queryFn: async () => {
            const res = await api.get<Section[]>('/sections');
            return res.data;
        },
        enabled: !!user
    });

    // 2. Fetch Tables
    const { data: tables = [], isLoading, error: apiError } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const res = await api.get<Table[]>('/tables');
            return res.data;
        },
        enabled: !!user
    });

    // Handle initial section selection once data is loaded
    useEffect(() => {
        if (!isSectionsLoaded) return;

        if (sections.length > 0) {
            if (!selectedSectionId) {
                setSelectedSectionId(sections[0]._id);
                if (currentFloorName !== sections[0].name) {
                    setCurrentFloorName(sections[0].name);
                }
            }
        } else {
            if (currentFloorName !== 'Floor Plan') {
                setCurrentFloorName('Floor Plan');
            }
        }
    }, [sections, selectedSectionId, currentFloorName, setCurrentFloorName, isSectionsLoaded]);

    // 3. Real-time updates via Sockets
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleTableChanged = (updatedTable: Table) => {
            queryClient.setQueryData(['tables'], (old: Table[] | undefined) => {
                if (!old) return [updatedTable];
                return old.map(t => mongoIdsMatch(t._id, updatedTable._id) ? { ...t, ...updatedTable } : t);
            });
        };

        socket.on('table-status-changed', handleTableChanged);
        return () => { socket.off('table-status-changed', handleTableChanged); };
    }, [queryClient]);

    const handleSelectSection = (id: string | null) => {
        setSelectedSectionId(id);
        const section = sections.find(s => mongoIdsMatch(s._id, id));
        setCurrentFloorName(section ? section.name : 'Floor Plan');
    };

    const handleTableTap = (table: Table) => {
        if (cart.items.length > 0 && cart.tableId && !mongoIdsMatch(cart.tableId, table._id)) {
            setPendingTable(table);
            return;
        }
        processTableTap(table);
    };

    const processTableTap = (table: Table) => {
        if (table.status === 'occupied') {
            setActionTable(table);
        } else {
            if (cart.tableId && !mongoIdsMatch(cart.tableId, table._id)) {
                cart.clearCart();
            }
            cart.setTable(table._id);
            navigate('/menu');
        }
    };

    const handleClearCartConfirm = () => {
        if (pendingTable) {
            cart.clearCart();
            processTableTap(pendingTable);
            setPendingTable(null);
        }
    };

    const handleAddMenu = async () => {
        if (!actionTable) return;
        setIsActionLoading(true);
        try {
            if (actionTable.currentOrderId) {
                const res = await api.get(`/orders/${actionTable.currentOrderId}`);
                cart.loadOrder(res.data);
            } else {
                cart.clearCart();
                cart.setTable(actionTable._id);
            }
            navigate('/menu');
            setActionTable(null);
        } catch (err) {
            console.error('Failed to load add-ons:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleNewCustomer = async () => {
        if (!actionTable) return;
        setIsActionLoading(true);
        try {
            if (actionTable.currentOrderId) {
                await api.patch(`/orders/${actionTable.currentOrderId}/status`, { status: 'served' });
            } else {
                await api.patch(`/tables/${actionTable._id}`, { status: 'available', currentOrderId: null });
            }
            // Invalidate to trigger a clean re-fetch from source of truth
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            cart.clearCart();
            cart.setTable(actionTable._id);
            navigate('/menu');
            setActionTable(null);
        } catch (err) {
            console.error('Failed to complete order:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!actionTable) return;
        setIsActionLoading(true);
        try {
            if (actionTable.currentOrderId) {
                await api.patch(`/orders/${actionTable.currentOrderId}/status`, { status: 'cancelled' });
            } else {
                await api.patch(`/tables/${actionTable._id}`, { status: 'available', currentOrderId: null });
            }
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            setActionTable(null);
        } catch (err) {
            console.error('Failed to cancel order:', err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const displayedTables = useMemo(() => {
        if (!selectedSectionId) return tables;
        return tables.filter(t => mongoIdsMatch(t.section, selectedSectionId));
    }, [tables, selectedSectionId]);

    /** Standardize Optimistic Update for any table field */
    const handleTableUpdate = (tableId: string, updates: Partial<Table>) => {
        queryClient.setQueryData(['tables'], (old: Table[] | undefined) => {
            if (!old) return [];
            return old.map(t => mongoIdsMatch(t._id, tableId) ? { ...t, ...updates } : t);
        });
    };

    const handleTableMoved = (tableId: string, x: number, y: number) => {
        handleTableUpdate(tableId, { position: { x, y } });
    };

    if (isLoading && tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p>Loading floor plan...</p>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="flex flex-col items-start gap-3 m-4 p-5 bg-red-50 border border-red-200 rounded-3xl text-sm shadow-sm">
                <div className="flex items-center gap-2 text-red-700 font-bold">
                    <span>⚠️ Connection Failure</span>
                </div>
                <div className="w-full bg-white/50 p-3 rounded-xl border border-red-100 font-mono text-[11px] text-red-600 overflow-auto max-h-[200px]">
                    {(apiError as any).message || 'Server unreachable'}
                </div>
                <button
                    className="w-full py-3 bg-red-600 text-white font-semibold rounded-2xl"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['tables'] })}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const header = (
        <div className="flex flex-col bg-white">
            <SectionTabs 
                sections={sections} 
                selectedSectionId={selectedSectionId} 
                onSelectSection={handleSelectSection} 
            />
            <div className="px-4 py-2 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[9px] text-stone-400">Status: {tables.length} tables found</span>
                <button 
                    onClick={() => { localStorage.removeItem(`floor_pan_${user?.restaurantId}`); window.location.reload(); }}
                    className="text-[10px] uppercase tracking-widest font-bold text-stone-400"
                >
                    Reset View
                </button>
            </div>
        </div>
    );

    return (
        <FloorTemplate
            header={header}
            actionSheet={actionTable && (
                <TableActionSheet
                    table={actionTable}
                    onClose={() => setActionTable(null)}
                    onAddMenu={handleAddMenu}
                    onNewCustomer={handleNewCustomer}
                    onCancelOrder={handleCancelOrder}
                    isLoading={isActionLoading}
                />
            )}
        >
            {displayedTables.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-stone-400 gap-4">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-2xl opacity-50">🍽️</div>
                    <p className="font-semibold text-stone-600">No Tables in this Section</p>
                </div>
            ) : (
                <FloorPlanCanvas
                    tables={displayedTables}
                    isAdmin={isAdmin}
                    onTableTap={handleTableTap}
                    onAddTables={() => navigate('/settings')}
                    onTableMoved={handleTableMoved}
                    onTableUpdate={handleTableUpdate}
                />
            )}

            {pendingTable && (() => {
                const currentTable = tables.find(t => mongoIdsMatch(t._id, cart.tableId));
                const currentTableName = currentTable?.displayName || currentTable?.name || 'another table';
                return (
                    <ConfirmationModal 
                        title="Clear cart?"
                        message={`You have unsaved items for ${currentTableName}. Clear cart and switch to ${pendingTable.displayName || pendingTable.name}?`}
                        onConfirm={handleClearCartConfirm}
                        onCancel={() => setPendingTable(null)}
                    />
                );
            })()}
        </FloorTemplate>
    );
}
