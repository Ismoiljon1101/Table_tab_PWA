import { OrderStatus } from '../../types/enums';
import type { Order } from '../../types';
import { formatCurrency, formatClockTime } from '../../utils/format';
import { useOrdersStore } from '../../stores/ordersStore';
import { useCartStore } from '../../stores/cartStore';
import { Printer, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OrderCardProps {
    order: Order;
    tableName: string;
    delay?: number;
}

/**
 * OrderCard molecule
 * Refined high-density card with Print and Edit actions.
 */
export function OrderCard({ order, tableName, delay = 0 }: OrderCardProps) {
    const updateOrderStatus = useOrdersStore((s) => s.updateOrderStatus);
    const loadOrder = useCartStore((s) => s.loadOrder);
    const navigate = useNavigate();
    
    const waiterName = (order.waiterId as any)?.nickname || 'Staff';

    const handleEdit = () => {
        loadOrder(order);
        navigate('/menu');
    };

    const handlePrint = () => {
        console.log('🖨️ Printing order:', order.orderNumber);
        // This could trigger a backend print or a browser print
        alert(`Printing Order #${order.orderNumber} for ${tableName}`);
    };

    return (
        <div
            className={`flex flex-col gap-4 p-5 bg-white rounded-[24px] border border-stone-100 shadow-sm transition-all animate-[slideUp_0.3s_ease-out_backwards] ${order.status === OrderStatus.SERVED ? 'opacity-60 grayscale-[0.3]' : ''}`}
            style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
        >
            {/* Header: Order Info & Actions */}
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-[800] text-stone-900 tracking-tight">#{order.orderNumber}</span>
                        <span className="text-sm font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wide border border-amber-100/50">
                            {tableName}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-stone-400 mt-0.5 ml-0.5">by {waiterName}</span>
                </div>
                
                <div className="flex items-center gap-2">
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
                </div>
            </div>

            {/* Separator */}
            <div className="h-[1px] bg-stone-50 w-full" />

            {/* Full Items List */}
            <div className="flex flex-col gap-2">
                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start gap-3">
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-stone-800 leading-tight">
                                {item.quantity}× {item.name}
                            </span>
                            {item.modifiers && item.modifiers.length > 0 && (
                                <p className="text-[11px] text-stone-400 font-medium italic mt-0.5">
                                    {item.modifiers.map(m => `${m.name}: ${m.option}`).join(', ')}
                                </p>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-stone-400">
                            {formatCurrency(item.unitPrice * item.quantity)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer: Time & Total */}
            <div className="flex justify-between items-center text-stone-900 mt-1">
                <div className="flex items-start flex-col">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Total Amount</span>
                    <span className="text-xl font-[900] text-amber-600">{formatCurrency(order.total)}</span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block mb-0.5 text-right">Placed At</span>
                    <span className="text-xs font-black text-stone-500 bg-stone-50 px-2 py-1 rounded-md">{formatClockTime(order.createdAt)}</span>
                </div>
            </div>
        </div>
    );
}
