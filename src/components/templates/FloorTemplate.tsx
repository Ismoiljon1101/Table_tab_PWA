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
        <div className="flex flex-col h-full bg-stone-50/30 overflow-hidden">
            {/* Sub-Header (Sections & Info) - 12vh (Total Info budget with AppShell is 20vh) */}
            <div className="h-[12vh] bg-white shadow-sm shadow-stone-100 overflow-hidden flex flex-col justify-center">
                <div className="flex-1 flex flex-col justify-center">
                    {header}
                </div>
                {stats && (
                    <div className="px-4 pb-2">
                        {stats}
                    </div>
                )}
            </div>

            {/* Main Floor Area - 70vh */}
            <main className="h-[70vh] flex items-center justify-center p-2 relative overflow-hidden">
                {/* 
                  LAYOUT NOTE: 
                  - Width is strictly 95% of screen.
                  - Height is strictly 70% of screen.
                  - Scrolling is disabled (Fixed Dashboard).
                  - TODO: Add internal scrolling here if requested in the future.
                */}
                <div className="w-[95%] h-full bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden flex items-center justify-center">
                    {children}
                </div>
            </main>

            {actionSheet}
        </div>
    );
}
