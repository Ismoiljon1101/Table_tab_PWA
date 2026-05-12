import { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LayoutGrid, UtensilsCrossed, ShoppingCart, ClipboardList, Settings, Bell, Search, X } from 'lucide-react';
import { CartBottomSheet } from '../organisms/CartBottomSheet';
import { Toast } from '../atoms/Toast';
import api from '../../services/api';
import type { Table } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useSearchStore } from '../../stores/searchStore';
import { shapeIntoMongoId } from '../../libs/mongoId';

/**
 * Main app layout with sticky header and bottom navigation.
 * Wraps all authenticated pages.
 */
export function AppShell() {
    const user = useAuthStore((s) => s.user);
    const restaurant = useAuthStore((s) => s.restaurant);
    const cartCount = useCartStore((s) => s.totalItems());
    const search = useSearchStore();
    const location = useLocation();
    const navigate = useNavigate();

    const queryClient = useQueryClient();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const cart = useCartStore();
    const dismissToast = useCallback(() => setToast(null), []);

    useEffect(() => {
        const handleOpenCart = () => setIsCartOpen(true);
        window.addEventListener('open-cart', handleOpenCart);
        return () => window.removeEventListener('open-cart', handleOpenCart);
    }, []);

    // Close search when navigating away from menu
    useEffect(() => {
        if (!location.pathname.startsWith('/menu')) {
            search.closeSearch();
        }
    }, [location.pathname]);

    const currentFloorName = useAuthStore((s) => s.currentFloorName);
    const isFloorPage = location.pathname === '/';

    const getTitle = (): string => {
        if (location.pathname.startsWith('/menu')) return 'Menu';
        if (location.pathname.startsWith('/orders')) return 'Orders';
        if (location.pathname.startsWith('/settings')) return 'Settings';
        if (location.pathname.startsWith('/notifications')) return 'Notifications';
        if (isFloorPage && currentFloorName) return currentFloorName;
        return restaurant?.name || 'TableTap';
    };

    const isManagementPage = location.pathname.startsWith('/admin/manage');
    const isNotificationsPage = location.pathname === '/notifications';

    const handlePlaceOrder = async () => {
        if (cart.items.length === 0) return;
        setIsPlacingOrder(true);
        try {
            const cleanTableId = shapeIntoMongoId(cart.tableId);
            if (!cleanTableId) throw new Error('No table selected');

            const payload = {
                tableId: cleanTableId,
                items: cart.items.map((item: any) => ({
                    menuItemId: shapeIntoMongoId(item.menuItemId),
                    name: item.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    modifiers: item.modifiers || [],
                    notes: item.notes || ''
                }))
            };

            if (cart.editingOrderId) {
                await api.patch(`/orders/${cart.editingOrderId}`, {
                    items: payload.items,
                    baseUpdatedAt: cart.baseUpdatedAt
                });
            } else {
                await api.post('/orders', payload);
            }

            cart.clearCart();
            setIsCartOpen(false);

            // SUCCESS: Update React Query cache in background, no page reload
            queryClient.invalidateQueries({ queryKey: ['tables'] });
            setToast({ message: 'Order placed! ✓', type: 'success' });

            // Navigate via React Router — keeps app alive, preserves all cache
            navigate('/');
        } catch (err: any) {
            console.error('Failed to save order:', err);
            const raw = err?.response?.data?.message;
            const message = Array.isArray(raw) ? raw[0] : (raw || 'Failed to place order. Try again.');
            setToast({ message, type: 'error' });
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto bg-orange-50 relative overflow-hidden">
            {/* Header - Fixed 8% of Viewport Height (Hidden on Management) */}
            {!isManagementPage && !isNotificationsPage && (
                <header className="h-14 flex items-center px-4 bg-white/80 backdrop-blur-md border-b border-stone-100 gap-1.5 z-50 transition-all duration-300">
                    {search.isSearchVisible ? (
                        <div className="flex-1 flex items-center bg-stone-50 rounded-xl px-3 animate-fade-in group focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-200 transition-all">
                            <Search size={16} className="text-stone-400 group-focus-within:text-amber-600 transition-colors" />
                            <input
                                autoFocus
                                type="text"
                                value={search.query}
                                onChange={(e) => search.setQuery(e.target.value)}
                                placeholder="Search dishes..."
                                className="w-full h-8 bg-transparent border-none text-sm focus:outline-none px-2 text-stone-900"
                            />
                            <button 
                                onClick={search.toggleSearch}
                                className="text-stone-300 hover:text-stone-600 active:scale-90 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="flex-1 text-lg font-bold text-stone-900 truncate animate-fade-in">
                                {getTitle()}
                            </h1>

                            {location.pathname.startsWith('/menu') && (
                                <button
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 active:bg-amber-50 active:text-amber-600 transition-all"
                                    onClick={search.toggleSearch}
                                >
                                    <Search size={20} strokeWidth={2.5} />
                                </button>
                            )}

                            <button
                                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all group ${location.pathname === '/orders' ? 'bg-amber-50 text-amber-600' : 'bg-stone-50 text-stone-400 active:bg-stone-100'}`}
                                title="Orders"
                                onClick={() => navigate('/orders')}
                            >
                                <ClipboardList size={20} strokeWidth={2.5} />
                            </button>
                        </>
                    )}

                    <button
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-stone-50 text-stone-400 active:bg-stone-100 active:text-amber-600 transition-all group"
                        title="Notifications"
                        onClick={() => navigate('/notifications')}
                    >
                        <Bell size={20} strokeWidth={2.5} className="group-active:scale-110 transition-transform" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-amber-600 rounded-full border-2 border-white animate-pulse" />
                    </button>
                </header>
            )}

            {/* Page Content - Takes remaining space or specific budget in Templates */}
            <main className={`flex-1 ${isFloorPage || isManagementPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                <Outlet />
            </main>

            {/* Bottom Navigation - Fixed 10% of Viewport Height (Safe Area Aware) */}
            <nav className="h-[10vh] pb-[env(safe-area-inset-bottom,16px)] flex items-center justify-around bg-white border-t border-stone-100 z-50">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <LayoutGrid size={22} />
                    <span>Floor</span>
                </NavLink>

                <NavLink
                    to="/admin/manage"
                    state={{ activeTab: 'items' }}
                    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <UtensilsCrossed size={22} />
                    <span>Menu</span>
                </NavLink>

                <button
                    onClick={() => setIsCartOpen(true)}
                    className={`relative flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isCartOpen ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <div className="relative">
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span>Cart</span>
                </button>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <Settings size={22} />
                    <span>Settings</span>
                </NavLink>
            </nav>

            {isCartOpen && (
                <CartBottomSheet
                    onClose={() => setIsCartOpen(false)}
                    onPlaceOrder={handlePlaceOrder}
                    isPlacingOrder={isPlacingOrder}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onDismiss={dismissToast}
                />
            )}
        </div>
    );
}
