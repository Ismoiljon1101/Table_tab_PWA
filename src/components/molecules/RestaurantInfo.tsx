import { Building2, Copy, Check } from 'lucide-react';

interface RestaurantInfoProps {
    name: string;
    id?: string;
    isAdmin: boolean;
    copied: boolean;
    onCopyId: () => void;
}

/**
 * RestaurantInfo molecule
 * Displays restaurant name and ID (for admins).
 */
export function RestaurantInfo({ name, id, isAdmin, copied, onCopyId }: RestaurantInfoProps) {
    return (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-xl shadow-sm border border-stone-100 animate-slide-up">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-stone-50 text-stone-500">
                    <Building2 size={20} />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-base font-medium text-stone-900">Restaurant</h4>
                    <p className="text-sm text-stone-500">{name || 'Not set'}</p>
                </div>
            </div>

            {/* Display Restaurant ID for Admins/Owners to share with waiters */}
            {isAdmin && id && (
                <div className="flex flex-col gap-1.5 mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Restaurant ID</span>
                    <div className="flex items-center justify-between gap-2">
                        <code className="text-xs text-stone-700 font-mono bg-white px-2 py-1 rounded border border-stone-200 truncate flex-1">
                            {id}
                        </code>
                        <button
                            onClick={onCopyId}
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
    );
}
