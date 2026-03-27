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

    // Placeholder notifications state
    const [notifications, setNotifications] = React.useState([
        {
            id: '1',
            title: 'Welcome to TableTap!',
            message: 'Start by setting up your floor plan in the management section.',
            time: '2 hours ago',
            read: false,
        },
        {
            id: '2',
            title: 'System Update',
            message: 'Menu categories now support custom codes for better organization.',
            time: '5 hours ago',
            read: true,
        }
    ]);

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
            
            <button 
                className="p-2 text-stone-400 active:text-red-500 transition-colors"
                onClick={() => setNotifications([])}
                title="Clear All"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );

    return (
        <StandardPageTemplate header={header}>
            <div className="flex flex-col gap-3 py-4">
                <div className="px-1 mb-2">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Real-time alerts coming soon</p>
                </div>
                
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                        <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                            <Bell size={32} className="text-stone-200" />
                        </div>
                        <h3 className="text-stone-900 font-bold mb-1">No notifications yet</h3>
                        <p className="text-stone-500 text-sm max-w-[240px]">
                            We'll let you know when there's something important for you.
                        </p>
                    </div>
                ) : (
                    notifications.map((notif) => (
                        <div 
                            key={notif.id}
                            className={`p-4 rounded-2xl border transition-all ${
                                notif.read 
                                ? 'bg-white border-stone-100 opacity-70' 
                                : 'bg-white border-amber-100 shadow-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-bold text-stone-900 text-sm">
                                    {notif.title}
                                </h4>
                                <span className="text-[10px] text-stone-400 font-medium">
                                    {notif.time}
                                </span>
                            </div>
                            <p className="text-xs text-stone-600 leading-relaxed">
                                {notif.message}
                            </p>
                        </div>
                    ))
                )}

                {notifications.length > 0 && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        fullWidth 
                        className="mt-4 text-stone-400"
                        onClick={() => navigate('/')}
                    >
                        Back to Home
                    </Button>
                )}
            </div>
        </StandardPageTemplate>
    );
}
