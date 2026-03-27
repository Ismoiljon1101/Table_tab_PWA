import React from 'react';
import { RectangleHorizontal, RectangleVertical, X } from 'lucide-react';

interface AlignmentPickerProps {
    onSelect: (orientation: 'H' | 'V') => void;
    onClose: () => void;
    tableName: string;
}

/**
 * AlignmentPicker molecule
 * A premium, tactile selection modal for table orientation.
 */
export function AlignmentPicker({ onSelect, onClose, tableName }: AlignmentPickerProps) {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-xs bg-white rounded-[2.5rem] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-stone-900 leading-tight">Table {tableName}</h3>
                        <p className="text-stone-500 text-sm italic">Choose alignment</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 -mr-2 bg-stone-100 rounded-full text-stone-400 active:scale-90 transition-transform"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => onSelect('H')}
                        className="flex flex-col items-center gap-3 p-5 bg-stone-50 border-2 border-stone-100 rounded-3xl text-stone-700 font-bold active:scale-95 active:bg-amber-50 active:border-amber-200 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 group-active:border-amber-200">
                            <RectangleHorizontal size={24} className="text-amber-500" />
                        </div>
                        <span className="text-sm">Horizontal</span>
                    </button>

                    <button
                        onClick={() => onSelect('V')}
                        className="flex flex-col items-center gap-3 p-5 bg-stone-50 border-2 border-stone-100 rounded-3xl text-stone-700 font-bold active:scale-95 active:bg-amber-50 active:border-amber-200 transition-all group"
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-stone-100 group-active:border-amber-200">
                            <RectangleVertical size={24} className="text-amber-500" />
                        </div>
                        <span className="text-sm">Vertical</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-[11px] text-stone-400 font-medium uppercase tracking-widest">
                    Table Setup
                </p>
            </div>
        </div>
    );
}
