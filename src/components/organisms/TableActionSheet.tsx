import { Loader2 } from 'lucide-react';
import type { Table } from '../../types';

interface TableActionSheetProps {
    table: Table;
    onClose: () => void;
    onAddMenu: () => void;
    onNewCustomer: () => void;
    onCancelOrder: () => void;
    isLoading?: boolean;
}

/**
 * TableActionSheet organism
 * Bottom sheet for interacting with an occupied table.
 */
export function TableActionSheet({ 
    table, 
    onClose, 
    onAddMenu, 
    onNewCustomer, 
    onCancelOrder,
    isLoading = false
}: TableActionSheetProps) {
    return (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-end justify-center animate-fade-in pointer-events-auto" onClick={onClose}>
            <div className={`w-full max-w-[480px] bg-white rounded-t-3xl p-5 pb-[calc(24px+env(safe-area-inset-bottom))] animate-slide-up ${isLoading ? 'pointer-events-none opacity-80' : ''}`} onClick={(e) => e.stopPropagation()}>
                <div className="w-9 h-1 rounded-full bg-stone-300 mx-auto mb-5" />
                
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-stone-900 flex items-center justify-center gap-2">
                        {table.displayName || table.name}
                        {table.currentOrderId ? (
                            <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                Order Active
                            </span>
                        ) : (
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                No Order ID (Stuck)
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">
                        {isLoading ? 'Processing action...' : 'Active session in progress'}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <button 
                        disabled={isLoading}
                        className="group flex items-center justify-between w-full p-4 rounded-xl bg-amber-50 text-amber-700 font-bold transition-all duration-200 active:scale-95 active:bg-amber-100 disabled:opacity-50" 
                        onClick={onAddMenu}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">📋</span>
                            <span>Add-ons</span>
                        </div>
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    </button>

                    <button 
                        disabled={isLoading}
                        className="group flex items-center justify-between w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-stone-900 font-bold transition-all duration-200 active:scale-95 active:bg-stone-100 disabled:opacity-50" 
                        onClick={onNewCustomer}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">👋</span>
                            <span>New Customer</span>
                        </div>
                    </button>

                    <button 
                        disabled={isLoading}
                        className="group flex items-center justify-between w-full p-4 rounded-xl bg-stone-50 border border-stone-100 text-red-600 font-bold transition-all duration-200 active:scale-95 active:bg-red-50 disabled:opacity-50" 
                        onClick={onCancelOrder}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl group-hover:scale-110 transition-transform">❌</span>
                            <span>Cancel Order</span>
                        </div>
                    </button>
                </div>

                <button 
                    disabled={isLoading}
                    className="w-full mt-4 p-3 text-stone-500 font-bold rounded-xl active:bg-stone-50 transition-colors disabled:opacity-0" 
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
