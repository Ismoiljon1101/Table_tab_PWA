import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/atoms/Button';
import { UserRole } from '../../types/enums';
import { LogOut, ChefHat, User, Building2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * Settings page — user profile, restaurant info, logout.
 * Admin features (menu/table CRUD) can be expanded here.
 */
export function SettingsPage() {
    const { user, restaurant, logout } = useAuthStore();
    const [copied, setCopied] = useState(false);

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
        <div className="flex flex-col gap-3 p-4 min-h-[100dvh]">
            {/* Profile Card */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-stone-100 animate-fade-in">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-amber-50 text-amber-600">
                    <User size={24} />
                </div>
                <div className="flex flex-col gap-px">
                    <h3 className="text-base font-semibold text-stone-900">{user?.nickname || 'User'}</h3>
                    <p className="text-sm text-stone-500">{user?.email}</p>
                    <span className="text-xs text-stone-600 mt-0.5">
                        {isAdmin ? '👑 Admin' : '🙋 Waiter'}
                    </span>
                </div>
            </div>

            {/* Restaurant Info */}
            <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm border border-stone-100 animate-slide-up">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-stone-50 text-stone-500">
                        <Building2 size={20} />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-base font-medium text-stone-900">Restaurant</h4>
                        <p className="text-sm text-stone-500">{restaurant?.name || 'Not set'}</p>
                    </div>
                </div>

                {/* Display Restaurant ID for Admins/Owners to share with waiters */}
                {isAdmin && restaurant?._id && (
                    <div className="flex flex-col gap-1.5 mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Restaurant ID</span>
                        <div className="flex items-center justify-between gap-2">
                            <code className="text-xs text-stone-700 font-mono bg-white px-2 py-1 rounded border border-stone-200 truncate flex-1">
                                {restaurant._id}
                            </code>
                            <button
                                onClick={handleCopyId}
                                className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md bg-white border border-stone-200 text-stone-600 active:bg-stone-100 transition-colors"
                                title="Copy ID"
                            >
                                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-[11px] text-stone-500">Share this ID with staff so they can join your workspace.</p>
                    </div>
                )}
            </div>

            {/* Admin Settings */}
            {isAdmin && (
                <div className="mt-2 animate-slide-up">
                    <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">Management</h4>
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-stone-100 cursor-pointer active:scale-[0.98] transition-all">
                        <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-stone-50 text-stone-500">
                            <ChefHat size={20} />
                        </div>
                        <div className="flex flex-col">
                            <h4 className="text-base font-medium text-stone-900">Menu & Tables</h4>
                            <p className="text-sm text-stone-500">Manage menu items, categories, and tables</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="mt-6 mb-4">
                <Button variant="ghost" fullWidth onClick={logout}>
                    <LogOut size={18} className="mr-2" />
                    Sign Out
                </Button>
            </div>

            <p className="text-center text-xs text-stone-400 mt-2">TableTap v1.0.0</p>
        </div>
    );
}
