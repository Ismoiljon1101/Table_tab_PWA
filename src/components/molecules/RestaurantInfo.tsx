import { Building2, Copy, Check, Hash } from 'lucide-react';

interface RestaurantInfoProps {
    name: string;
    id?: string;
    isAdmin: boolean;
    copied: boolean;
    onCopyId: () => void;
}

/**
 * RestaurantInfo molecule
 * Displays restaurant name and ID in a premium grouped layout.
 */
export function RestaurantInfo({ name, id, isAdmin, copied, onCopyId }: RestaurantInfoProps) {
    return (
        <div className="flex flex-col gap-4 p-5 bg-white rounded-3xl shadow-sm border border-stone-100 animate-slide-up [animation-delay:100ms]">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-xl bg-stone-50 text-stone-400">
                    <Building2 size={24} />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Workspace</h4>
                    <p className="text-lg font-semibold text-stone-900 truncate tracking-tight">{name || 'Unnamed Venue'}</p>
                </div>
            </div>

            {/* Display Restaurant ID for Admins/Owners to share with staff */}
            {isAdmin && id && (
                <div className="flex flex-col gap-2 p-3.5 bg-stone-50/50 border border-stone-100 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                        <Hash size={12} className="text-amber-500" />
                        <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Restaurant ID</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3">
                        <code className="text-xs text-stone-600 font-mono bg-white/80 px-3 py-2 rounded-xl border border-stone-100 truncate flex-1 shadow-sm">
                            {id}
                        </code>
                        <button
                            onClick={onCopyId}
                            className={`
                                flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-xl transition-all duration-200
                                ${copied ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-stone-600 border-stone-100 shadow-sm active:scale-95'}
                                border
                            `}
                            title="Copy ID"
                        >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed px-1">
                        Give this ID to your staff so they can join this restaurant.
                    </p>
                </div>
            )}
        </div>
    );
}
