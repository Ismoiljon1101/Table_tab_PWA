import React from 'react';

interface AdminDashboardTemplateProps {
    header: React.ReactNode;
    tabs: React.ReactNode;
    children: React.ReactNode;
}

/**
 * AdminDashboardTemplate
 * Layout template for the admin management pages.
 */
export function AdminDashboardTemplate({ header, tabs, children }: AdminDashboardTemplateProps) {
    return (
        <div className="flex flex-col h-full bg-stone-50/30 overflow-hidden">
            {/* Template-level header section - Sticky at very top since AppShell header is hidden */}
            <div className="sticky top-0 z-40 bg-white border-b border-stone-100">
                {header}
                {tabs}
            </div>
            
            {/* Scrollable content area */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto scroll-smooth animate-fade-in">
                {children}
            </main>
        </div>
    );
}
