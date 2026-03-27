import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

/**
 * Main app layout with sticky header and bottom navigation.
 * Wraps all authenticated pages.
 */
export function AppShell() {
    const user = useAuthStore((s) => s.user);
    const restaurant = useAuthStore((s) => s.restaurant);
    const cartCount = useCartStore((s) => s.totalItems());
    const location = useLocation();

    const currentFloorName = useAuthStore((s) => s.currentFloorName);
    const isFloorPage = location.pathname === '/';

    const getTitle = (): string => {
        if (location.pathname.startsWith('/menu')) return 'Menu';
        if (location.pathname.startsWith('/orders')) return 'Orders';
        if (location.pathname.startsWith('/settings')) return 'Settings';
        if (isFloorPage && currentFloorName) return currentFloorName;
        return restaurant?.name || 'TableTap';
    };

    const isManagementPage = location.pathname.startsWith('/admin/manage');

    return (
        <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto bg-orange-50 relative overflow-hidden">
            {/* Header - Fixed 8% of Viewport Height (Hidden on Management) */}
            {!isManagementPage && (
                <header className="h-[8vh] flex items-center px-4 bg-white/80 backdrop-blur-md border-b border-stone-100 gap-3 z-50">
                    <h1 className="flex-1 text-lg font-bold text-stone-900 truncate">
                        {getTitle()}
                    </h1>

                    {cartCount > 0 && (
                        <NavLink
                            to="/menu"
                            className="flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full bg-amber-600 text-white text-xs font-bold animate-fade-in"
                        >
                            {cartCount}
                        </NavLink>
                    )}

                    <div
                        className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0"
                        title={user?.nickname || ''}
                    >
                        {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                    </div>
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
                    to="/orders"
                    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <ClipboardList size={22} />
                    <span>Orders</span>
                </NavLink>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => `flex flex-col items-center gap-0.5 px-4 py-1 text-[11px] font-medium transition-colors duration-150 active:scale-95 ${isActive ? 'text-amber-600' : 'text-stone-400'}`}
                >
                    <Settings size={22} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
}
