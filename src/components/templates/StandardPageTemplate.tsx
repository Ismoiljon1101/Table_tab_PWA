import React from 'react';

interface StandardPageTemplateProps {
    header: React.ReactNode;
    children: React.ReactNode;
}

/**
 * StandardPageTemplate
 * A versatile layout for pages that don't require specialized features like tabs or bottom sheets.
 */
export function StandardPageTemplate({ header, children }: StandardPageTemplateProps) {
    return (
        <div className="flex flex-col min-h-screen bg-stone-50/30">
            <div className="sticky top-14 z-40 bg-white shadow-sm shadow-stone-100">
                {header}
            </div>
            
            <main className="flex-1 p-4 pb-24 overflow-y-auto animate-fade-in">
                {children}
            </main>
        </div>
    );
}
