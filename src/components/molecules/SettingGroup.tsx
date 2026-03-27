import React from 'react';

interface SettingGroupProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * SettingGroup molecule
 * Wraps a list of items in a premium, rounded container with a title.
 */
export function SettingGroup({ title, children, className = '' }: SettingGroupProps) {
    return (
        <div className={`flex flex-col gap-1.5 ${className} animate-fade-in`}>
            {title && (
                <h3 className="px-4 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                    {title}
                </h3>
            )}
            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm divide-y divide-stone-50">
                {children}
            </div>
        </div>
    );
}
