import { useEffect } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import type { Order, Table } from '../../types';
import { formatCurrency, formatClockTime, capitalize } from '../../utils/format';
import './OrdersPage.css';

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
            <div className="orders-loading">
                <div className="orders-loading__spinner" />
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            {orders.length === 0 ? (
                <div className="orders-empty">
                    <span className="orders-empty__emoji">📋</span>
                    <h3>No orders today</h3>
                    <p>Orders will appear here as they come in</p>
                </div>
            ) : (
                <>
                    {/* Active Orders */}
                    {activeOrders.length > 0 && (
                        <section className="orders-section">
                            <h3 className="orders-section__title">Active ({activeOrders.length})</h3>
                            <div className="orders-list">
                                {activeOrders.map((order, idx) => (
                                    <OrderCard key={order._id} order={order} tableName={getTableName(order)} delay={idx * 40} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Served Orders */}
                    {servedOrders.length > 0 && (
                        <section className="orders-section">
                            <h3 className="orders-section__title orders-section__title--muted">
                                Completed ({servedOrders.length})
                            </h3>
                            <div className="orders-list">
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
            className={`order-card ${order.status === OrderStatus.SERVED ? 'order-card--served' : ''}`}
            style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
        >
            <div className="order-card__header">
                <div className="order-card__left">
                    <span className="order-card__number">#{order.orderNumber}</span>
                    <span className="order-card__table">{tableName}</span>
                </div>
                <Badge label={capitalize(order.status)} variant={order.status} />
            </div>

            {/* Status pipeline */}
            {order.status !== OrderStatus.SERVED && (
                <div className="status-pipeline">
                    {STATUS_PIPELINE.slice(0, -1).map((status, i) => (
                        <div
                            key={status}
                            className={`status-dot ${i <= statusIdx ? 'status-dot--active' : ''}`}
                            title={capitalize(status)}
                        />
                    ))}
                </div>
            )}

            {/* Items summary */}
            <div className="order-card__items">
                {order.items.slice(0, 3).map((item, i) => (
                    <span key={i} className="order-card__item">
                        {item.quantity}× {item.name}
                    </span>
                ))}
                {order.items.length > 3 && (
                    <span className="order-card__more">+{order.items.length - 3} more</span>
                )}
            </div>

            <div className="order-card__footer">
                <span className="order-card__time">{formatClockTime(order.createdAt)}</span>
                <span className="order-card__total">{formatCurrency(order.total)}</span>
            </div>
        </div>
    );
}
