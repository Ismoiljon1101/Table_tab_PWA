import { ChefHat } from 'lucide-react';

interface ManagementLinkProps {
    onClick: () => void;
}

/**
 * ManagementLink molecule
 * Link card for navigating to the admin management page.
 */
export function ManagementLink({ onClick }: ManagementLinkProps) {
    return (
        <div className="mt-2 animate-slide-up">
            <h4 className="text-sm font-semibold text-stone-400 uppercase tracking-wide mb-2 px-1">Management</h4>
            <div
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-stone-100 cursor-pointer active:scale-[0.98] transition-all"
                onClick={onClick}
            >
                <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-lg bg-stone-50 text-stone-500">
                    <ChefHat size={20} />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-base font-medium text-stone-900">Menu & Tables</h4>
                    <p className="text-sm text-stone-500">Manage menu items, categories, and tables</p>
                </div>
            </div>
        </div>
    );
}
