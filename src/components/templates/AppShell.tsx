import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Settings } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import './AppShell.css';

/**
 * Main app layout with sticky header and bottom navigation.
 * Wraps all authenticated pages.
 */
export function AppShell() {
    const user = useAuthStore((s) => s.user);
    const restaurant = useAuthStore((s) => s.restaurant);
    const cartCount = useCartStore((s) => s.totalItems());
    const location = useLocation();

    /** Determine page title from route */
    const getTitle = (): string => {
        if (location.pathname.startsWith('/menu')) return 'Menu';
        if (location.pathname.startsWith('/orders')) return 'Orders';
        if (location.pathname.startsWith('/settings')) return 'Settings';
        return restaurant?.name || 'TableTap';
    };

    return (
        <div className="app-shell">
            {/* Header */}
            <header className="app-shell__header">
                <h1 className="app-shell__title">{getTitle()}</h1>
                {cartCount > 0 && (
                    <NavLink to="/menu" className="app-shell__cart-badge">
                        {cartCount}
                    </NavLink>
                )}
                <div className="app-shell__avatar" title={user?.nickname || ''}>
                    {user?.nickname?.charAt(0).toUpperCase() || 'U'}
                </div>
            </header>

            {/* Page Content */}
            <main className="app-shell__content">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="app-shell__nav">
                <NavLink to="/" end className="nav-item">
                    <LayoutGrid size={22} />
                    <span>Floor</span>
                </NavLink>
                <NavLink to="/orders" className="nav-item">
                    <ClipboardList size={22} />
                    <span>Orders</span>
                </NavLink>
                <NavLink to="/settings" className="nav-item">
                    <Settings size={22} />
                    <span>Settings</span>
                </NavLink>
            </nav>
        </div>
    );
}
