import type { Order } from '../../types';
import { OrderStatus } from '../../types/enums';
import { formatCurrency, formatClockTime } from '../../utils/format';
import { useCartStore } from '../../stores/cartStore';
import { Printer, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrdersStore } from '../../stores/ordersStore';

interface OrderCardProps {
    /** The order to display */
    order: Order;
    /** Resolved table display name */
    tableName: string;
    /** Position label e.g. "2 / 5" shown in top-right corner */
    indexLabel?: string;
}

/**
 * OrderCard molecule — flat card, no internal rail.
 * Ultra-dense item list: 3px padding per row + 1px separator.
 */
export function OrderCard({ order, tableName, indexLabel }: OrderCardProps) {
    const loadOrder = useCartStore((s) => s.loadOrder);
    const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
    const navigate = useNavigate();

    const waiterName = (order.waiterId as any)?.nickname || 'Staff';

    /** Load this order into the cart and navigate to menu for editing */
    const handleEdit = () => {
        loadOrder(order);
        navigate('/menu');
    };

    /** Trigger the kitchen print flow */
    const handlePrint = () => {
        console.log('🖨️ Printing order:', order.orderNumber);
        alert(`Printing Order #${order.orderNumber} for ${tableName}`);
    };

    /** Cancel/Void the entire order with a confirmation prompt */
    const handleCancel = () => {
        const ok = window.confirm(
            `⚠️ VOID ORDER #${order.orderNumber}?\n\nThis will cancel the entire order for ${tableName} and notify the kitchen.`
        );
        if (ok) {
            updateOrderStatus(order._id, OrderStatus.CANCELLED);
        }
    };

    /** Restore a cancelled order back to PENDING */
    const handleUndo = () => {
        updateOrderStatus(order._id, OrderStatus.PENDING);
    };

    return (
        <div
            className={`flex flex-col gap-3 p-5 bg-white rounded-[24px] border border-stone-100 shadow-sm h-full overflow-y-auto transition-all ${order.status === OrderStatus.SERVED || order.status === OrderStatus.CANCELLED ? 'opacity-50 grayscale-[0.5]' : ''
                }`}
        >
            {/* ── HEADER ── */}
            <div className="flex justify-between items-start flex-shrink-0">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-[900] text-stone-900 tracking-tight">
                            #{order.orderNumber}
                        </span>
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wide border border-amber-100/50">
                            {tableName}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-stone-400 mt-0.5">
                        by {waiterName} · {formatClockTime(order.createdAt)}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {indexLabel && (
                        <span className="text-[11px] font-black text-stone-400 tabular-nums mr-1">
                            {indexLabel}
                        </span>
                    )}
                    <button
                        onClick={handlePrint}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 active:bg-orange-100 transition-all"
                        title="Print Ticket"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={handleEdit}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 active:bg-stone-100 active:text-stone-600 transition-all"
                        title="Edit Order"
                    >
                        <Edit2 size={18} />
                    </button>
                    {order.status !== OrderStatus.CANCELLED && (
                        <button
                            onClick={handleCancel}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 active:bg-red-100 transition-all"
                            title="Void Order"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── DIVIDER ── */}
            <div className="h-[1px] bg-stone-100 w-full flex-shrink-0" />

            {/* ── ITEMS LIST: ultra-dense 3px padding + 1px separator ── */}
            <div className="flex flex-col flex-1 overflow-y-auto">
                {order.items.map((item: any, i: number) => {
                    const isDeleted = item.status === 'deleted';
                    return (
                        <div key={i}>
                            {/* Item row */}
                            <div className={`flex justify-between items-center ${isDeleted ? 'opacity-40' : ''}`}>
                                {/* Left: qty + name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className={`text-[15px] font-black tabular-nums flex-shrink-0 ${isDeleted ? 'text-stone-400' : 'text-amber-600'}`}>
                                        {isDeleted ? '0' : item.quantity}×
                                    </span>
                                    <div className="flex flex-col min-w-0">
                                        <span className={`text-[15px] font-bold leading-tight break-words ${isDeleted ? 'text-stone-400 line-through decoration-2' : 'text-stone-800'}`}>
                                            {item.name}
                                        </span>
                                        {item.modifiers && item.modifiers.length > 0 && !isDeleted && (
                                            <p className="text-[10px] text-stone-400 font-medium italic leading-tight">
                                                {item.modifiers.map((m: any) => `${m.name}: ${m.option}`).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right: status badge + price */}
                                <div className="flex flex-col items-end flex-shrink-0">
                                    <span className={`text-[8px] font-black px-1 py-px rounded-[3px] border uppercase tracking-wider ${isDeleted
                                        ? 'bg-stone-50 text-stone-400 border-stone-100'
                                        : item.isAdditional
                                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                                            : 'bg-stone-50 text-stone-400 border-stone-100'
                                        }`}>
                                        {isDeleted ? 'DELETED' : item.isAdditional ? 'ADDITIONAL' : 'UPDATED'}
                                    </span>

                                </div>
                            </div>

                            {/* 1px separator — skip after last item */}
                            {i < order.items.length - 1 && (
                                <div className="h-px bg-stone-100" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── FOOTER ── */}
            <div className="flex justify-between items-center flex-shrink-0 pt-2 border-t border-stone-50">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    Total
                </span>
                <div className="flex items-center gap-2">
                    {order.status === OrderStatus.CANCELLED && (
                        <button
                            onClick={handleUndo}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-black uppercase tracking-widest active:bg-amber-100 transition-all"
                            title="Restore order to active"
                        >
                            <RotateCcw size={12} />
                            Undo
                        </button>
                    )}
                    <span className="text-2xl font-[900] text-amber-600">
                        {formatCurrency(order.total)}
                    </span>
                </div>
            </div>
        </div>
    );
}
