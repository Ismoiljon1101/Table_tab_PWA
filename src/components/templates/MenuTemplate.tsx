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
        <div className="flex flex-col h-full bg-[#fafafa]">
            {/* Sticky Header Container with Glass Effect */}
            <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
                {header}
                {tabs}
            </div>

            <main className="flex-1 px-4 py-5 pb-36 max-w-[1400px] mx-auto w-full animate-fade-in">
                {children}
            </main>

            {cartTrigger && (
                <div className="fixed bottom-[calc(76px+env(safe-area-inset-bottom,0px))] inset-x-4 z-50">
                    {cartTrigger}
                </div>
            )}

            {bottomSheet}
        </div>
    );
}
