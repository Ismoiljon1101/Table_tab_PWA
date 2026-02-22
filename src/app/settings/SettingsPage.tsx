import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/atoms/Button';
import { UserRole } from '../../types/enums';
import { LogOut, ChefHat, User, Building2 } from 'lucide-react';
import './SettingsPage.css';

/**
 * Settings page — user profile, restaurant info, logout.
 * Admin features (menu/table CRUD) can be expanded here.
 */
export function SettingsPage() {
    const { user, restaurant, logout } = useAuthStore();

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    return (
        <div className="settings-page">
            {/* Profile Card */}
            <div className="settings-card animate-fade-in">
                <div className="settings-avatar">
                    <User size={24} />
                </div>
                <div className="settings-profile">
                    <h3 className="settings-profile__name">{user?.nickname || 'User'}</h3>
                    <p className="settings-profile__email">{user?.email}</p>
                    <span className="settings-profile__role">
                        {isAdmin ? '👑 Admin' : '🙋 Waiter'}
                    </span>
                </div>
            </div>

            {/* Restaurant Info */}
            <div className="settings-card animate-slide-up">
                <div className="settings-card__icon">
                    <Building2 size={20} />
                </div>
                <div className="settings-card__content">
                    <h4>Restaurant</h4>
                    <p>{restaurant?.name || 'Not set'}</p>
                </div>
            </div>

            {/* Admin Settings */}
            {isAdmin && (
                <div className="settings-section animate-slide-up">
                    <h4 className="settings-section__title">Management</h4>
                    <div className="settings-card">
                        <div className="settings-card__icon">
                            <ChefHat size={20} />
                        </div>
                        <div className="settings-card__content">
                            <h4>Menu & Tables</h4>
                            <p>Manage menu items, categories, and tables</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="settings-logout">
                <Button variant="ghost" fullWidth onClick={logout}>
                    <LogOut size={18} />
                    Sign Out
                </Button>
            </div>

            <p className="settings-version">TableTap v1.0.0</p>
        </div>
    );
}
