import React from 'react';

interface MenuTemplateProps {
    header: React.ReactNode;
    tabs: React.ReactNode;
    children: React.ReactNode;
    cartTrigger?: React.ReactNode;
    bottomSheet?: React.ReactNode;
}

/**
 * MenuTemplate
 * Layout template for the menu browsing page.
 */
export function MenuTemplate({ header, tabs, children, cartTrigger, bottomSheet }: MenuTemplateProps) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="sticky top-0 z-40 bg-white border-b border-stone-100">
                {header}
                {tabs}
            </div>

            <main className="flex-1 px-4 py-3 pb-32">
                {children}
            </main>

            {cartTrigger && (
                <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] inset-x-4 z-50 animate-slide-up">
                    {cartTrigger}
                </div>
            )}

            {bottomSheet}
        </div>
    );
}
