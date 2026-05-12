import React from 'react';

interface AuthTemplateProps {
    header: React.ReactNode;
    modeSelector?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * AuthTemplate
 * Layout template for authentication pages, specialized for centered form layouts.
 */
export function AuthTemplate({ header, modeSelector, children }: AuthTemplateProps) {
    return (
        <div className="flex flex-col min-h-[100dvh] max-w-[400px] mx-auto p-6 pt-16 pb-10 overflow-y-auto">
            {header}
            {modeSelector}
            <div className="mt-8 animate-slide-up">
                {children}
            </div>
        </div>
    );
}
