import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

/**
 * FloorPage
 * Refactored to use Atomic Design (Templates, Organisms, Molecules).
 */
export function FloorPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionTable, setActionTable] = useState<Table | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiLogs, setApiLogs] = useState<{ time: string, msg: string }[]>([]);
    const [pendingTable, setPendingTable] = useState<Table | null>(null);

    const user = useAuthStore((s) => s.user);
    const setCurrentFloorName = useAuthStore((s) => s.setCurrentFloorName);
    const cart = useCartStore();
    const navigate = useNavigate();

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    const addLog = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        setApiLogs(prev => [{ time, msg }, ...prev].slice(0, 5));
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            setApiError(null);
            addLog('Initializing floor plan...');
            try {
                await Promise.all([fetchTables(), fetchSections()]);
                addLog('Initialization complete');
            } catch (err: any) {
                console.error('Critical Floor Init Error:', err);
                setApiError(`Init Error: ${err.message || 'Unknown crash'}`);
                addLog(`CRASH: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    /** Subscribe to real-time table updates from other tablets */
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleTableChanged = (updatedTable: Table) => {
            setTables(prev => prev.map(t =>
                mongoIdsMatch(t._id, updatedTable._id) ? { ...t, ...updatedTable } : t
            ));
        };

        socket.on('table-status-changed', handleTableChanged);
        return () => { socket.off('table-status-changed', handleTableChanged); };
    }, []);

    const fetchTables = async () => {
        try {
            const res = await api.get<Table[]>('/tables');
            setTables(res.data);
            addLog(`Fetched ${res.data.length} tables`);
        } catch (err: unknown) {
            const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Unknown error';
            const status = (err as any)?.response?.status;
            setApiError(`Tables API failed: ${status ? `[${status}]` : ''} ${msg}`);
            addLog(`Tables API Error: ${status || 'ERR'}`);
            console.error('Failed to fetch tables:', err);
        }
    };

    const fetchSections = async () => {
        try {
            const res = await api.get<Section[]>('/sections');
            const secs = res.data;
            setSections(secs);
            // Auto-select the first section right away — avoids race with useEffect
            if (secs.length > 0) {
                setSelectedSectionId(secs[0]._id);
                setCurrentFloorName(secs[0].name);
            } else {
                setCurrentFloorName('Floor Plan');
            }
        } catch (err) {
            const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Unknown error';
            const status = (err as any)?.response?.status;
            setApiError(prev => `${prev ?? ''}\nSections API failed: ${status ? `[${status}]` : ''} ${msg}`);
            console.error('Failed to fetch sections:', err);
        }
    };


    const handleSelectSection = (id: string | null) => {
        setSelectedSectionId(id);
        const section = sections.find(s => s._id === id);
        setCurrentFloorName(section ? section.name : 'Floor Plan');
    };

    const handleTableTap = (table: Table) => {
        // Only trigger "Clear Cart?" if switching to a DIFFERENT table with unsaved items
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
            // ONLY clear the cart if it's a DIFFERENT table.
            // If it's the same table, we want to keep the items!
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

    const handleClearCartCancel = () => {
        setPendingTable(null);
    };

    const handleAddMenu = () => {
        if (!actionTable) return;
        cart.setTable(actionTable._id);
        navigate('/menu');
        setActionTable(null);
    };

    const handleNewCustomer = async () => {
        if (!actionTable) return;
        if (actionTable.currentOrderId) {
            try {
                await api.patch(`/orders/${actionTable.currentOrderId}/status`, { status: 'served' });
            } catch (err) {
                console.error('Failed to complete order:', err);
            }
        }
        cart.clearCart();
        cart.setTable(actionTable._id);
        navigate('/menu');
        setActionTable(null);
    };

    const handleCancelOrder = async () => {
        if (!actionTable?.currentOrderId) return;
        try {
            await api.patch(`/orders/${actionTable.currentOrderId}/status`, { status: 'cancelled' });
            await fetchTables();
        } catch (err) {
            console.error('Failed to cancel order:', err);
        }
        setActionTable(null);
    };

    /**
     * Filter tables by the selected section.
     * Uses mongoIdsMatch to safely compare regardless of ObjectId serialization.
     */
    const displayedTables = selectedSectionId
        ? tables.filter(t => mongoIdsMatch(t.section, selectedSectionId))
        : tables;

    /** Optimistically update a table in local state */
    const handleTableUpdate = (tableId: string, updates: Partial<Table>) => {
        setTables(prev => prev.map(t =>
            t._id === tableId ? { ...t, ...updates } : t
        ));
    };

    const handleTableMoved = (tableId: string, x: number, y: number) => {
        handleTableUpdate(tableId, { position: { x, y } });
    };

    console.log('[FloorPage] RENDER - Tables:', tables.length, 'Sections:', sections.length);

    try {
        if (loading && tables.length === 0 && sections.length === 0) {
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
                        <span>⚠️ Floor Data Failure</span>
                    </div>
                    <div className="w-full bg-white/50 p-3 rounded-xl border border-red-100 font-mono text-[11px] text-red-600 overflow-auto max-h-[200px]">
                        {apiError}
                    </div>
                    <button
                        className="w-full py-3 bg-red-600 text-white font-semibold rounded-2xl"
                        onClick={() => { setApiError(null); window.location.reload(); }}
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
                    />
                )}
            >
                {displayedTables.length === 0 && !loading ? (
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

                {/* Debug Overlay */}
                <div className="fixed bottom-20 left-4 right-4 z-[100] pointer-events-none flex flex-col items-start gap-1">
                    {apiLogs.map((log, i) => (
                        <div key={i} className="bg-black/80 text-white text-[9px] px-2 py-1 rounded">
                            {log.time} - {log.msg}
                        </div>
                    ))}
                </div>

                {/* Confirmation Modals */}
                {pendingTable && (() => {
                    // Try to find the name of the table currently in the cart
                    const currentTable = tables.find(t => mongoIdsMatch(t._id, cart.tableId));
                    const currentTableName = currentTable?.displayName || currentTable?.name || 'another table';
                    
                    return (
                        <ConfirmationModal 
                            title="Clear cart?"
                            message={`You have unsaved items for ${currentTableName}. Clear cart and switch to ${pendingTable.displayName || pendingTable.name}?`}
                            onConfirm={handleClearCartConfirm}
                            onCancel={handleClearCartCancel}
                        />
                    );
                })()}
            </FloorTemplate>
        );
    } catch (renderErr: any) {
        console.error('CRITICAL RENDER ERROR:', renderErr);
        return (
            <div className="p-10 text-red-600 bg-red-50 rounded-3xl m-4 border-2 border-red-200">
                <h2 className="font-bold mb-2">Internal Render Crash</h2>
                <pre className="text-[10px] whitespace-pre-wrap">{renderErr.message}</pre>
                <pre className="text-[10px] opacity-50 mt-4">{renderErr.stack}</pre>
            </div>
        );
    }
}
