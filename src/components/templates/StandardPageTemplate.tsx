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
        <div className="flex flex-col min-h-full">
            {header && (
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-100 shadow-sm shadow-stone-100/50">
                    {header}
                </div>
            )}
            
            <div className="flex-1 p-4 pb-24 animate-fade-in">
                {children}
            </div>
        </div>
    );
}
