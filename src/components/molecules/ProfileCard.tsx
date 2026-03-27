import { User, ShieldCheck, UserCircle } from 'lucide-react';

interface ProfileCardProps {
    nickname: string;
    email: string;
    isAdmin: boolean;
}

/**
 * ProfileCard molecule
 * Displays user nickname, email, and role in a premium layout.
 */
export function ProfileCard({ nickname, email, isAdmin }: ProfileCardProps) {
    return (
        <div className="flex items-center gap-4 p-5 bg-white rounded-3xl shadow-sm border border-stone-100 animate-slide-up">
            <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                <User size={32} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900 truncate uppercase tracking-tight">
                        {nickname || 'User'}
                    </h3>
                    {isAdmin && (
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-amber-600" title="Admin">
                            <ShieldCheck size={12} />
                        </div>
                    )}
                </div>
                <p className="text-sm text-stone-500 truncate mb-1">{email}</p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-50 border border-stone-100">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-amber-500' : 'bg-stone-400'}`} />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                        {isAdmin ? 'System Admin' : 'Staff Member'}
                    </span>
                </div>
            </div>
        </div>
    );
}
