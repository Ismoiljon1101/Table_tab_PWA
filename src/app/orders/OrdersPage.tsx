import { useEffect, useState } from 'react';
import { StandardPageTemplate } from '../../components/templates/StandardPageTemplate';
import { OrderCard } from '../../components/molecules/OrderCard';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import type { Order, Table } from '../../types';

/**
 * OrdersPage
 * Refactored to use Atomic Design (Templates, Molecules).
 */
export function OrdersPage() {
    const { orders, isLoading, fetchTodayOrders, subscribeToUpdates } = useOrdersStore();
    const [activeTab, setActiveTab] = useState<'active' | 'finished'>('active');

    useEffect(() => {
        fetchTodayOrders();
        const unsub = subscribeToUpdates();
        return unsub;
    }, [fetchTodayOrders, subscribeToUpdates]);

    const activeOrders = orders.filter((o) => o.status !== OrderStatus.SERVED);
    const finishedOrders = orders.filter((o) => o.status === OrderStatus.SERVED);

    const displayOrders = activeTab === 'active' ? activeOrders : finishedOrders;

    const getTableName = (order: Order): string => {
        if (typeof order.tableId === 'object' && order.tableId !== null) {
            return (order.tableId as Table).displayName || (order.tableId as Table).name;
        }
        return 'Table';
    };

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <StandardPageTemplate header={null}>
            <div className="flex flex-col gap-5">
                {/* High-density Toggles */}
                <div className="flex bg-stone-100 p-1 rounded-[20px] gap-1 sticky top-0 z-[60] shadow-sm">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[16px] transition-all ${activeTab === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
                    >
                        Active ({activeOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('finished')}
                        className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[16px] transition-all ${activeTab === 'finished' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
                    >
                        Finished ({finishedOrders.length})
                    </button>
                </div>

                {displayOrders.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 px-4 text-center opacity-30">
                        <span className="text-5xl">📋</span>
                        <h3 className="text-lg font-black text-stone-900 uppercase">Empty {activeTab}</h3>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {displayOrders.map((order, idx) => (
                            <OrderCard
                                key={order._id}
                                order={order}
                                tableName={getTableName(order)}
                                delay={idx * 40}
                            />
                        ))}
                    </div>
                )}
            </div>
        </StandardPageTemplate>
    );
}
