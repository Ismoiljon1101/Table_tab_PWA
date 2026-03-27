import { useEffect } from 'react';
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

    useEffect(() => {
        fetchTodayOrders();
        const unsub = subscribeToUpdates();
        return unsub;
    }, [fetchTodayOrders, subscribeToUpdates]);

    const activeOrders = orders.filter((o) => o.status !== OrderStatus.SERVED);
    const servedOrders = orders.filter((o) => o.status === OrderStatus.SERVED);

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
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 mb-2">
                    <h2 className="text-2xl font-bold text-stone-900 tracking-tight">Orders</h2>
                    <p className="text-sm text-stone-500">Real-time status of today's service</p>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20 px-4 text-center">
                        <span className="text-5xl">📋</span>
                        <h3 className="text-lg font-semibold text-stone-900">No orders today</h3>
                        <p className="text-stone-500">Orders will appear here as they come in</p>
                    </div>
                ) : (
                    <>
                        {activeOrders.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-stone-600 mb-3 uppercase tracking-wide">
                                    Active ({activeOrders.length})
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {activeOrders.map((order, idx) => (
                                        <OrderCard
                                            key={order._id}
                                            order={order}
                                            tableName={getTableName(order)}
                                            delay={idx * 40}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {servedOrders.length > 0 && (
                            <section>
                                <h3 className="text-sm font-semibold text-stone-400 mb-3 uppercase tracking-wide">
                                    Completed ({servedOrders.length})
                                </h3>
                                <div className="flex flex-col gap-3">
                                    {servedOrders.map((order) => (
                                        <OrderCard
                                            key={order._id}
                                            order={order}
                                            tableName={getTableName(order)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </StandardPageTemplate>
    );
}
