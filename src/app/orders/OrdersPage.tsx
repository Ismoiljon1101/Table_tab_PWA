import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import type { Order, Table } from '../../types';
import { OrderCard } from '../../components/molecules/OrderCard';

/**
 * OrdersPage — Fullscreen swipeable order viewer.
 * Upgraded with Shine aesthetics and Bento layout.
 */
export function OrdersPage() {
    const { orders, isLoading, fetchTodayOrders, subscribeToUpdates } = useOrdersStore();
    const [activeTab, setActiveTab] = useState<'active' | 'finished' | 'cancelled'>('active');
    const [currentIndex, setCurrentIndex] = useState(0);

    const trackRef = useRef<HTMLDivElement>(null);
    const swipeAreaRef = useRef<HTMLDivElement>(null);
    const isDraggingHandle = useRef(false);
    const swipeTouchStartY = useRef<number | null>(null);

    useEffect(() => {
        fetchTodayOrders();
        const unsub = subscribeToUpdates();
        return unsub;
    }, [fetchTodayOrders, subscribeToUpdates]);

    const activeOrders = orders.filter((o) => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED);
    const finishedOrders = orders.filter((o) => o.status === OrderStatus.SERVED);
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);

    const displayOrders = 
        activeTab === 'active' ? activeOrders : 
        activeTab === 'finished' ? finishedOrders : 
        cancelledOrders;

    const total = displayOrders.length;
    const safeIndex = total > 0 ? Math.max(0, Math.min(currentIndex, total - 1)) : 0;

    const getTableName = (order: Order): string => {
        if (typeof order.tableId === 'object' && order.tableId !== null) {
            return (order.tableId as Table).displayName || (order.tableId as Table).name;
        }
        return 'Table';
    };

    const yToIndex = useCallback(
        (clientY: number): number => {
            const track = trackRef.current;
            if (!track || total <= 1) return 0;
            const rect = track.getBoundingClientRect();
            const ratio = (clientY - rect.top) / rect.height;
            const clamped = Math.max(0, Math.min(1, ratio));
            return Math.round(clamped * (total - 1));
        },
        [total]
    );

    const handlePercent = total <= 1 ? 0 : (safeIndex / (total - 1)) * 100;

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            if (!isDraggingHandle.current) return;
            e.preventDefault();
            setCurrentIndex(yToIndex(e.clientY));
        };
        const onPointerUp = () => {
            isDraggingHandle.current = false;
        };
        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [yToIndex]);

    useEffect(() => {
        const el = swipeAreaRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            swipeTouchStartY.current = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            if (Math.abs(swipeTouchStartY.current! - e.touches[0].clientY) > 10) {
                e.preventDefault();
            }
        };
        const onTouchEnd = (e: TouchEvent) => {
            if (swipeTouchStartY.current === null) return;
            const delta = swipeTouchStartY.current - e.changedTouches[0].clientY;
            swipeTouchStartY.current = null;
            if (Math.abs(delta) < 50) return;
            setCurrentIndex((prev) =>
                delta > 0
                    ? Math.min(prev + 1, total - 1)
                    : Math.max(prev - 1, 0)
            );
        };

        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
        };
    }, [total]);

    if (isLoading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60dvh]">
                <div className="w-10 h-10 rounded-full border-4 border-stone-100 border-t-amber-600 animate-spin" />
            </div>
        );
    }

    const tabs = [
        { id: 'active', label: 'Active', count: activeOrders.length },
        { id: 'finished', label: 'Finished', count: finishedOrders.length },
        { id: 'cancelled', label: 'Cancelled', count: cancelledOrders.length }
    ];

    return (
        <div className="flex flex-col bg-[#fafafa] h-full overflow-hidden">
            {/* Tab Toggle with Sliding Indicator */}
            <div className="mx-4 mt-6 mb-4 p-1.5 bg-stone-200/50 backdrop-blur-md rounded-[24px] flex relative gap-1 border border-white/20">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setCurrentIndex(0);
                            }}
                            className={`flex-1 py-3.5 text-[11px] font-black uppercase tracking-[0.1em] rounded-[20px] transition-colors relative z-10 ${
                                isActive ? 'text-stone-900' : 'text-stone-400'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="ordersTabActive"
                                    className="absolute inset-0 bg-white shadow-xl shadow-stone-900/5 rounded-[20px]"
                                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label} ({tab.count})</span>
                        </motion.button>
                    );
                })}
            </div>

            {displayOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-24 px-4 text-center">
                    <motion.span 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-6xl"
                    >
                        📋
                    </motion.span>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-black text-stone-900 uppercase tracking-tighter">
                            Empty {activeTab} Queue
                        </h3>
                        <p className="text-sm text-stone-400 font-medium">No orders are currently being {activeTab === 'active' ? 'prepared' : activeTab === 'finished' ? 'served' : 'cancelled'}.</p>
                    </div>
                </div>
            ) : (
                <div className="flex flex-1 gap-2 px-4 pb-6 overflow-hidden min-h-0">

                    {/* ── PROFESSIONAL ANALOG SCRUBBER ── */}
                    <div 
                        className="flex-shrink-0 w-12 flex flex-col items-center mr-3 relative py-4 select-none h-full max-h-[600px]"
                        role="slider"
                        aria-valuemin={1}
                        aria-valuemax={total}
                        aria-valuenow={safeIndex + 1}
                        aria-label="Order navigation scrubber"
                    >
                        {/* Upper Control */}
                        <motion.button 
                            whileTap={{ scale: 0.7 }}
                            onClick={() => {
                                if (safeIndex > 0) {
                                    setCurrentIndex(safeIndex - 1);
                                    window.navigator.vibrate?.(10);
                                }
                            }}
                            className="mb-6 text-stone-300 hover:text-stone-900 transition-colors"
                        >
                            <ChevronUp size={20} strokeWidth={2.5} />
                        </motion.button>

                        <div
                            ref={trackRef}
                            className="relative w-full flex-1 flex flex-col items-center group cursor-pointer touch-none"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const ratio = (e.clientY - rect.top) / rect.height;
                                const newIdx = Math.round(ratio * (total - 1));
                                if (newIdx !== safeIndex) {
                                    setCurrentIndex(newIdx);
                                    window.navigator.vibrate?.(5);
                                }
                            }}
                        >
                            {/* The Ruler Track */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-stone-100" />
                            
                            {/* Dynamic Ticks: 1 line per order (up to 50 for performance) */}
                            <div className="absolute inset-0 flex flex-col justify-between py-2">
                                {[...Array(Math.max(1, Math.min(total, 50)))].map((_, i) => {
                                    const tickCount = Math.max(1, Math.min(total, 50));
                                    const tickProgress = tickCount <= 1 ? 0.5 : i / (tickCount - 1);
                                    const handleProgress = total <= 1 ? 0.5 : safeIndex / (total - 1);
                                    const distance = Math.abs(tickProgress - handleProgress);
                                    
                                    const isMajor = i % 5 === 0;
                                    const proximity = Math.pow(Math.max(0, 1 - distance * 6), 2);
                                    
                                    return (
                                        <div 
                                            key={i}
                                            style={{ 
                                                width: isMajor 
                                                    ? `${12 + proximity * 12}px` 
                                                    : `${5 + proximity * 6}px`,
                                                height: '1.2px',
                                                backgroundColor: proximity > 0.4 ? "#000000" : "#d6d3d1",
                                                opacity: 0.15 + proximity * 0.85,
                                                transform: `translateX(${proximity * 1}px)`,
                                                transition: 'width 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, opacity 0.2s'
                                            }}
                                            className="rounded-full mx-auto"
                                        />
                                    );
                                })}
                            </div>

                            {/* The Floating Thumb */}
                            <motion.div
                                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                                animate={{ top: `${handlePercent}%` }}
                                transition={{ type: 'spring', stiffness: 600, damping: 40 }}
                                style={{ marginTop: '-12px' }}
                            >
                                <div className="w-full h-6 flex items-center justify-center relative">
                                    <motion.div 
                                        className="w-6 h-6 rounded-full bg-black border-[3.5px] border-white shadow-2xl flex items-center justify-center pointer-events-auto cursor-grab active:cursor-grabbing"
                                        onPointerDown={(e) => {
                                            e.preventDefault();
                                            e.currentTarget.setPointerCapture(e.pointerId);
                                            isDraggingHandle.current = true;
                                        }}
                                    >
                                        <div className="w-1 h-1 bg-white rounded-full opacity-40 shrink-0" />
                                    </motion.div>
                                    <div className="absolute left-[calc(50%+16px)] w-3 h-[1.5px] bg-black rounded-full" />
                                </div>
                            </motion.div>
                        </div>

                        {/* Lower Control */}
                        <motion.button 
                            whileTap={{ scale: 0.7 }}
                            onClick={() => {
                                if (safeIndex < total - 1) {
                                    setCurrentIndex(safeIndex + 1);
                                    window.navigator.vibrate?.(10);
                                }
                            }}
                            className="mt-6 text-stone-300 hover:text-stone-900 transition-colors"
                        >
                            <ChevronDown size={20} strokeWidth={2.5} />
                        </motion.button>
                        
                        <div className="mt-4 flex flex-col items-center bg-white px-2.5 py-1.5 rounded-xl shadow-sm border border-stone-100">
                            <span className="text-[11px] font-[900] text-stone-900 tabular-nums leading-none">
                                {safeIndex + 1}
                            </span>
                            <div className="w-4 h-[1px] bg-stone-100 my-1" />
                            <span className="text-[8px] font-bold text-stone-300 uppercase tracking-widest leading-none">
                                {total}
                            </span>
                        </div>
                    </div>

                    {/* ── SWIPEABLE BENTO CARD STACK ── */}
                    <div
                        ref={swipeAreaRef}
                        className="flex-1 relative overflow-hidden rounded-[32px] shadow-2xl shadow-stone-900/5 border border-white/20"
                        style={{ touchAction: 'none' }}
                    >
                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={`${activeTab}-${safeIndex}`}
                                initial={{ y: "10%" , opacity: 0, scale: 0.95 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: "-10%", opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0"
                            >
                                <OrderCard
                                    order={displayOrders[safeIndex]}
                                    tableName={getTableName(displayOrders[safeIndex])}
                                    indexLabel={`${safeIndex + 1} / ${total}`}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
}
