import React from 'react';

interface FloorTemplateProps {
    header: React.ReactNode;
    stats?: React.ReactNode;
    children: React.ReactNode;
    actionSheet?: React.ReactNode;
}

/**
 * FloorTemplate
 * Layout template for the floor plan visualization page.
 */
export function FloorTemplate({ header, stats, children, actionSheet }: FloorTemplateProps) {
    return (
        <div className="flex flex-col h-full bg-[#fafafa] overflow-hidden">
            {/* Header Area */}
            <div className="flex-shrink-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                {header}
                {stats && <div className="px-4 pb-2">{stats}</div>}
            </div>

            {/* Main World Area */}
            <main className="flex-1 relative flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
                <div className="w-full h-full bg-white rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-stone-200/50 overflow-hidden relative">
                    {children}
                </div>
            </main>

            {/* Floatover UI */}
            <div className="fixed inset-0 pointer-events-none z-[100]">
                {actionSheet}
            </div>
        </div>
    );
}
