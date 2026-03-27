import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Settings, Bell } from 'lucide-react';
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
    const navigate = useNavigate();

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

    return (
        <div className="flex flex-col h-[100dvh] max-w-[480px] mx-auto bg-orange-50 relative overflow-hidden">
            {/* Header - Fixed 8% of Viewport Height (Hidden on Management) */}
            {!isManagementPage && !isNotificationsPage && (
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
