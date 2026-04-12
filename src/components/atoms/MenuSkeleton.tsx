/**
 * MenuSkeleton atom
 * Provides a shimmering loading state for menu item cards.
 */
export function MenuSkeleton() {
    return (
        <div className="flex items-center gap-2 p-2 bg-white/50 rounded-xl border border-stone-100/50 animate-pulse">
            <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
            <div className="w-10 h-10 bg-stone-100 rounded-lg" />
        </div>
    );
}
