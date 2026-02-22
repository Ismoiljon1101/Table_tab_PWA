import { useEffect } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import type { Order, Table } from '../../types';
import { formatCurrency, formatClockTime, capitalize } from '../../utils/format';

/** Status order for pipeline display */
const STATUS_PIPELINE: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED,
];

/**
 * Active orders page — shows today's orders with real-time WebSocket updates.
 */
export function OrdersPage() {
    const { orders, isLoading, fetchTodayOrders, subscribeToUpdates } = useOrdersStore();

    useEffect(() => {
        fetchTodayOrders();
        const unsub = subscribeToUpdates();
        return unsub;
    }, [fetchTodayOrders, subscribeToUpdates]);

    /** Get active (non-served) orders first, then served */
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
            <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 text-stone-400">
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col min-h-full">
            {orders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
                    <span className="text-5xl">📋</span>
                    <h3 className="text-lg font-semibold text-stone-900">No orders today</h3>
                    <p className="text-stone-500">Orders will appear here as they come in</p>
                </div>
            ) : (
                <>
                    {/* Active Orders */}
                    {activeOrders.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-sm font-semibold text-stone-600 mb-3 uppercase tracking-wide">Active ({activeOrders.length})</h3>
                            <div className="flex flex-col gap-3">
                                {activeOrders.map((order, idx) => (
                                    <OrderCard key={order._id} order={order} tableName={getTableName(order)} delay={idx * 40} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Served Orders */}
                    {servedOrders.length > 0 && (
                        <section className="mb-6">
                            <h3 className="text-sm font-semibold text-stone-400 mb-3 uppercase tracking-wide">
                                Completed ({servedOrders.length})
                            </h3>
                            <div className="flex flex-col gap-3">
                                {servedOrders.map((order) => (
                                    <OrderCard key={order._id} order={order} tableName={getTableName(order)} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}

/** Individual order card */
function OrderCard({ order, tableName, delay = 0 }: { order: Order; tableName: string; delay?: number }) {
    const statusIdx = STATUS_PIPELINE.indexOf(order.status);

    return (
        <div
            className={`flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm border border-stone-100 animate-[slideUp_0.3s_ease-out_backwards] ${order.status === OrderStatus.SERVED ? 'opacity-60' : ''}`}
            style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
        >
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-stone-900">#{order.orderNumber}</span>
                    <span className="text-sm text-stone-500 bg-stone-50 px-2 py-0.5 rounded-md">{tableName}</span>
                </div>
                <Badge label={capitalize(order.status)} variant={order.status} />
            </div>

            {/* Status pipeline */}
            {order.status !== OrderStatus.SERVED && (
                <div className="flex items-center gap-2 py-1">
                    {STATUS_PIPELINE.slice(0, -1).map((status, i) => (
                        <div
                            key={status}
                            className={`flex-1 h-1 rounded-full transition-colors duration-300 ${i <= statusIdx ? 'bg-amber-600' : 'bg-stone-200'}`}
                            title={capitalize(status)}
                        />
                    ))}
                </div>
            )}

            {/* Items summary */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
                {order.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-sm text-stone-600">
                        {item.quantity}× {item.name}
                    </span>
                ))}
                {order.items.length > 3 && (
                    <span className="text-sm text-stone-400 italic">+{order.items.length - 3} more</span>
                )}
            </div>

            <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-stone-400">{formatClockTime(order.createdAt)}</span>
                <span className="text-base font-bold text-amber-600">{formatCurrency(order.total)}</span>
            </div>
        </div>
    );
}
