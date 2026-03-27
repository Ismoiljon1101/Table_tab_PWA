import { Badge } from '../atoms/Badge';
import { OrderStatus } from '../../types/enums';
import type { Order } from '../../types';
import { formatCurrency, formatClockTime, capitalize } from '../../utils/format';

/** Status order for pipeline display */
const STATUS_PIPELINE: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED,
];

interface OrderCardProps {
    order: Order;
    tableName: string;
    delay?: number;
}

/**
 * OrderCard molecule
 * Displays an individual order with status pipeline and item summary.
 */
export function OrderCard({ order, tableName, delay = 0 }: OrderCardProps) {
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
