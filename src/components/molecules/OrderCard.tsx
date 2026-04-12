import { motion } from 'framer-motion';
import { Printer, Edit2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../atoms/Button';
import { useCartStore } from '../../stores/cartStore';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import { formatCurrency, formatClockTime } from '../../utils/format';
import type { Order } from '../../types';

interface OrderCardProps {
    order: Order;
    tableName: string;
    indexLabel?: string;
}

/**
 * OrderCard molecule — Upgraded with Shine aesthetics and cinematic motion.
 */
export function OrderCard({ order, tableName, indexLabel }: OrderCardProps) {
    const loadOrder = useCartStore((s) => s.loadOrder);
    const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
    const navigate = useNavigate();

    const waiterName = (order.waiterId as any)?.nickname || 'Staff';

    const handleEdit = () => {
        loadOrder(order);
        navigate('/menu');
    };

    const handlePrint = () => {
        console.log('🖨️ Printing order:', order.orderNumber);
        alert(`Printing Order #${order.orderNumber} for ${tableName}`);
    };

    const handleCancel = () => {
        const ok = window.confirm(
            `⚠️ VOID ORDER #${order.orderNumber}?\n\nThis will cancel the entire order for ${tableName} and notify the kitchen.`
        );
        if (ok) {
            updateOrderStatus(order._id, OrderStatus.CANCELLED);
        }
    };

    const handleUndo = () => {
        updateOrderStatus(order._id, OrderStatus.PENDING);
    };

    return (
        <div
            className={`flex flex-col p-4 bg-white/70 backdrop-blur-md rounded-[28px] border border-white/20 shadow-xl shadow-stone-900/5 h-full overflow-hidden transition-all ${
                order.status === OrderStatus.SERVED || order.status === OrderStatus.CANCELLED ? 'opacity-60 grayscale-[0.2]' : ''
            }`}
        >
            {/* ── HEADER ── */}
            <div className="flex justify-between items-start flex-shrink-0 mb-2">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-[900] text-stone-900 tracking-tighter">
                            #{order.orderNumber}
                        </span>
                        <div className="relative">
                            {order.status !== OrderStatus.SERVED && order.status !== OrderStatus.CANCELLED && (
                                <span className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-20" />
                            )}
                            <span className="relative text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-100/50">
                                {tableName}
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">
                        by {waiterName} • {formatClockTime(order.createdAt)}
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    {indexLabel && (
                        <span className="text-[10px] font-bold text-stone-400 tabular-nums mr-1">
                            {indexLabel}
                        </span>
                    )}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrint}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100/50 active:bg-orange-100 transition-all"
                    >
                        <Printer size={16} />
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleEdit}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 border border-stone-100 active:bg-stone-100 active:text-stone-600 transition-all"
                    >
                        <Edit2 size={16} />
                    </motion.button>
                </div>
            </div>

            {/* ── ITEM SCROLL AREA: Ultra-dense ── */}
            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                <div className="flex flex-col">
                    {order.items.map((item: any, i: number) => {
                        const isDeleted = item.status === 'deleted';
                        return (
                            <div key={i} className={`py-0.5 border-b border-stone-100/30 last:border-0 transition-all ${
                                isDeleted ? 'opacity-30' : ''
                            }`}>
                                <div className="flex justify-between items-center group">
                                    <div className="flex gap-2.5 min-w-0 flex-1">
                                        <span className={`text-[12px] font-black tabular-nums flex-shrink-0 ${isDeleted ? 'text-stone-400' : 'text-amber-600'}`}>
                                            {item.quantity}×
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-[12px] font-black leading-none truncate ${isDeleted ? 'text-stone-400 line-through' : 'text-stone-800'}`}>
                                                {item.name}
                                            </span>
                                            {item.modifiers && item.modifiers.length > 0 && !isDeleted && (
                                                <p className="text-[8px] font-medium text-stone-400 italic leading-none mt-0.5">
                                                    {item.modifiers.map((m: any) => m.option).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-stone-400 tabular-nums ml-2">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── FOOTER: Ultra-compact single row ── */}
            <div className="pt-2 border-t border-stone-100 flex-shrink-0 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-[14px] font-[900] text-amber-600 tracking-tighter tabular-nums leading-none">
                        {formatCurrency(order.total)}
                    </span>
                    <span className="text-[8px] text-stone-400 uppercase tracking-widest font-black">
                        Total Amount
                    </span>
                </div>
                
                <div className="flex gap-1.5">
                    {order.status === OrderStatus.CANCELLED ? (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUndo}
                            className="h-8 px-3 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest"
                        >
                            Restore
                        </motion.button>
                    ) : (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCancel}
                            className="h-8 px-3 rounded-lg bg-red-50 text-red-500 border border-red-100 text-[10px] font-black uppercase tracking-widest active:bg-red-100 transition-all"
                        >
                            Void
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
