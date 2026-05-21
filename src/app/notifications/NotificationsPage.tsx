import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Trash2 } from 'lucide-react';
import { StandardPageTemplate } from '../../components/templates/StandardPageTemplate';
import { Button } from '../../components/atoms/Button';

/**
 * NotificationsPage
 * Displays a list of user/system notifications.
 */
export function NotificationsPage() {
    const navigate = useNavigate();

    // Placeholder notifications state — empty as real-time is in development
    const [notifications, setNotifications] = React.useState([]);

    const header = (
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <div className="flex items-center gap-3">
                <button
                    className="flex items-center justify-center w-9 h-9 rounded-lg text-stone-900 active:bg-stone-100 transition-colors"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-stone-900">Notifications</h2>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded-md uppercase tracking-wider">
                        BETA
                    </span>
                </div>
            </div>
        </div>
    );

    return (
        <StandardPageTemplate header={header}>
            <div className="flex flex-col gap-4 py-8 px-2">
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white border border-stone-200/60 rounded-[32px] shadow-sm">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-5 animate-[pulse_2s_infinite]">
                        <Bell size={32} />
                    </div>
                    <h3 className="text-stone-900 font-black text-lg mb-2 uppercase tracking-tighter">
                        Real-time alerts coming soon
                    </h3>
                    <p className="text-stone-500 text-xs max-w-[240px] leading-relaxed mb-6 font-medium">
                        We're currently building our instant notification system to sync order updates, kitchen calls, and table alerts directly to your device.
                    </p>
                    <div className="px-3 py-1 bg-amber-50 rounded-full text-[9px] font-black text-amber-700 uppercase tracking-widest border border-amber-100 animate-pulse">
                        In Development
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    size="sm" 
                    fullWidth 
                    className="text-stone-400 font-bold uppercase tracking-wider text-[11px]"
                    onClick={() => navigate(-1)}
                >
                    Back to previous page
                </Button>
            </div>
        </StandardPageTemplate>
    );
}
