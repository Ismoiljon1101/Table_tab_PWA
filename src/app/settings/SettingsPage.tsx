import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/atoms/Button';
import { UserRole } from '../../types/enums';
import { LogOut, LayoutDashboard, Bell, Palette, Languages, HelpCircle, Shield } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StandardPageTemplate } from '../../components/templates/StandardPageTemplate';
import { ProfileCard } from '../../components/molecules/ProfileCard';
import { RestaurantInfo } from '../../components/molecules/RestaurantInfo';
import { SettingGroup } from '../../components/molecules/SettingGroup';
import { SettingItem } from '../../components/atoms/SettingItem';

/**
 * SettingsPage
 * Overhauled with premium iOS-style grouped layout.
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

    return (
        <StandardPageTemplate header={null}>
            <div className="flex flex-col gap-8 pb-10">
                {/* Profile Section */}
                <ProfileCard
                    nickname={user?.nickname || 'User'}
                    email={user?.email || ''}
                    isAdmin={isAdmin}
                />

                {/* Workspace Section */}
                <RestaurantInfo
                    name={restaurant?.name || 'Not set'}
                    id={restaurant?._id}
                    isAdmin={isAdmin}
                    copied={copied}
                    onCopyId={handleCopyId}
                />

                {/* Management Group */}
                {isAdmin && (
                    <SettingGroup title="Management">
                        <SettingItem 
                            icon={<LayoutDashboard size={18} />}
                            label="Admin Dashboard"
                            value="Menu, Tables & Staff"
                            onClick={() => navigate('/admin/manage')}
                        />
                        <SettingItem 
                            icon={<Shield size={18} />}
                            label="Permissions"
                            value="Manage Roles"
                            onClick={() => {}}
                        />
                    </SettingGroup>
                )}

                {/* App Settings Group */}
                <SettingGroup title="Preferences">
                    <SettingItem 
                        icon={<Bell size={18} />}
                        label="Notifications"
                        value="Enabled"
                        onClick={() => {}}
                    />
                    <SettingItem 
                        icon={<Palette size={18} />}
                        label="Appearance"
                        value="System Default"
                        onClick={() => {}}
                    />
                    <SettingItem 
                        icon={<Languages size={18} />}
                        label="Language"
                        value="English (US)"
                        onClick={() => {}}
                    />
                </SettingGroup>

                {/* Support Group */}
                <SettingGroup title="Support">
                    <SettingItem 
                        icon={<HelpCircle size={18} />}
                        label="Help Center"
                        onClick={() => {}}
                    />
                </SettingGroup>

                {/* Account Actions */}
                <div className="mt-2">
                    <SettingGroup>
                        <SettingItem 
                            icon={<LogOut size={18} />}
                            label="Sign Out"
                            variant="danger"
                            showChevron={false}
                            onClick={logout}
                        />
                    </SettingGroup>
                </div>

                <div className="flex flex-col items-center gap-1 mt-4">
                    <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em]">TableTap Ecosystem</p>
                    <p className="text-[10px] text-stone-400">Version 1.0.0 (Stable)</p>
                </div>
            </div>
        </StandardPageTemplate>
    );
}
