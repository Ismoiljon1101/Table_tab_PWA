import { useEffect, useState, useRef, useCallback } from 'react';
import { useOrdersStore } from '../../stores/ordersStore';
import { OrderStatus } from '../../types/enums';
import type { Order, Table } from '../../types';
import { OrderCard } from '../../components/molecules/OrderCard';

/**
 * OrdersPage — Fullscreen swipeable order viewer.
 * Left rail has a single draggable scrubber handle (like a book page-edge).
 * Drag the handle up/down to scrub through orders in real time.
 * Also supports swipe gestures on the card area.
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

    useEffect(() => {
        setCurrentIndex(0);
    }, [activeTab, orders.length]);

    const activeOrders = orders.filter((o) => o.status !== OrderStatus.SERVED && o.status !== OrderStatus.CANCELLED);
    const finishedOrders = orders.filter((o) => o.status === OrderStatus.SERVED);
    const cancelledOrders = orders.filter((o) => o.status === OrderStatus.CANCELLED);

    const displayOrders = 
        activeTab === 'active' ? activeOrders : 
        activeTab === 'finished' ? finishedOrders : 
        cancelledOrders;

    const total = displayOrders.length;

    const getTableName = (order: Order): string => {
        if (typeof order.tableId === 'object' && order.tableId !== null) {
            return (order.tableId as Table).displayName || (order.tableId as Table).name;
        }
        return 'Table';
    };

    /**
     * Convert a Y position within the track to an order index.
     * Clamps to [0, total-1].
     */
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

    /** Handle position as a percentage (0–100) along the track */
    const handlePercent = total <= 1 ? 0 : (currentIndex / (total - 1)) * 100;

    // ── SCRUBBER HANDLE DRAG (pointer events — works for mouse & touch) ──
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

    // ── SWIPE ON CARD AREA (prevent pull-to-refresh) ──
    useEffect(() => {
        const el = swipeAreaRef.current;
        if (!el) return;

        const onTouchStart = (e: TouchEvent) => {
            swipeTouchStartY.current = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault(); // blocks browser pull-to-refresh
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
                <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-amber-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex flex-col" style={{ height: 'calc(100dvh - 120px)' }}>
            {/* Tab Toggle */}
            <div className="flex bg-stone-100 p-1 rounded-[20px] gap-1 mx-4 mt-4 mb-3 flex-shrink-0">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[16px] transition-all ${
                        activeTab === 'active' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
                    }`}
                >
                    Active ({activeOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('finished')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[16px] transition-all ${
                        activeTab === 'finished' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
                    }`}
                >
                    Finished ({finishedOrders.length})
                </button>
                <button
                    onClick={() => setActiveTab('cancelled')}
                    className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-[16px] transition-all ${
                        activeTab === 'cancelled' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
                    }`}
                >
                    Cancelled ({cancelledOrders.length})
                </button>
            </div>

            {displayOrders.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 px-4 text-center opacity-30">
                    <span className="text-5xl">📋</span>
                    <h3 className="text-lg font-black text-stone-900 uppercase">
                        No {activeTab} orders
                    </h3>
                </div>
            ) : (
                <div className="flex flex-1 gap-0 px-4 pb-6 overflow-hidden min-h-0">

                    {/* ── LEFT SCRUBBER RAIL ── */}
                    <div className="flex-shrink-0 w-7 flex flex-col items-center mr-3 relative py-2">
                        {/* Track background */}
                        <div
                            ref={trackRef}
                            className="relative w-[3px] flex-1 bg-stone-200 rounded-full"
                        >
                            {/* Filled portion above handle */}
                            <div
                                className="absolute top-0 left-0 w-full bg-stone-900 rounded-full transition-all duration-150"
                                style={{ height: `${handlePercent}%` }}
                            />

                            {/* The draggable handle / thumb */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-900 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing touch-none select-none"
                                style={{ top: `${handlePercent}%` }}
                                onPointerDown={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    isDraggingHandle.current = true;
                                }}
                            />
                        </div>

                        {/* Order counter below rail */}
                        <span className="text-[10px] font-black text-stone-400 tabular-nums mt-2">
                            {currentIndex + 1}/{total}
                        </span>
                    </div>

                    {/* ── SWIPEABLE CARD STACK ── */}
                    <div
                        ref={swipeAreaRef}
                        className="flex-1 relative overflow-hidden rounded-[24px]"
                        style={{ touchAction: 'none' }}
                    >
                        {displayOrders.map((order, idx) => (
                            <div
                                key={order._id}
                                className="absolute inset-0 transition-transform duration-300 ease-out"
                                style={{
                                    transform: `translateY(${(idx - currentIndex) * 100}%)`,
                                }}
                            >
                                <OrderCard
                                    order={order}
                                    tableName={getTableName(order)}
                                    indexLabel={`${idx + 1} / ${total}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
