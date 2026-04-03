import type { Table } from '../../types';

interface TableActionSheetProps {
    table: Table;
    onClose: () => void;
    onAddMenu: () => void;
    onNewCustomer: () => void;
    onCancelOrder: () => void;
}

/**
 * TableActionSheet organism
 * Bottom sheet for interacting with an occupied table.
 */
export function TableActionSheet({ table, onClose, onAddMenu, onNewCustomer, onCancelOrder }: TableActionSheetProps) {
    return (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-[480px] bg-white rounded-t-3xl p-5 pb-[calc(24px+env(safe-area-inset-bottom))] animate-slide-up" onClick={(e) => e.stopPropagation()}>
                <div className="w-9 h-1 rounded-full bg-stone-300 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-center mb-1 text-stone-900">
                    {table.displayName || table.name}
                </h3>
                <p className="text-sm text-stone-500 text-center mb-6">This table has an active order</p>

                <div className="flex flex-col gap-2">
                    <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl bg-amber-50 text-amber-700 font-semibold transition-all duration-200 active:scale-95 active:bg-amber-100" 
                        onClick={onAddMenu}
                    >
                        <span className="text-xl">📋</span>
                        <span>Add-ons</span>
                    </button>
                    <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-stone-800 font-medium transition-all duration-200 active:scale-95 active:bg-stone-100" 
                        onClick={onNewCustomer}
                    >
                        <span className="text-xl">👋</span>
                        <span>New Customer</span>
                    </button>
                    <button 
                        className="flex items-center gap-3 w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-red-600 font-medium transition-all duration-200 active:scale-95 active:bg-red-50" 
                        onClick={onCancelOrder}
                    >
                        <span className="text-xl">❌</span>
                        <span>Cancel Order</span>
                    </button>
                </div>

                <button 
                    className="w-full mt-4 p-3 text-stone-500 font-medium rounded-xl active:bg-stone-50 transition-colors" 
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
