import { User } from 'lucide-react';

interface ProfileCardProps {
    nickname: string;
    email: string;
    isAdmin: boolean;
}

/**
 * ProfileCard molecule
 * Displays user nickname, email, and role.
 */
export function ProfileCard({ nickname, email, isAdmin }: ProfileCardProps) {
    return (
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-stone-100 animate-fade-in">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-full bg-amber-50 text-amber-600">
                <User size={24} />
            </div>
            <div className="flex flex-col gap-px">
                <h3 className="text-base font-semibold text-stone-900">{nickname || 'User'}</h3>
                <p className="text-sm text-stone-500">{email}</p>
                <span className="text-xs text-stone-600 mt-0.5">
                    {isAdmin ? '👑 Admin' : '🙋 Waiter'}
                </span>
            </div>
        </div>
    );
}
