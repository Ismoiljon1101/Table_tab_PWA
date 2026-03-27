import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/atoms/Button';
import { UserRole } from '../../types/enums';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardPageTemplate } from '../../components/templates/StandardPageTemplate';
import { ProfileCard } from '../../components/molecules/ProfileCard';
import { RestaurantInfo } from '../../components/molecules/RestaurantInfo';
import { ManagementLink } from '../../components/molecules/ManagementLink';

/**
 * SettingsPage
 * Refactored to use Atomic Design (Templates, Molecules).
 */
export function SettingsPage() {
    const { user, restaurant, logout } = useAuthStore();
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const isAdmin = user?.role === UserRole.OWNER || user?.role === UserRole.ADMIN;

    const handleCopyId = async () => {
        if (restaurant?._id) {
            try {
                await navigator.clipboard.writeText(restaurant._id);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy text:', err);
            }
        }
    };

    const header = (
        <div className="px-4 py-3">
            <h2 className="text-xl font-bold text-stone-900">Settings</h2>
        </div>
    );

    return (
        <StandardPageTemplate header={header}>
            <div className="flex flex-col gap-4">
                <ProfileCard
                    nickname={user?.nickname || 'User'}
                    email={user?.email || ''}
                    isAdmin={isAdmin}
                />

                <RestaurantInfo
                    name={restaurant?.name || 'Not set'}
                    id={restaurant?._id}
                    isAdmin={isAdmin}
                    copied={copied}
                    onCopyId={handleCopyId}
                />

                {isAdmin && (
                    <ManagementLink
                        onClick={() => navigate('/admin/manage')}
                    />
                )}

                <div className="mt-6 mb-4">
                    <Button variant="ghost" fullWidth onClick={logout}>
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                    </Button>
                </div>

                <p className="text-center text-xs text-stone-400 mt-2">TableTap v1.0.0</p>
            </div>
        </StandardPageTemplate>
    );
}
